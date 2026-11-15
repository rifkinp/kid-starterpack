<script lang="ts">let { form } = $props();</script>
<svelte:head><title>Verify email · Kid Supabase</title></svelte:head>
<main class="auth-wrap">
  <form method="POST" class="auth-card">
    <a href="/login" class="text-sm text-violet-300">← Back to sign in</a>
    <h1 class="mt-6 text-3xl font-bold">Verify your email</h1>
    <p class="mt-3 text-slate-400">Open your verification link to confirm your address. Need another link?</p>
    {#if form?.message}<p role="alert" class="alert">{form.message}</p>{/if}
    {#if form?.success}<p role="status" class="success">{form.success}</p>{/if}
    <label for="email" class="label">Email</label>
    <input id="email" class="field" name="email" type="email" required maxlength="254" autocomplete="email" />
    <button class="primary mt-6 w-full">Resend verification email</button>
  </form>
</main>
