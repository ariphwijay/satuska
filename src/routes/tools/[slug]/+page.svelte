<script lang="ts">
	let { data } = $props();
</script>
<svelte:head><title>{data.tool.title} — AI Copyright Legal</title></svelte:head>
<section class="article">
	<p class="eyebrow">Tool</p>
	<h1>{data.tool.title}</h1>
	<p class="lede">{data.tool.description}</p>
	<div class="panel">
		<label>Use case
			<select><option>Website content</option><option>Client work</option><option>Software product</option><option>Marketing campaign</option></select>
		</label>
		<p><strong>V1 note:</strong> UI scaffold is ready. Next pass can add form actions, persistence, and downloadable output.</p>
	</div>
</section>
