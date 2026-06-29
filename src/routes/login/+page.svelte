<script lang="ts">
	let { data, form }: { data: any; form: any } = $props();
</script>

<svelte:head>
	<title>Login Admin — Satuska</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="section" style="max-width:720px; margin:0 auto;">
	<p class="eyebrow">Admin login</p>
	<h1>Masuk ke panel operator</h1>
	<p class="lede">Proteksi ringan ini cukup untuk satu operator. Password dibaca dari environment, bukan hardcoded di UI.</p>

	{#if !data.hasConfig}
		<div class="info-strip"><strong>Belum siap:</strong> auth admin belum dikonfigurasi di environment.</div>
	{/if}
	{#if form?.error}
		<div class="info-strip"><strong>Gagal:</strong> {form.error}</div>
	{/if}

	<div class="card" style="margin-top:1rem;">
		<form method="POST">
			<input type="hidden" name="next" value={form?.next ?? data.next} />
			<label>Password admin<input name="password" type="password" placeholder="Masukkan password admin" required /></label>
			<div class="actions"><button class="button" type="submit">Masuk admin</button></div>
		</form>
		<p style="margin-top:1rem; color:var(--color-text-muted);">Setelah login berhasil, kamu akan diarahkan ke halaman admin yang diminta.</p>
	</div>
</section>
