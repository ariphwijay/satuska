<script lang="ts">
	import { site } from '$lib/content';

	let { data } = $props();
	let post = $derived(data.post);
	let jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': post.intent === 'commercial' ? 'Article' : 'BlogPosting',
		headline: post.title,
		description: post.seo_description ?? post.excerpt,
		datePublished: post.published_at,
		dateModified: post.updated_at,
		author: { '@type': 'Organization', name: site.name },
		publisher: { '@type': 'Organization', name: site.name },
		mainEntityOfPage: `${site.url}/blog/${post.slug}`
	});

	function markdownToHtml(markdown: string) {
		return markdown
			.split('\n')
			.map((line) => {
				if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
				if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
				if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
				if (!line.trim()) return '';
				return `<p>${line}</p>`;
			})
			.join('\n')
			.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
	}
</script>

<svelte:head>
	<title>{post.seo_title ?? post.title} — {site.name}</title>
	<meta name="description" content={post.seo_description ?? post.excerpt} />
	<link rel="canonical" href={`${site.url}/blog/${post.slug}`} />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.excerpt} />
	<meta property="og:type" content="article" />
	<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
</svelte:head>

<article class="article">
	<div class="meta">
		<a href="/blog">← Blog</a>
		<span class="badge">{post.category}</span>
		<span>{post.intent}</span>
		<span>{post.monetization}</span>
		<span>{post.read_time}</span>
	</div>
	<h1>{post.title}</h1>
	<p class="lede">{post.excerpt}</p>
	<div class="tag-row">
		{#each post.tags as tag}
			<span class="tag">{tag}</span>
		{/each}
	</div>
	<div class="prose">{@html markdownToHtml(post.content)}</div>

	<section class="section" style="padding-left:0;padding-right:0;">
		<p class="eyebrow">Related reading</p>
		<div class="card-grid">
			{#each data.related as related}
				<a class="card" href={`/blog/${related.slug}`}>
					<h3>{related.title}</h3>
					<p>{related.excerpt}</p>
				</a>
			{/each}
		</div>
	</section>
</article>
