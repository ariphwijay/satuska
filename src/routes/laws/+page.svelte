<script lang="ts">
	import { lawPages } from '$lib/content';
</script>
<svelte:head><title>AI Copyright Laws by Country — AI Copyright Legal</title></svelte:head>
<section class="section">
	<p class="eyebrow">Laws</p>
	<h1>AI copyright law by jurisdiction</h1>
	<p class="lede">Country and region hubs for AI training data, authorship, fair use, transparency, and compliance duties.</p>
	<div class="card-grid">
		{#each lawPages as page}
			<a class="card" href={page.href}><h3>{page.country}</h3><p>{page.summary}</p></a>
		{/each}
	</div>
</section>
