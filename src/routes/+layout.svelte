<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { site } from '$lib/content';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
		rel="stylesheet"
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="description" content={site.description} />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="site-shell">
	<header class="topbar">
		<a class="brand" href="/" aria-label="Satuska home">
			<span class="brand-mark">S</span>
			<span>
				<strong>{site.name}</strong>
				<small>{site.niche} · guest-post-first publisher</small>
			</span>
		</a>
		<nav aria-label="Main navigation">
			<a href="/blog">Blog</a>
			<a href="/write-for-us">Write for us</a>
			<a href="/advertise">Advertise</a>
			<a href="/contact">Contact</a>
			<a class="nav-pill" href="/admin">Admin</a>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer class="footer">
		<div>
			<strong>{site.name}</strong>
			<p>{site.tagline}</p>
		</div>
		<div class="footer-links">
			<a href="/about">About</a>
			<a href="/write-for-us">Write for us</a>
			<a href="/advertise">Advertise</a>
			<a href="/privacy">Privacy</a>
			<a href="/terms">Terms</a>
		</div>
	</footer>
</div>
