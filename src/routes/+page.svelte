<script lang="ts">
	import { categorySeeds, featuredPosts, site, submissionPackages } from '$lib/content';

	const heroPosts = featuredPosts().slice(0, 3);
</script>

<svelte:head>
	<title>Satuska — Home improvement blog scaffold for guest-post publishing</title>
	<meta
		name="description"
		content="Satuska is a home improvement publishing scaffold: blog-first, guest-post ready, with optional affiliate and local SEO modules later."
	/>
	<link rel="canonical" href={`${site.url}/`} />
</svelte:head>

<section class="hero">
	<div class="hero-grid">
		<div>
			<p class="eyebrow">Phase 1 scaffold</p>
			<h1>Home improvement blog engine, ready for guest-post workflow.</h1>
			<p class="lede">
				Satuska starts as a practical publisher: editorial posts, category structure, contributor pages, and an
				operator-first admin shell. Local SEO and multisite stay optional.
			</p>
			<div class="actions">
				<a class="button" href="/blog">Lihat artikel</a>
				<a class="button secondary" href="/write-for-us">Write for us</a>
			</div>
		</div>

		<aside class="panel dark">
			<p class="eyebrow">Core mode</p>
			<h2>Blog + guest post dulu.</h2>
			<p>
				Spec sekarang diterjemahkan ke fase 1 yang ringan: content hub, monetization surfaces, admin shell,
				and initial D1 tables.
			</p>
			<div class="kpi-row">
				<div class="kpi"><strong>{heroPosts.length}</strong><span>featured seed posts</span></div>
				<div class="kpi"><strong>{categorySeeds.length}</strong><span>category seeds</span></div>
				<div class="kpi"><strong>{submissionPackages.length}</strong><span>submission packages</span></div>
			</div>
		</aside>
	</div>
</section>

<section class="section">
	<p class="eyebrow">Featured content</p>
	<h2>Editorial seeds for room guides, decor, and commercial-intent content.</h2>
	<div class="card-grid">
		{#each heroPosts as post}
			<a class="article-card" href={`/blog/${post.slug}`}>
				<div class="meta">
					<span class="badge">{post.category}</span>
					<span>{post.intent}</span>
					<span>{post.read_time}</span>
				</div>
				<h3>{post.title}</h3>
				<p>{post.excerpt}</p>
			</a>
		{/each}
	</div>
</section>

<section class="section two-col">
	<div>
		<p class="eyebrow">Core clusters</p>
		<h2>Keep the first build intentionally narrow.</h2>
		<p>
			The current scaffold supports a content publisher workflow first. Optional modules like local SEO, affiliate,
			and multi-site controls can layer on top later.
		</p>
	</div>
	<div class="stack">
		<div class="row"><span>Room guides & renovation tips</span><span>Core</span></div>
		<div class="row"><span>Guest-post intake + advertise pages</span><span>Core</span></div>
		<div class="row"><span>Affiliate comparison surfaces</span><span>Optional</span></div>
		<div class="row"><span>Local SEO location/service pages</span><span>Optional</span></div>
		<div class="row"><span>Project setup for future multi-site mode</span><span>Future-ready</span></div>
	</div>
</section>

<section class="section">
	<p class="eyebrow">What phase 1 includes</p>
	<div class="cluster-grid">
		<div class="info-strip">
			<h3>Public site</h3>
			<ul class="list-clean">
				<li>Homepage scaffold</li>
				<li>Blog list + article detail</li>
				<li>Write for us / advertise / contact pages</li>
			</ul>
		</div>
		<div class="info-strip">
			<h3>Operator side</h3>
			<ul class="list-clean">
				<li>Admin overview shell</li>
				<li>Project setup placeholders</li>
				<li>Content / monetization / workflow sections</li>
			</ul>
		</div>
	</div>
</section>
