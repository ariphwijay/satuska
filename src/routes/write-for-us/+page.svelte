<script lang="ts">
	import { enhance } from '$app/forms';
	import { site, submissionPackages } from '$lib/content';

	let { form }: { form: any } = $props();
</script>

<svelte:head>
	<title>Write for us — Satuska</title>
	<meta name="description" content="Guest-post guidelines for Satuska: topical fit, editorial boundaries, and submission expectations." />
	<link rel="canonical" href={`${site.url}/write-for-us`} />
</svelte:head>

<section class="section">
	<p class="eyebrow">Write for us</p>
	<h1>Guest posts are welcome when they improve the topical map.</h1>
	<p class="lede">
		Pitch yang masuk sekarang langsung ke submission queue admin. Fokusnya tetap topical fit, usefulness, dan tone editorial yang rapi.
	</p>

	<div class="cluster-grid">
		<div class="card">
			<h3>What fits</h3>
			<ul class="list-clean">
				<li>Home improvement guides with practical value</li>
				<li>Room-by-room advice and renovation lessons</li>
				<li>Material, styling, or maintenance angles with real specificity</li>
			</ul>
		</div>
		<div class="card">
			<h3>What gets rejected</h3>
			<ul class="list-clean">
				<li>Thin SEO filler</li>
				<li>Off-topic finance, casino, or crypto content</li>
				<li>Commercial copy disguised as editorial without disclosure</li>
			</ul>
		</div>
	</div>

	{#if form?.error}<div class="info-strip"><strong>Gagal:</strong> {form.error}</div>{/if}
	{#if form?.success}<div class="info-strip"><strong>OK:</strong> {form.success}</div>{/if}

	<div class="card" style="margin-top:1.5rem;">
		<h3>Submit your pitch</h3>
		<form method="POST" use:enhance>
			<div class="form-grid">
				<label>Nama<input name="name" placeholder="Nama lengkap" required /></label>
				<label>Email<input name="email" type="email" placeholder="email@domain.com" required /></label>
				<label>Company / brand<input name="company" placeholder="Opsional" /></label>
				<label>Website<input name="siteUrl" type="url" placeholder="https://domain.com" /></label>
				<label>Target URL<input name="targetUrl" type="url" placeholder="https://target-link.com" /></label>
				<label>Package
					<select name="desiredPackage">
						<option value="">Pilih package</option>
						{#each submissionPackages as item}<option value={item.slug}>{item.label}</option>{/each}
					</select>
				</label>
			</div>
			<label style="margin-top:1rem;">Topik / angle<input name="topic" placeholder="Contoh: Small kitchen storage ideas for rentals" required /></label>
			<label style="margin-top:1rem;">Pitch<textarea name="message" rows="8" placeholder="Jelaskan angle, target reader, dan kenapa topik ini cocok untuk Satuska" required></textarea></label>
			<div class="actions"><button class="button" type="submit">Send pitch</button></div>
		</form>
	</div>
</section>
