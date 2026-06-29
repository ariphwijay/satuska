<script lang="ts">
	let { data, children } = $props();
</script>

<section class="section" style="padding-bottom:0;">
	<div class="card" style="display:flex; justify-content:space-between; gap:1rem; align-items:center;">
		<div>
			<p class="eyebrow">Admin access</p>
			<h2 style="margin:0;">Operator session aktif</h2>
			<p class="lede" style="margin-top:.4rem;">Panel admin sekarang dilindungi login ringan berbasis password + cookie session.</p>
		</div>
		<div style="display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; justify-content:flex-end;">
			<span class="badge">{data.adminSession?.authenticated ? 'Admin aktif' : 'Guest'}</span>
			<form method="POST" action="/logout">
				<button class="button secondary" type="submit">Logout</button>
			</form>
		</div>
	</div>
</section>

{@render children()}
