import { error } from '@sveltejs/kit';
const tools: Record<string, { title: string; description: string }> = {
	'ai-copyright-checker': { title: 'AI Copyright Checker', description: 'Review source material, human contribution, vendor terms, and publication risk.' },
	'ai-disclosure-generator': { title: 'AI Disclosure Generator', description: 'Generate plain-language AI-use disclosures for content, products, and clients.' },
	'robots-txt-ai-blocker': { title: 'Robots.txt AI Blocker', description: 'Create robots.txt rules for selected AI crawlers and training bots.' }
};
export function load({ params }) {
	const tool = tools[params.slug];
	if (!tool) error(404, 'Tool not found');
	return { tool };
}
