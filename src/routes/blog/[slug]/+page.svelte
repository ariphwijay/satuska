<script lang="ts">
	let { data } = $props();
	let article = $derived(data.article);
	let jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'NewsArticle',
		headline: article.title,
		description: article.seo_description ?? article.excerpt,
		datePublished: article.published_at,
		dateModified: article.updated_at,
		author: { '@type': 'Organization', name: 'AI Copyright Legal' },
		publisher: { '@type': 'Organization', name: 'AI Copyright Legal' },
		mainEntityOfPage: `https://aicopyrightlegal.com/blog/${article.slug}`
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
	<title>{article.seo_title ?? article.title} — AI Copyright Legal</title>
	<meta name="description" content={article.seo_description ?? article.excerpt} />
	<link rel="canonical" href={`https://aicopyrightlegal.com/blog/${article.slug}`} />
	<meta property="og:title" content={article.title} />
	<meta property="og:description" content={article.excerpt} />
	<meta property="og:type" content="article" />
	<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
</svelte:head>

<article class="article">
	<div class="meta"><a href="/blog">← Blog</a><span class="badge">{article.category}</span><span>{article.published_at}</span><span>{article.read_time}</span></div>
	<h1>{article.title}</h1>
	<p class="lede">{article.excerpt}</p>
	<div class="prose">{@html markdownToHtml(article.content)}</div>
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
