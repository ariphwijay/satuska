export type MonetizationMode = 'editorial' | 'guest_post' | 'affiliate';
export type PostIntent = 'informational' | 'commercial';
export type PostStatus = 'draft' | 'seo_review' | 'published';

export type Post = {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	category: string;
	status: PostStatus;
	featured_image?: string;
	seo_title?: string;
	seo_description?: string;
	tags: string[];
	read_time: string;
	published_at: string;
	updated_at: string;
	intent: PostIntent;
	monetization: MonetizationMode;
	featured?: boolean;
};

export type SiteProfile = {
	name: string;
	url: string;
	description: string;
	tagline: string;
	niche: string;
	primaryMonetization: 'guest_post';
	optionalModules: {
		localSeo: boolean;
		affiliate: boolean;
		multisiteSetup: boolean;
	};
};

export const site: SiteProfile = {
	name: 'Satuska',
	url: 'https://gushdesign.com',
	description:
		'Home improvement blog engine for practical guides, decor inspiration, and guest-post monetization.',
	tagline: 'Practical home improvement ideas, room guides, and publish-ready editorial workflows.',
	niche: 'Home improvement',
	primaryMonetization: 'guest_post',
	optionalModules: {
		localSeo: false,
		affiliate: true,
		multisiteSetup: true
	}
};

export const categorySeeds = [
	'Room Guides',
	'Renovation Tips',
	'Decor & Styling',
	'Buying Guides',
	'Outdoor Living'
];

export const submissionPackages = [
	{
		slug: 'guest-post-standard',
		label: 'Guest Post Standard',
		description: 'For editorial placements that fit the home-improvement topical boundary.'
	},
	{
		slug: 'sponsored-placement',
		label: 'Sponsored Placement',
		description: 'For promoted brand mentions, partner highlights, or sponsored content discussions.'
	}
];

