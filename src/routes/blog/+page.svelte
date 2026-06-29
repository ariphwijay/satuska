<script lang="ts">
	import { site } from '$lib/content';

	let { data } = $props();
	let posts = $derived(data.posts);
</script>

<svelte:head>
	<title>Blog — {site.name}</title>
	<meta
		name="description"
		content="Home improvement posts, room guides, decor ideas, and commercial-intent articles ready for guest-post and affiliate expansion."
	/>
	<link rel="canonical" href={`${site.url}/blog`} />
	<meta property="og:title" content={`Blog — ${site.name}`} />
	<meta property="og:description" content="Home improvement posts, room guides, decor ideas, and commercial-intent articles ready for guest-post and affiliate expansion." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${site.url}/blog`} />
	<meta name="twitter:card" content="summary_large_image" />
	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Blog',
			name: `${site.name} Blog`,
			description: 'Home improvement posts, room guides, decor ideas, and commercial-intent articles ready for guest-post and affiliate expansion.',
			url: `${site.url}/blog`
		})}
	</script>
</svelte:head>

<section class="section">
	<p class="eyebrow">Blog</p>
	<h1>Home improvement articles for practical projects and smarter buying decisions.</h1>
	<p class="lede">
		Explore room guides, renovation ideas, decor inspiration, and commercial-intent resources for homeowners,
		rental upgrades, and relevant home brands.
	</p>

	<div class="article-list">
		{#each posts as post}
			<a class="article-card" href={`/blog/${post.slug}`}>
				<div class="meta">
					<span class="badge">{post.category}</span>
					<span>{post.intent}</span>
					<span>{post.monetization}</span>
					<span>{post.published_at}</span>
				</div>
				<h2>{post.title}</h2>
				<p>{post.excerpt}</p>
				<div class="tag-row">
					{#each post.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</a>
		{/each}
	</div>
</section>
