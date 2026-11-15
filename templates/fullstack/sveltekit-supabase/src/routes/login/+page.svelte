<script lang="ts">let { form } = $props();</script>
<svelte:head><title>Sign in · Kid Supabase</title></svelte:head>
<main class="auth-wrap"><form method="POST" class="auth-card"><a href="/" class="text-sm text-violet-300">← Kid StarterPack</a><h1 class="text-3xl font-bold mt-6">Welcome back.</h1><p class="text-slate-400 mt-2">Sign in to access your dashboard.</p>{#if form?.message}<p role="alert" class="alert">{form.message}</p>{/if}
<label class="label" for="email">Email</label><input class="field" type="email" id="email" name="email" autocomplete="email" required />
<label class="label" for="password">Password</label><input class="field" type="password" id="password" name="password" minlength="8" autocomplete="current-password" required />
<button class="primary mt-6 w-full">Sign in</button><p class="text-sm text-slate-400 text-center mt-6"><a href="/forgot-password" class="text-violet-300">Forgot password?</a></p><p class="text-sm text-slate-400 text-center mt-3">New here? <a class="text-violet-300" href="/register">Create an account</a></p></form></main>
