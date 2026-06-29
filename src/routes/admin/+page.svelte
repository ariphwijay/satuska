<script lang="ts">
	import { enhance } from '$app/forms';
	import { site, submissionPackages } from '$lib/content';

	let { data, form }: { data: any; form: any } = $props();
</script>

<svelte:head>
	<title>Admin — {site.name}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="admin-page">
	<p class="eyebrow">Admin CRUD</p>
	<h1>Content + submissions operator panel</h1>
	<p class="lede">
		Phase 2 sudah masuk ke CRUD nyata untuk posts dan review submission. Kalau D1 belum terpasang di environment aktif, panel ini tetap kebaca tapi aksi simpan akan ditolak dengan pesan jelas.
	</p>

	{#if !data.hasDb}
		<div class="panel dark">
			<h3>D1 belum aktif di runtime ini</h3>
			<p>Load masih jalan pakai seed data, tapi create/update/delete butuh binding DB aktif lewat Cloudflare / Wrangler dev.</p>
		</div>
	{/if}

	{#if form?.createError}<div class="info-strip"><strong>Gagal create:</strong> {form.createError}</div>{/if}
	{#if form?.updateError}<div class="info-strip"><strong>Gagal update:</strong> {form.updateError}</div>{/if}
	{#if form?.deleteError}<div class="info-strip"><strong>Gagal delete:</strong> {form.deleteError}</div>{/if}
	{#if form?.submissionError}<div class="info-strip"><strong>Gagal review:</strong> {form.submissionError}</div>{/if}
	{#if form?.createSuccess}<div class="info-strip"><strong>OK:</strong> {form.createSuccess}</div>{/if}
	{#if form?.updateSuccess}<div class="info-strip"><strong>OK:</strong> {form.updateSuccess}</div>{/if}
	{#if form?.deleteSuccess}<div class="info-strip"><strong>OK:</strong> {form.deleteSuccess}</div>{/if}
	{#if form?.submissionSuccess}<div class="info-strip"><strong>OK:</strong> {form.submissionSuccess}</div>{/if}

	<div class="admin-shell-grid">
		<div class="stack">
			<div class="admin-card">
				<h3>Create post</h3>
				<form method="POST" action="?/createPost" use:enhance>
					<div class="form-grid">
						<label>Judul<input name="title" placeholder="Judul artikel" required /></label>
						<label>Slug<input name="slug" placeholder="slug-artikel" required /></label>
						<label>Kategori
							<select name="category">{#each data.categories as category}<option>{category}</option>{/each}</select>
						</label>
						<label>Status
							<select name="status"><option value="draft">draft</option><option value="seo_review">seo_review</option><option value="published">published</option></select>
						</label>
						<label>Intent
							<select name="intent"><option value="informational">informational</option><option value="commercial">commercial</option></select>
						</label>
						<label>Monetization
							<select name="monetization"><option value="editorial">editorial</option><option value="guest_post">guest_post</option><option value="affiliate">affiliate</option></select>
						</label>
						<label>Read time<input name="read_time" value="5 min read" /></label>
						<label>Tags<input name="tags" placeholder="tag1, tag2, tag3" /></label>
					</div>
					<label style="margin-top:1rem;">Excerpt<textarea name="excerpt" rows="3" placeholder="Ringkasan artikel"></textarea></label>
					<label style="margin-top:1rem;">SEO title<input name="seo_title" placeholder="SEO title" /></label>
					<label style="margin-top:1rem;">SEO description<textarea name="seo_description" rows="2" placeholder="SEO description"></textarea></label>
					<label style="margin-top:1rem;">Konten<textarea name="content" rows="10" placeholder="# Heading\n\nIsi artikel" required></textarea></label>
					<label style="margin-top:1rem; display:flex; align-items:center; gap:.5rem;"><input type="checkbox" name="featured" style="width:auto;" /> Featured</label>
					<div class="actions"><button class="button" type="submit">Create post</button></div>
				</form>
			</div>

			<div class="admin-card">
				<h3>Edit existing posts</h3>
				<div class="stack">
					{#each data.posts as post}
						<form method="POST" action="?/updatePost" use:enhance class="card">
							<input type="hidden" name="id" value={post.id} />
							<div class="meta"><span class="badge">#{post.id}</span><span>{post.status}</span><span>{post.monetization}</span></div>
							<div class="form-grid">
								<label>Judul<input name="title" value={post.title} required /></label>
								<label>Slug<input name="slug" value={post.slug} required /></label>
								<label>Kategori
									<select name="category">{#each data.categories as category}<option selected={category === post.category}>{category}</option>{/each}</select>
								</label>
								<label>Status
									<select name="status"><option value="draft" selected={post.status === 'draft'}>draft</option><option value="seo_review" selected={post.status === 'seo_review'}>seo_review</option><option value="published" selected={post.status === 'published'}>published</option></select>
								</label>
								<label>Intent
									<select name="intent"><option value="informational" selected={post.intent === 'informational'}>informational</option><option value="commercial" selected={post.intent === 'commercial'}>commercial</option></select>
								</label>
								<label>Monetization
									<select name="monetization"><option value="editorial" selected={post.monetization === 'editorial'}>editorial</option><option value="guest_post" selected={post.monetization === 'guest_post'}>guest_post</option><option value="affiliate" selected={post.monetization === 'affiliate'}>affiliate</option></select>
								</label>
								<label>Read time<input name="read_time" value={post.read_time} /></label>
								<label>Tags<input name="tags" value={post.tags.join(', ')} /></label>
							</div>
							<label style="margin-top:1rem;">Excerpt<textarea name="excerpt" rows="3">{post.excerpt}</textarea></label>
							<label style="margin-top:1rem;">SEO title<input name="seo_title" value={post.seo_title ?? ''} /></label>
							<label style="margin-top:1rem;">SEO description<textarea name="seo_description" rows="2">{post.seo_description ?? ''}</textarea></label>
							<label style="margin-top:1rem;">Konten<textarea name="content" rows="10">{post.content}</textarea></label>
							<label style="margin-top:1rem; display:flex; align-items:center; gap:.5rem;"><input type="checkbox" name="featured" checked={post.featured} style="width:auto;" /> Featured</label>
							<div class="actions"><button class="button" type="submit">Save</button></div>
						</form>
					{/each}
				</div>
			</div>
		</div>

		<div class="stack">
			<div class="admin-card">
				<h3>Delete post</h3>
				<div class="stack">
					{#each data.posts as post}
						<form method="POST" action="?/deletePost" use:enhance class="row">
							<input type="hidden" name="id" value={post.id} />
							<div><strong>{post.title}</strong><p style="margin:.35rem 0 0;">/{post.slug}</p></div>
							<button class="button secondary" type="submit">Delete</button>
						</form>
					{/each}
				</div>
			</div>

			<div class="admin-card">
				<h3>Submission packages</h3>
				<ul class="list-clean">{#each submissionPackages as item}<li><strong>{item.label}</strong> — {item.description}</li>{/each}</ul>
			</div>

			<div class="admin-card">
				<h3>Audit trail mutation terbaru</h3>
				{#if data.recentMutations.length === 0}
					<p>Belum ada log mutation admin.</p>
				{:else}
					<div class="stack">
						{#each data.recentMutations as item}
							<div class="card">
								<div class="meta">
									<span class="badge">#{item.id}</span>
									<span>{item.action}</span>
									<span>{item.entity_type}{item.entity_id ? ` #${item.entity_id}` : ''}</span>
								</div>
								<p><strong>{item.summary}</strong></p>
								<p style="margin:.35rem 0 0;">{item.created_at} · {item.ip_address ?? 'unknown IP'}</p>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="admin-card">
				<h3>Submission review</h3>
				{#if data.submissions.length === 0}
					<p>Belum ada submission di DB.</p>
				{:else}
					<div class="stack">
						{#each data.submissions as submission}
							<form method="POST" action="?/reviewSubmission" use:enhance class="card">
								<input type="hidden" name="id" value={submission.id} />
								<div class="meta"><span class="badge">#{submission.id}</span><span>{submission.submission_type}</span><span>{submission.status}</span></div>
								<h3>{submission.topic || submission.name}</h3>
								<p><strong>{submission.name}</strong> — {submission.email}</p>
								<p>{submission.message}</p>
								<label>Status
									<select name="status"><option value="received" selected={submission.status === 'received'}>received</option><option value="reviewing" selected={submission.status === 'reviewing'}>reviewing</option><option value="accepted" selected={submission.status === 'accepted'}>accepted</option><option value="rejected" selected={submission.status === 'rejected'}>rejected</option></select>
								</label>
								<div class="actions"><button class="button" type="submit">Update submission</button></div>
							</form>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
