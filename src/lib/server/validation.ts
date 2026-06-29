import type { PostInput } from '$lib/server/repositories/posts';
import type { SubmissionInput } from '$lib/server/repositories/submissions';

const POST_STATUSES = new Set(['draft', 'seo_review', 'published']);
const POST_INTENTS = new Set(['informational', 'commercial']);
const POST_MONETIZATION = new Set(['editorial', 'guest_post', 'affiliate']);
const SUBMISSION_TYPES = new Set(['guest_post', 'sponsored', 'general']);
const SUBMISSION_STATUSES = new Set(['received', 'reviewing', 'accepted', 'rejected']);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const READ_TIME_RE = /^\d+\s+min\s+read$/i;

export type ValidationResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };

function requiredText(value: FormDataEntryValue | null, label: string, maxLength: number, minLength = 1) {
	const text = String(value ?? '').trim();
	if (text.length < minLength) return { ok: false as const, error: `${label} wajib diisi.` };
	if (text.length > maxLength) return { ok: false as const, error: `${label} maksimal ${maxLength} karakter.` };
	return { ok: true as const, value: text };
}

function optionalText(value: FormDataEntryValue | null, maxLength: number) {
	const text = String(value ?? '').trim();
	if (!text) return { ok: true as const, value: '' };
	if (text.length > maxLength) return { ok: false as const, error: `Field maksimal ${maxLength} karakter.` };
	return { ok: true as const, value: text };
}

function optionalUrl(value: FormDataEntryValue | null, label: string) {
	const text = String(value ?? '').trim();
	if (!text) return { ok: true as const, value: '' };
	try {
		const url = new URL(text);
		if (!['http:', 'https:'].includes(url.protocol)) {
			return { ok: false as const, error: `${label} harus memakai http:// atau https://.` };
		}
		if (!url.hostname.includes('.')) {
			return { ok: false as const, error: `${label} harus berupa URL valid.` };
		}
		return { ok: true as const, value: url.toString() };
	} catch {
		return { ok: false as const, error: `${label} harus berupa URL valid.` };
	}
}

function parseTags(value: FormDataEntryValue | null) {
	const raw = String(value ?? '').trim();
	if (!raw) return { ok: true as const, value: [] as string[] };
	const tags = raw
		.split(',')
		.map((tag) => tag.trim().toLowerCase())
		.filter(Boolean);
	if (tags.length > 12) return { ok: false as const, error: 'Tags maksimal 12 item.' };
	if (tags.some((tag) => tag.length > 40)) return { ok: false as const, error: 'Setiap tag maksimal 40 karakter.' };
	return { ok: true as const, value: [...new Set(tags)] };
}

export function validateLoginPassword(formData: FormData): ValidationResult<{ password: string }> {
	const password = String(formData.get('password') ?? '');
	if (!password.trim()) return { ok: false, error: 'Password admin wajib diisi.' };
	if (password.length > 200) return { ok: false, error: 'Password admin tidak valid.' };
	return { ok: true, data: { password } };
}

export function validateSubmission(formData: FormData, mode: 'contact' | 'write_for_us'): ValidationResult<SubmissionInput> {
	const name = requiredText(formData.get('name'), 'Nama', 120, 2);
	if (!name.ok) return name;

	const email = requiredText(formData.get('email'), 'Email', 254, 5);
	if (!email.ok) return email;
	if (!EMAIL_RE.test(email.value)) return { ok: false, error: 'Email harus valid.' };

	const company = optionalText(formData.get('company'), 120);
	if (!company.ok) return { ok: false, error: 'Company maksimal 120 karakter.' };

	const siteUrl = optionalUrl(formData.get('siteUrl'), 'Site URL');
	if (!siteUrl.ok) return siteUrl;

	const targetUrl = optionalUrl(formData.get('targetUrl'), 'Target URL');
	if (!targetUrl.ok) return targetUrl;

	const message = requiredText(formData.get('message'), 'Pesan', 5000, 20);
	if (!message.ok) return message;

	const desiredPackage = optionalText(formData.get('desiredPackage'), 80);
	if (!desiredPackage.ok) return { ok: false, error: 'Desired package maksimal 80 karakter.' };

	if (mode === 'contact') {
		const submissionTypeRaw = String(formData.get('submissionType') ?? 'general').trim() || 'general';
		const submissionType = submissionTypeRaw === 'advertise' ? 'sponsored' : submissionTypeRaw;
		if (!SUBMISSION_TYPES.has(submissionType)) {
			return { ok: false, error: 'Jenis submission tidak valid.' };
		}
		const subject = optionalText(formData.get('subject'), 160);
		if (!subject.ok) return { ok: false, error: 'Subjek maksimal 160 karakter.' };
		return {
			ok: true,
			data: {
				name: name.value,
				email: email.value.toLowerCase(),
				company: company.value,
				siteUrl: siteUrl.value,
				targetUrl: targetUrl.value,
				topic: subject.value || submissionType,
				message: message.value,
				submissionType: submissionType as SubmissionInput['submissionType'],
				desiredPackage: desiredPackage.value
			}
		};
	}

	const topic = requiredText(formData.get('topic'), 'Topik', 160, 8);
	if (!topic.ok) return topic;
	return {
		ok: true,
		data: {
			name: name.value,
			email: email.value.toLowerCase(),
			company: company.value,
			siteUrl: siteUrl.value,
			targetUrl: targetUrl.value,
			topic: topic.value,
			message: message.value,
			submissionType: 'guest_post',
			desiredPackage: desiredPackage.value
		}
	};
}

