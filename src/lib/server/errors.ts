export class DuplicateSlugError extends Error {
	constructor(slug: string) {
		super(`Slug '${slug}' sudah dipakai.`);
		this.name = 'DuplicateSlugError';
	}
}

export class DuplicateSubmissionError extends Error {
	constructor() {
		super('Submission serupa sudah pernah masuk baru-baru ini. Cek inbox/review queue dulu sebelum kirim ulang.');
		this.name = 'DuplicateSubmissionError';
	}
}

export function getOperatorErrorMessage(error: unknown, fallback = 'Terjadi error saat memproses permintaan.') {
	if (error instanceof DuplicateSlugError || error instanceof DuplicateSubmissionError) {
		return error.message;
	}
	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		if (message.includes('unique constraint failed') && message.includes('posts.slug')) {
			return 'Slug ini sudah dipakai post lain.';
		}
	}
	return fallback;
}
