export type Article = {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	category: 'News' | 'Court Ruling' | 'Regulation' | 'Settlement' | 'Guide' | 'Analysis';
	status: 'draft' | 'published';
	featured_image?: string;
	seo_title?: string;
	seo_description?: string;
	tags: string[];
	read_time: string;
	published_at: string;
	updated_at: string;
};

export type CaseItem = {
	id: number;
	name: string;
	parties: string;
	filed: string;
	status: 'active' | 'appeal' | 'settled' | 'dismissed';
	status_label: string;
	summary: string;
	significance: 'Major' | 'Medium' | 'Emerging';
	last_update: string;
};

export const site = {
	name: 'AI Copyright Legal',
	url: 'https://aicopyrightlegal.com',
	description:
		'Practical news, case tracking, and compliance guidance for copyright law in the AI era.',
	apiBase: 'https://api.aicopyrightlegal.com'
};

export const articles: Article[] = [
	{
		id: 1,
		title: 'AI Copyright Basics: What Creators and Developers Need to Know',
		slug: 'ai-copyright-basics',
		excerpt:
			'A plain-English guide to AI training data, human authorship, fair use, and disclosure duties for teams shipping AI features.',
		content: `# AI Copyright Basics

AI copyright law is moving quickly, but the practical questions stay consistent: who owns AI-assisted work, when training data creates risk, and what disclosures are expected.

## The short version

Copyright still protects human expression. Purely machine-generated output may be difficult to register in many jurisdictions, while human selection, arrangement, editing, and direction can matter.

## Why training data matters

The largest lawsuits focus on whether copying works into training datasets is fair use, licensed use, or infringement. Courts look at purpose, transformation, amount copied, and market harm.

## Practical compliance steps

- Keep records of prompts, edits, and human contributions.
- Use licensed or vendor-approved model inputs for commercial workflows.
- Add AI-use disclosures when clients, platforms, or local rules require them.
- Maintain a takedown and rights-response process.

## Related reading

Review the business checklist, fair-use guide, and case tracker before publishing high-value AI-generated content.`,
		category: 'Guide',
		status: 'published',
		seo_title: 'AI Copyright Basics for Creators and Developers',
		seo_description:
			'Understand AI copyright basics: authorship, fair use, training data, disclosures, and compliance steps for creators and developers.',
		tags: ['AI copyright', 'authorship', 'fair use'],
		read_time: '8 min read',
		published_at: '2026-06-20',
		updated_at: '2026-06-24'
	},
	{
		id: 2,
		title: 'Is AI Training Fair Use? The Legal Tests Behind the Lawsuits',
		slug: 'ai-training-fair-use',
		excerpt:
			'How courts may evaluate AI model training under the four-factor fair use framework and why market substitution is central.',
		content: `# Is AI Training Fair Use?

Fair use is not a single switch. It is a balancing test, and AI training cases are testing its boundaries.

## Factor one: purpose and character

AI companies argue that training is transformative because models learn statistical relationships rather than republishing books or images. Plaintiffs argue the copying is commercial and competes with licensing markets.

## Factor two: nature of the work

Creative works often receive stronger protection than factual works. Large datasets usually mix both.

## Factor three: amount used

Training often uses entire works. That can weigh against fair use, though courts sometimes allow complete copying when it is necessary for a transformative purpose.

## Factor four: market effect

This may become the most important factor. Courts will ask whether training harms existing or plausible licensing markets, or whether generated outputs substitute for original works.`,
		category: 'Analysis',
		status: 'published',
		seo_title: 'Is AI Training Fair Use? Legal Tests and Lawsuits',
		seo_description:
			'Learn how fair use applies to AI training data, including the four factors, licensing markets, and lawsuit risks.',
		tags: ['fair use', 'training data', 'lawsuits'],
		read_time: '10 min read',
		published_at: '2026-06-22',
		updated_at: '2026-06-24'
	},
	{
		id: 3,
		title: 'AI Copyright Compliance Checklist for Businesses',
		slug: 'ai-copyright-compliance-business',
		excerpt:
			'A practical checklist for procurement, product, marketing, and legal teams using generative AI at work.',
		content: `# AI Copyright Compliance Checklist for Businesses

A useful AI copyright policy should be operational, not just legal language in a handbook.

## Vendor review

Check model terms, indemnity, data retention, training opt-out options, and whether generated outputs can be used commercially.

## Content governance

Define which teams can publish AI-assisted content, which content requires human review, and what records must be kept.

## Risk controls

- Block confidential uploads into consumer AI tools.
- Require human review for public marketing, code, legal, and regulated content.
- Maintain prompt and edit logs for important assets.
- Set disclosure rules by channel and jurisdiction.

## Incident response

Create a clear process for rights-holder complaints, takedown requests, and disputed generated content.`,
		category: 'Guide',
		status: 'published',
		seo_title: 'AI Copyright Compliance Checklist for Businesses',
		seo_description:
			'A business-ready AI copyright compliance checklist covering vendors, content review, disclosures, and incident response.',
		tags: ['compliance', 'business', 'policy'],
		read_time: '9 min read',
		published_at: '2026-06-24',
		updated_at: '2026-06-24'
	}
];