export function validateSubmissionStatus(formData: FormData): ValidationResult<{ id: number; status: string }> {
	const id = Number(String(formData.get('id') ?? '').trim());
	if (!Number.isInteger(id) || id <= 0) return { ok: false, error: 'ID submission tidak valid.' };
	const status = String(formData.get('status') ?? '').trim();
	if (!SUBMISSION_STATUSES.has(status)) return { ok: false, error: 'Status submission tidak valid.' };
	return { ok: true, data: { id, status } };
}

export function validatePostForm(formData: FormData, mode: 'create' | 'update'): ValidationResult<PostInput & { id?: number }> {
	const id = Number(String(formData.get('id') ?? '').trim());
	if (mode === 'update' && (!Number.isInteger(id) || id <= 0)) {
		return { ok: false, error: 'ID post tidak valid.' };
	}

	const title = requiredText(formData.get('title'), 'Judul', 160, 5);
	if (!title.ok) return title;
	const slug = requiredText(formData.get('slug'), 'Slug', 120, 3);
	if (!slug.ok) return slug;
	if (!SLUG_RE.test(slug.value)) return { ok: false, error: 'Slug hanya boleh huruf kecil, angka, dan tanda minus.' };
	const excerpt = optionalText(formData.get('excerpt'), 320);
	if (!excerpt.ok) return { ok: false, error: 'Excerpt maksimal 320 karakter.' };
	const content = requiredText(formData.get('content'), 'Konten', 50000, 50);
	if (!content.ok) return content;
	const category = requiredText(formData.get('category'), 'Kategori', 80, 2);
	if (!category.ok) return category;
	const status = String(formData.get('status') ?? 'draft').trim();
	if (!POST_STATUSES.has(status)) return { ok: false, error: 'Status post tidak valid.' };
	const seoTitle = optionalText(formData.get('seo_title'), 160);
	if (!seoTitle.ok) return { ok: false, error: 'SEO title maksimal 160 karakter.' };
	const seoDescription = optionalText(formData.get('seo_description'), 320);
	if (!seoDescription.ok) return { ok: false, error: 'SEO description maksimal 320 karakter.' };
	const tags = parseTags(formData.get('tags'));
	if (!tags.ok) return tags;
	const readTimeRaw = String(formData.get('read_time') ?? '5 min read').trim() || '5 min read';
	if (!READ_TIME_RE.test(readTimeRaw)) return { ok: false, error: 'Read time harus format seperti 5 min read.' };
	const intent = String(formData.get('intent') ?? 'informational').trim();
	if (!POST_INTENTS.has(intent)) return { ok: false, error: 'Intent post tidak valid.' };
	const monetization = String(formData.get('monetization') ?? 'editorial').trim();
	if (!POST_MONETIZATION.has(monetization)) return { ok: false, error: 'Monetization post tidak valid.' };

	return {
		ok: true,
		data: {
			...(mode === 'update' ? { id } : {}),
			title: title.value,
			slug: slug.value,
			excerpt: excerpt.value,
			content: content.value,
			category: category.value,
			status: status as PostInput['status'],
			seo_title: seoTitle.value,
			seo_description: seoDescription.value,
			tags: tags.value,
			read_time: readTimeRaw,
			intent: intent as PostInput['intent'],
			monetization: monetization as PostInput['monetization'],
			featured: formData.get('featured') === 'on'
		}
	};
}
