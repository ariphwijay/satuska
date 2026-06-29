<script lang="ts">
	import { enhance } from '$app/forms';
	import { site, submissionPackages } from '$lib/content';

	let { form }: { form: any } = $props();
</script>

<svelte:head>
	<title>Contact — Satuska</title>
	<meta name="description" content="Contact Satuska for editorial, partner, sponsored placement, and guest-post conversations." />
	<link rel="canonical" href={`${site.url}/contact`} />
</svelte:head>

<section class="section">
	<p class="eyebrow">Contact</p>
	<h1>Editorial and partner conversations land here.</h1>
	<p class="lede">
		Form ini sekarang masuk ke submission table yang sama dengan guest-post intake, jadi admin bisa review semuanya dari satu panel.
	</p>

	{#if form?.error}<div class="info-strip"><strong>Gagal:</strong> {form.error}</div>{/if}
	{#if form?.success}<div class="info-strip"><strong>OK:</strong> {form.success}</div>{/if}

	<div class="card">
		<form method="POST" use:enhance>
			<div class="form-grid">
				<label>Nama<input name="name" placeholder="Nama" required /></label>
				<label>Email<input name="email" type="email" placeholder="email@domain.com" required /></label>
				<label>Company / brand<input name="company" placeholder="Opsional" /></label>
				<label>Website<input name="siteUrl" type="url" placeholder="https://domain.com" /></label>
				<label>Subjek<input name="subject" placeholder="Subjek" /></label>
				<label>Jenis permintaan
					<select name="submissionType">
						<option value="guest_post">Guest post</option>
						<option value="advertise">Advertise</option>
						<option value="general">General</option>
					</select>
				</label>
				<label>Desired package
					<select name="desiredPackage">
						<option value="">No package</option>
						{#each submissionPackages as item}<option value={item.slug}>{item.label}</option>{/each}
					</select>
				</label>
				<label>Target URL<input name="targetUrl" type="url" placeholder="https://target-link.com" /></label>
			</div>
			<label style="margin-top:1rem;">Pesan<textarea name="message" rows="8" placeholder="Tulis kebutuhanmu" required></textarea></label>
			<div class="actions"><button class="button" type="submit">Send message</button></div>
		</form>
	</div>
</section>
