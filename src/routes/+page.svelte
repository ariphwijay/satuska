<script lang="ts">
	import { categorySeeds, featuredPosts, site, submissionPackages } from '$lib/content';

	const heroPosts = featuredPosts().slice(0, 3);
</script>

<svelte:head>
	<title>Satuska — Practical home improvement ideas and guest-post opportunities</title>
	<meta
		name="description"
		content="Satuska publishes practical home improvement guides, room ideas, renovation tips, and sponsored editorial opportunities for relevant brands."
	/>
	<link rel="canonical" href={`${site.url}/`} />
</svelte:head>

<section class="hero">
	<div class="hero-grid">
		<div>
			<p class="eyebrow">Home improvement publisher</p>
			<h1>Practical room guides, renovation ideas, and brand-safe editorial placements.</h1>
			<p class="lede">
				Satuska helps readers make better home decisions with clear ideas for kitchens, living rooms,
				decor, storage, outdoor spaces, and budget-conscious renovations.
			</p>
			<div class="actions">
				<a class="button" href="/blog">Lihat artikel</a>
				<a class="button secondary" href="/write-for-us">Write for us</a>
			</div>
		</div>

		<aside class="panel dark">
			<p class="eyebrow">Editorial focus</p>
			<h2>Useful home content first.</h2>
			<p>
				Every article is built around practical intent: what to improve, what to buy, what to avoid,
				and how to make a room feel more considered without overcomplicating the project.
			</p>
			<div class="kpi-row">
				<div class="kpi"><strong>{heroPosts.length}</strong><span>featured articles</span></div>
				<div class="kpi"><strong>{categorySeeds.length}</strong><span>core categories</span></div>
				<div class="kpi"><strong>{submissionPackages.length}</strong><span>partner options</span></div>
			</div>
		</aside>
	</div>
</section>

<section class="section">
	<p class="eyebrow">Featured content</p>
	<h2>Room guides, decor ideas, renovation tips, and commercial-intent resources.</h2>
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
		<p class="eyebrow">Content clusters</p>
		<h2>A focused home improvement library for readers and partners.</h2>
		<p>
			Satuska keeps the editorial scope tight around practical household upgrades, design choices,
			and buying decisions where readers need concise, trustworthy guidance.
		</p>
	</div>
	<div class="stack">
		<div class="row"><span>Room guides & renovation tips</span><span>Core</span></div>
		<div class="row"><span>Decor, storage & styling ideas</span><span>Core</span></div>
		<div class="row"><span>Buying guides and product comparisons</span><span>Commercial</span></div>
		<div class="row"><span>Sponsored editorial placements</span><span>Partner</span></div>
		<div class="row"><span>Contributor and guest-post intake</span><span>Open</span></div>
	</div>
</section>

<section class="section">
	<p class="eyebrow">For readers and partners</p>
	<div class="cluster-grid">
		<div class="info-strip">
			<h3>Public content</h3>
			<ul class="list-clean">
				<li>Home improvement articles</li>
				<li>Room-by-room practical guidance</li>
				<li>Renovation, decor, and buying ideas</li>
			</ul>
		</div>
		<div class="info-strip">
			<h3>Partner opportunities</h3>
			<ul class="list-clean">
				<li>Guest-post submissions</li>
				<li>Sponsored article discussions</li>
				<li>Relevant brand mentions and placements</li>
			</ul>
		</div>
	</div>
</section>
