<script lang="ts">
	import { cases } from '$lib/content';
</script>

<svelte:head><title>AI Copyright Case Tracker — AI Copyright Legal</title></svelte:head>
<section class="section">
	<p class="eyebrow">Case tracker</p>
	<h1>AI copyright lawsuits and rulings</h1>
	<p class="lede">Track active lawsuits, major rulings, settlements, and fair-use signals shaping AI copyright law.</p>
	<div class="article-list">
		{#each cases as item}
			<article class="case-card">
				<div class="meta"><span class="badge">{item.status_label}</span><span>{item.filed}</span><span>{item.significance}</span></div>
				<h2>{item.name}</h2>
				<p><strong>{item.parties}</strong></p>
				<p>{item.summary}</p>
				<p class="meta">Last update: {item.last_update}</p>
			</article>
		{/each}
	</div>
</section>