export const posts: Post[] = [
	{
		id: 1,
		title: 'Small Kitchen Makeover Ideas That Feel Expensive Without Blowing the Budget',
		slug: 'small-kitchen-makeover-ideas-budget',
		excerpt:
			'Layout, lighting, hardware, and storage upgrades that make a compact kitchen look cleaner, brighter, and more premium.',
		content: `# Small Kitchen Makeover Ideas That Feel Expensive Without Blowing the Budget

A small kitchen can look dramatically better without a full gut renovation. The biggest wins usually come from layout clarity, visual consistency, and a few high-leverage material choices.

## Start with the surfaces people notice first

Cabinet fronts, backsplash, hardware, and task lighting shape the first impression. If the budget is tight, upgrade the most visible layers before spending on hidden complexity.

## Practical upgrades that punch above their cost

- Replace mismatched cabinet handles with one finish.
- Add under-cabinet lighting to make the room feel cleaner and more usable.
- Use one backsplash material instead of mixing too many textures.
- Paint or refinish worn lower cabinets before replacing everything.

## Make storage look intentional

Good kitchen styling is not only about hiding clutter. It is about giving every everyday item a logical home so the room reads as calm and practical.

## When to stop and not overbuild

If the room already functions well, phase-one upgrades should improve appearance, brightness, and storage clarity before major structural changes.`,
		category: 'Room Guides',
		status: 'published',
		seo_title: 'Small Kitchen Makeover Ideas on a Budget',
		seo_description:
			'Affordable small kitchen makeover ideas covering lighting, storage, hardware, and finish choices that look more premium.',
		tags: ['small kitchen', 'makeover ideas', 'budget remodel'],
		read_time: '7 min read',
		published_at: '2026-06-18',
		updated_at: '2026-06-24',
		intent: 'informational',
		monetization: 'editorial',
		featured: true
	},
	{
		id: 2,
		title: 'Living Room Lighting Upgrades That Instantly Improve Mood and Function',
		slug: 'living-room-lighting-upgrades',
		excerpt:
			'A layered lighting plan for living rooms that need to feel warmer, more flexible, and better for real evening use.',
		content: `# Living Room Lighting Upgrades That Instantly Improve Mood and Function

The best living room lighting plans do not rely on one ceiling fixture. They use layers so the room can shift between bright utility and softer evening comfort.

## Build from three layers

- ambient light for general brightness
- task light for reading and focused corners
- accent light for shelves, art, or architectural details

## Common mistakes

Too-cool bulbs, uneven lamp heights, and lighting that only comes from overhead can make the room feel flat and more sterile than it needs to.

## Fast improvements

Swap bulb temperatures, add dimmable lamps, and place one lower-height light source near conversation seating. Small changes often matter more than adding another bright fixture.`,
		category: 'Decor & Styling',
		status: 'published',
		seo_title: 'Living Room Lighting Upgrades for Better Mood and Function',
		seo_description:
			'Learn how to layer ambient, task, and accent lighting in a living room so it feels warmer and works better every day.',
		tags: ['living room', 'lighting', 'interior styling'],
		read_time: '6 min read',
		published_at: '2026-06-20',
		updated_at: '2026-06-24',
		intent: 'informational',
		monetization: 'editorial',
		featured: true
	},
	{
		id: 3,
		title: 'Best Peel-and-Stick Backsplash Options for Renters and Quick Refresh Projects',
		slug: 'best-peel-and-stick-backsplash-options',
		excerpt:
			'A commercial-intent roundup for people who want a faster backsplash refresh without committing to a full tile install.',
		content: `# Best Peel-and-Stick Backsplash Options for Renters and Quick Refresh Projects

Peel-and-stick backsplash products work best when expectations are realistic. They are not a forever luxury finish, but they can dramatically clean up a tired wall in a short time.

## What to compare first

- surface compatibility
- finish realism
- heat resistance near cooking areas
- corner and trim handling
- removal risk

## Who this type of guide is for

This is a high-intent comparison page for readers deciding between fast cosmetic options. The strongest version of this page should later connect to affiliate offer blocks and product comparison modules.

## Editorial rule

Keep disclosures clear and separate editorial advice from monetized placements.`,
		category: 'Buying Guides',
		status: 'published',
		seo_title: 'Best Peel-and-Stick Backsplash Options',
		seo_description:
			'Compare peel-and-stick backsplash options for kitchens and rentals, including finish quality, durability, and installation tradeoffs.',
		tags: ['backsplash', 'renters', 'buying guide'],
		read_time: '8 min read',
		published_at: '2026-06-22',
		updated_at: '2026-06-24',
		intent: 'commercial',
		monetization: 'affiliate',
		featured: true
	},
	{
		id: 4,
		title: 'How to Pitch a Home Improvement Guest Post That Actually Fits the Site',
		slug: 'how-to-pitch-home-improvement-guest-post',
		excerpt:
			'Editorial rules for contributors: topical fit, angle quality, commercial boundaries, and what makes a post publishable.',
		content: `# How to Pitch a Home Improvement Guest Post That Actually Fits the Site

Guest posts work best when they strengthen the topical map instead of forcing random commercial angles into the publication.

## What fits

Useful room-by-room advice, renovation lessons, material comparisons, practical maintenance guides, and well-scoped inspiration pieces.

## What does not fit

Thin SEO filler, off-topic finance or crypto angles, generic AI-written listicles, and commercial landing-page copy pretending to be editorial.

## What editors want first

- a clear angle
- a realistic target reader
- proof the topic belongs inside the current content clusters
- one honest reason the piece improves the site

## Final note

Treat the publication as an editorial brand first. Sponsored and guest-post monetization should support topical authority, not weaken it.`,
		category: 'Renovation Tips',
		status: 'published',
		seo_title: 'How to Pitch a Home Improvement Guest Post',
		seo_description:
			'Editorial rules for home-improvement guest posts: topical fit, useful angles, contributor expectations, and monetization boundaries.',
		tags: ['guest post', 'editorial process', 'home improvement blog'],
		read_time: '5 min read',
		published_at: '2026-06-24',
		updated_at: '2026-06-24',
		intent: 'informational',
		monetization: 'guest_post'
	}
];

export const guides = posts.slice(0, 3).map((post) => ({
	title: post.title,
	href: `/learn/${post.slug}`,
	text: post.excerpt
}));

export const lawPages = [] as Array<{ country: string; href: string; summary: string }>;
export const cases = [] as Array<{
	id: number;
	name: string;
	parties: string;
	filed: string;
	status: string;
	status_label: string;
	summary: string;
	significance: string;
	last_update: string;
}>;

export function publishedPosts() {
	return posts.filter((post) => post.status === 'published');
}

export function featuredPosts() {
	return publishedPosts().filter((post) => post.featured);
}

export function postBySlug(slug: string) {
	return posts.find((post) => post.slug === slug);
}

export function relatedPosts(post: Post) {
	return publishedPosts()
		.filter((candidate) => candidate.slug !== post.slug)
		.sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
		.slice(0, 3);
}

export function publishedArticles() {
	return publishedPosts();
}

export function articleBySlug(slug: string) {
	return postBySlug(slug);
}

export function relatedArticles(post: Post) {
	return relatedPosts(post);
}
