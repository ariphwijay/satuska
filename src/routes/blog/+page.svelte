<script lang="ts">
	import { publishedArticles } from '$lib/content';
	const articles = publishedArticles();
</script>

<svelte:head>
	<title>Blog — AI Copyright Legal</title>
	<meta name="description" content="Latest AI copyright law guides, lawsuit analysis, fair use explainers, and compliance updates." />
	<link rel="canonical" href="https://aicopyrightlegal.com/blog" />
</svelte:head>

<section class="section">
	<p class="eyebrow">Blog</p>
	<h1>AI copyright articles</h1>
	<p class="lede">Published analysis and practical guides. In production this route can read published rows from D1; this build ships with fallback seed content.</p>
	<div class="article-list">
		{#each articles as article}
			<a class="article-card" href={`/blog/${article.slug}`}>
				<div class="meta"><span class="badge">{article.category}</span><span>{article.published_at}</span><span>{article.read_time}</span></div>
				<h2>{article.title}</h2>
				<p>{article.excerpt}</p>
				<div class="tag-row">{#each article.tags as tag}<span class="tag">{tag}</span>{/each}</div>
			</a>
		{/each}
	</div>
</section>
