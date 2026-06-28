<script lang="ts">
	import { articles, cases } from '$lib/content';
</script>
<svelte:head><title>Admin — AI Copyright Legal</title></svelte:head>
<section class="admin-page">
	<p class="eyebrow">Dashboard</p>
	<h1>Editorial operations dashboard</h1>
	<p class="lede">Operator-first admin shell for articles, cases, media, SEO checks, and agent workflow. Auth can be added with a Pages secret gate next.</p>
	<div class="card-grid">
		<div class="card"><h3>Articles</h3><p>{articles.length} seeded records. D1 CRUD endpoints are scaffolded under <code>/api/articles</code>.</p></div>
		<div class="card"><h3>Cases</h3><p>{cases.length} tracked case records. Public endpoint available at <code>/api/cases/public</code>.</p></div>
		<div class="card"><h3>SEO Issues</h3><p>Next sweep: duplicate H1, title length, meta length, internal links, orphan routes.</p></div>
	</div>
	<div class="section" style="padding-left:0;padding-right:0;">
		<h2>Draft article form shell</h2>
		<div class="form-grid">
			<label>Title<input placeholder="Article title" /></label>
			<label>Slug<input placeholder="article-slug" /></label>
			<label>Category<select><option>Guide</option><option>Analysis</option><option>News</option><option>Court Ruling</option></select></label>
			<label>Status<select><option>draft</option><option>published</option></select></label>
		</div>
		<label style="margin-top:1rem;">Content<textarea rows="8" placeholder="Markdown article body"></textarea></label>
	</div>
</section>
