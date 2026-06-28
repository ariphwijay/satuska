<script lang="ts">
	import { guides } from '$lib/content';
</script>
<svelte:head><title>Learn AI Copyright — AI Copyright Legal</title></svelte:head>
<section class="section">
	<p class="eyebrow">Learn</p>
	<h1>AI copyright learning center</h1>
	<p class="lede">Evergreen explainers for creators, developers, legal teams, and businesses.</p>
	<div class="card-grid">
		{#each guides as guide}
			<a class="card" href={guide.href}><h3>{guide.title}</h3><p>{guide.text}</p></a>
		{/each}
	</div>
</section>