export const cases: CaseItem[] = [
	{
		id: 1,
		name: 'Authors Guild v. OpenAI',
		parties: 'Authors Guild, individual authors v. OpenAI',
		filed: '2023',
		status: 'active',
		status_label: 'Active litigation',
		summary:
			'Authors allege unauthorized use of copyrighted books in model training and raise claims around derivative outputs and licensing markets.',
		significance: 'Major',
		last_update: '2026-06-18'
	},
	{
		id: 2,
		name: 'Getty Images v. Stability AI',
		parties: 'Getty Images v. Stability AI',
		filed: '2023',
		status: 'active',
		status_label: 'Discovery / motions',
		summary:
			'Image licensing and training-data dispute focused on alleged copying of photo libraries and generated image outputs.',
		significance: 'Major',
		last_update: '2026-06-12'
	},
	{
		id: 3,
		name: 'Thomson Reuters v. Ross Intelligence',
		parties: 'Thomson Reuters v. Ross Intelligence',
		filed: '2020',
		status: 'active',
		status_label: 'Key fair-use ruling',
		summary:
			'Legal research content dispute watched closely because it tests fair use arguments around machine learning and market harm.',
		significance: 'Major',
		last_update: '2026-05-30'
	}
];

export const guides = [
	{ title: 'AI Copyright Basics', href: '/learn/ai-copyright-basics', text: 'Core concepts for creators and builders.' },
	{ title: 'AI Training Fair Use', href: '/learn/ai-training-fair-use', text: 'Four-factor analysis in training-data cases.' },
	{ title: 'Can You Copyright AI Content?', href: '/learn/can-you-copyright-ai-content', text: 'Human authorship and registration issues.' },
	{ title: 'Protect Content from AI', href: '/learn/protect-content-from-ai', text: 'Robots rules, licenses, monitoring, and enforcement.' },
	{ title: 'Who Owns AI-Generated Art?', href: '/learn/who-owns-ai-generated-art', text: 'Ownership, contracts, and platform terms.' },
	{ title: 'Business Compliance', href: '/learn/ai-copyright-compliance-business', text: 'Policy checklist for commercial teams.' }
];

export const lawPages = [
	{ country: 'United States', href: '/laws/united-states', summary: 'Fair use, human authorship, registration, and litigation updates.' },
	{ country: 'European Union', href: '/laws/european-union', summary: 'AI Act, copyright exceptions, transparency, and opt-outs.' },
	{ country: 'United Kingdom', href: '/laws/united-kingdom', summary: 'Text and data mining policy and copyright reform debate.' },
	{ country: 'Japan', href: '/laws/japan', summary: 'Broad data-analysis exceptions and commercial AI questions.' },
	{ country: 'China', href: '/laws/china', summary: 'AI-generated content rules, platform duties, and copyright registration.' },
	{ country: 'Indonesia', href: '/laws/indonesia', summary: 'Local copyright principles, platform use, and compliance watchpoints.' }
];

export function publishedArticles() {
	return articles.filter((article) => article.status === 'published');
}

export function articleBySlug(slug: string) {
	return publishedArticles().find((article) => article.slug === slug);
}

export function relatedArticles(article: Article) {
	return publishedArticles()
		.filter((candidate) => candidate.slug !== article.slug)
		.sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
		.slice(0, 5);
}
