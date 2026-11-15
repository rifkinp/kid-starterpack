<script lang="ts">
  import { untrack } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { authClient } from '$lib/auth-client';
  let { data } = $props();
  let name = $state(untrack(() => data.user.name));
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let busy = $state(false);
  let message = $state('');
  let failed = $state(false);

  async function perform(operation: () => Promise<boolean>, success: string) {
    busy = true;
    failed = false;
    message = '';
    try {
      if (await operation()) { message = success; await invalidateAll(); }
      else { failed = true; message = 'Unable to save this change. Check your details or sign in again.'; }
    } catch {
      failed = true;
      message = 'The account service is unavailable. Please try again.';
    } finally { busy = false; }
  }
  async function saveName(event: SubmitEvent) {
    event.preventDefault();
    if (!name.trim() || name.trim().length > 100) { failed = true; message = 'Name must be 1–100 characters.'; return; }
    await perform(async () => !(await authClient.updateUser({ name: name.trim() })).error, 'Profile saved.');
  }
  async function changePassword(event: SubmitEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) { failed = true; message = 'The new passwords do not match.'; return; }
    await perform(async () => {
      const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
      if (result.error) return false;
      currentPassword = newPassword = confirmPassword = '';
      return true;
    }, 'Password changed. Other sessions have been signed out.');
  }
</script>
<svelte:head><title>Account settings · Kid Postgres</title></svelte:head>
<main class="mx-auto max-w-3xl px-6 py-12">
  <a href="/dashboard" class="text-sm text-violet-300">← Dashboard</a>
  <h1 class="mt-5 text-4xl font-bold">Account settings</h1>
  {#if message}<p class="mt-6" role={failed ? 'alert' : 'status'} class:alert={failed} class:success={!failed}>{message}</p>{/if}
  <section class="panel mt-8">
    <h2 class="text-xl font-bold">Profile</h2>
    <p class="mt-3 text-slate-400">{data.user.email}</p>
    <p class="mt-2 text-sm text-slate-400">{data.emailVerified === null ? 'Sign in again to check email verification.' : data.emailVerified ? 'Email verified' : 'Email verification required'}</p>
    <form class="mt-5" onsubmit={saveName}>
      <label for="name" class="label">Display name</label>
      <input id="name" class="field" bind:value={name} required maxlength="100" autocomplete="name" />
      <button class="primary mt-5" disabled={busy}>Save profile</button>
    </form>
  </section>
  <section class="panel mt-6">
    <h2 class="text-xl font-bold">Change password</h2>
    <form onsubmit={changePassword}>
      <label for="current-password" class="label">Current password</label>
      <input id="current-password" class="field" type="password" bind:value={currentPassword} required autocomplete="current-password" />
      <label for="new-password" class="label">New password</label>
      <input id="new-password" class="field" type="password" bind:value={newPassword} required minlength="8" maxlength="128" autocomplete="new-password" />
      <label for="confirm-password" class="label">Confirm new password</label>
      <input id="confirm-password" class="field" type="password" bind:value={confirmPassword} required minlength="8" maxlength="128" autocomplete="new-password" />
      <button class="primary mt-5" disabled={busy}>Change password</button>
    </form>
  </section>
  <section class="panel mt-6">
    <h2 class="text-xl font-bold">Active sessions</h2>
    {#if data.securityError}<p role="alert" class="alert">{data.securityError} <a href="/sign-in" class="underline">Sign in</a></p>{/if}
    <ul class="mt-4 divide-y divide-white/10">
      {#each data.sessions as session (session.id)}
        <li class="py-4"><p class="break-words text-sm">{session.current ? 'This device' : 'Other device'} · {session.device}</p><p class="mt-1 text-xs text-slate-400">Started {session.createdAt.slice(0, 10)} · expires {session.expiresAt.slice(0, 10)}</p></li>
      {/each}
    </ul>
    <button class="primary mt-4" disabled={busy || !!data.securityError} onclick={() => perform(async () => !(await authClient.revokeOtherSessions()).error, 'Other sessions signed out.')}>Sign out other devices</button>
  </section>
</main>
