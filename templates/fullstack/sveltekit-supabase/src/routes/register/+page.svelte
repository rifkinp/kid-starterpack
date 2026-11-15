<script lang="ts">let { form } = $props();</script>
<svelte:head><title>Sign up · Kid Supabase</title></svelte:head>
<main class="auth-wrap"><form method="POST" class="auth-card"><a href="/" class="text-sm text-violet-300">← Kid StarterPack</a><h1 class="text-3xl font-bold mt-6">Create an account.</h1><p class="text-slate-400 mt-2">Supabase Auth handles your identity.</p>{#if form?.message}<p role="alert" class="alert">{form.message}</p>{/if}{#if form?.success}<p role="status" class="success">{form.success}</p>{/if}
<label class="label" for="email">Email</label><input class="field" type="email" id="email" name="email" autocomplete="email" required/>
<label class="label" for="password">Password (8+ characters)</label><input class="field" type="password" id="password" name="password" minlength="8" maxlength="128" autocomplete="new-password" required/>
<button class="primary w-full mt-6">Create account</button><p class="text-sm text-slate-400 text-center mt-6">Already a member? <a class="text-violet-300" href="/login">Sign in</a></p></form></main>
