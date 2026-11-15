<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  let { data, form } = $props();
  let busy = $state(false);
  const submit: SubmitFunction = () => {
    busy = true;
    return async ({ update }) => {
      try { await update({ reset: false }); } finally { busy = false; }
    };
  };
</script>
<svelte:head><title>Account settings · Kid Supabase</title></svelte:head>
<main class="mx-auto max-w-3xl px-6 py-12">
  <a href="/dashboard" class="text-sm text-violet-300">← Dashboard</a>
  <h1 class="mt-5 text-4xl font-bold">Account settings</h1>
  {#if form?.message}<p role="alert" class="alert mt-6">{form.message}</p>{/if}
  {#if form?.success}<p role="status" class="success mt-6">{form.success}</p>{/if}
  <section class="panel mt-8">
    <h2 class="text-xl font-bold">Profile</h2>
    <p class="mt-3 text-slate-400">{data.profile.email}</p>
    <p class="mt-2 text-sm text-slate-400">{data.profile.emailVerified ? 'Email verified' : 'Email not verified'}</p>
    {#if !data.profile.emailVerified}<a href="/verify-email" class="mt-2 inline-block text-sm text-violet-300">Resend verification email</a>{/if}
    <form method="POST" action="?/profile" class="mt-5" use:enhance={submit}>
      <label class="label" for="name">Display name</label>
      <input id="name" class="field" name="name" value={data.profile.displayName} required maxlength="100" autocomplete="name" />
      <button class="primary mt-5" disabled={busy}>Save profile</button>
    </form>
  </section>
  <section class="panel mt-6">
    <h2 class="text-xl font-bold">Change password</h2>
    <p class="mt-3 text-sm leading-relaxed text-slate-400">We'll send a secure reset link to your account email. Open that link to choose a new password.</p>
    <form method="POST" action="?/password" use:enhance={submit}>
      <button class="primary mt-5" disabled={busy || !data.profile.email}>Email a password reset link</button>
    </form>
  </section>
  <section class="panel mt-6">
    <h2 class="text-xl font-bold">Other devices</h2>
    <p class="mt-3 text-sm leading-relaxed text-slate-400">Keep this device signed in and stop other devices from refreshing their sessions. Existing access may continue until it expires.</p>
    <form method="POST" action="?/sessions" use:enhance={submit}>
      <button class="primary mt-5" disabled={busy}>Sign out other devices</button>
    </form>
  </section>
</main>
