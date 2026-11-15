<script lang="ts">
  import { authClient } from '$lib/auth-client';
  let email = $state('');
  let busy = $state(false);
  let message = $state('');
  let failed = $state(false);
  async function resend(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    message = '';
    failed = false;
    try {
      const result = await authClient.sendVerificationEmail({ email, callbackURL: '/sign-in' });
      if (result.error) {
        failed = true;
        message = 'Unable to request a verification email. Please try again later.';
      } else message = 'If this address needs verification, check your inbox for a verification link.';
    } catch {
      failed = true;
      message = 'Unable to reach the email service. Please try again later.';
    } finally { busy = false; }
  }
</script>
<svelte:head><title>Verify email · Kid Postgres</title></svelte:head>
<main class="auth-wrap">
  <form class="auth-card" onsubmit={resend}>
    <a href="/sign-in" class="text-sm text-violet-300">← Back to sign in</a>
    <h1 class="mt-6 text-3xl font-bold">Verify your email</h1>
    <p class="mt-3 text-slate-400">Open the link in your verification email before signing in. Need another link?</p>
    {#if message}<p role={failed ? 'alert' : 'status'} class:alert={failed} class:success={!failed} class="mt-4">{message}</p>{/if}
    <label for="email" class="label">Email</label>
    <input id="email" class="field" type="email" bind:value={email} autocomplete="email" required />
    <button class="primary mt-6 w-full" disabled={busy}>{busy ? 'Sending…' : 'Resend verification email'}</button>
  </form>
</main>
