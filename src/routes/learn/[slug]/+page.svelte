<script lang="ts">
	let { data } = $props();
</script>
<svelte:head><title>{data.guide.title} — AI Copyright Legal</title></svelte:head>
<section class="article">
	<p class="eyebrow">Guide</p>
	<h1>{data.guide.title}</h1>
	<p class="lede">{data.guide.text}</p>
	{#if data.article}
		<p>This guide is backed by the article route: <a class="button secondary" href={`/blog/${data.article.slug}`}>Read full article</a></p>
	{:else}
		<div class="prose">
			<h2>What this page will cover</h2>
			<p>This Svelte route is ready for a long-form guide with internal links, citations, schema, and compliance checklists.</p>
			<ul><li>Legal concept overview</li><li>Practical risk points</li><li>Checklist for publication or product use</li></ul>
		</div>
	{/if}
</section>
