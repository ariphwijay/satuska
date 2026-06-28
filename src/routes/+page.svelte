<script lang="ts">
	import { articles, cases, guides, lawPages } from '$lib/content';
	const latest = articles.slice(0, 3);
</script>

<svelte:head>
	<title>AI Copyright Legal — AI copyright law, lawsuits, fair use, compliance</title>
	<meta name="description" content="Track AI copyright lawsuits, fair use, compliance, and international regulation with practical explainers for creators, developers, lawyers, and businesses." />
	<link rel="canonical" href="https://aicopyrightlegal.com/" />
</svelte:head>

<section class="hero">
	<div class="hero-grid">
		<div>
			<p class="eyebrow">AI copyright law tracker</p>
			<h1>Legal clarity for the AI copyright era.</h1>
			<p class="lede">News, case tracking, practical guides, and compliance tools for teams using generative AI in public, commercial, and regulated work.</p>
			<div class="actions">
				<a class="button" href="/blog">Read latest analysis</a>
				<a class="button secondary" href="/cases">Track active cases</a>
			</div>
		</div>
		<aside class="panel dark">
			<p class="eyebrow">Operational focus</p>
			<h2>Built for publishing + monitoring</h2>
			<p>This SvelteKit build keeps the public site, blog renderer, API routes, D1 schema, and lightweight admin in one Cloudflare-ready repo.</p>
			<div class="kpi-row">
				<div class="kpi"><strong>{articles.length}</strong><span>seed articles</span></div>
				<div class="kpi"><strong>{cases.length}</strong><span>tracked cases</span></div>
				<div class="kpi"><strong>{lawPages.length}</strong><span>law hubs</span></div>
			</div>
		</aside>
	</div>
</section>

<section class="section">
	<p class="eyebrow">Latest articles</p>
	<h2>Guides and analysis that link law to workflow.</h2>
	<div class="card-grid">
		{#each latest as article}
			<a class="article-card" href={`/blog/${article.slug}`}>
				<div class="meta"><span class="badge">{article.category}</span><span>{article.read_time}</span></div>
				<h3>{article.title}</h3>
				<p>{article.excerpt}</p>
			</a>
		{/each}
	</div>
</section>

<section class="section two-col">
	<div>
		<p class="eyebrow">Education hubs</p>
		<h2>Answer the high-intent questions before they become legal problems.</h2>
		<p>Static guide routes are ready for deeper 2,000+ word articles, internal links, and schema expansion.</p>
	</div>
	<div class="table-like">
		{#each guides.slice(0, 4) as guide}
			<a class="row" href={guide.href}><span>{guide.title}</span><span>→</span></a>
		{/each}
	</div>
</section>
