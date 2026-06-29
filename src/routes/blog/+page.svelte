<script lang="ts">
	import { publishedPosts, site } from '$lib/content';

	const posts = publishedPosts();
</script>

<svelte:head>
	<title>Blog — {site.name}</title>
	<meta
		name="description"
		content="Home improvement posts, room guides, decor ideas, and commercial-intent articles ready for guest-post and affiliate expansion."
	/>
	<link rel="canonical" href={`${site.url}/blog`} />
</svelte:head>

<section class="section">
	<p class="eyebrow">Blog</p>
	<h1>Editorial content that can grow into a real publisher workflow.</h1>
	<p class="lede">
		Phase 1 uses seeded posts so the public reading surface, schema, listing behavior, and content direction are already visible.
	</p>

	<div class="article-list">
		{#each posts as post}
			<a class="article-card" href={`/blog/${post.slug}`}>
				<div class="meta">
					<span class="badge">{post.category}</span>
					<span>{post.intent}</span>
					<span>{post.monetization}</span>
					<span>{post.published_at}</span>
				</div>
				<h2>{post.title}</h2>
				<p>{post.excerpt}</p>
				<div class="tag-row">
					{#each post.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</a>
		{/each}
	</div>
</section>
