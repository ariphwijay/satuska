import { json } from '@sveltejs/kit';
import { cases } from '$lib/content';

export function GET() {
	return json(cases);
}
