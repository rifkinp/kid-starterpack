<script lang="ts">
import { onMount } from 'svelte';
import { authClient } from '$lib/auth-client';
import { goto } from '$app/navigation';
let token=$state('');let password=$state('');let message=$state('');let busy=$state(false);
onMount(()=>{token=new URLSearchParams(location.search).get('token')??'';});
async function submit(e:SubmitEvent){e.preventDefault();if(!token){message='The reset token is missing or expired.';return;}busy=true;message='';try{const response=await authClient.resetPassword({newPassword:password,token});if(response.error){message=response.error.message??'Unable to reset password';}else{await goto('/sign-in');}}catch{message='Password reset failed';}finally{busy=false;}}
</script><svelte:head><title>Reset password · Kid Postgres</title></svelte:head><main class="auth-wrap"><form class="auth-card" onsubmit={submit}><h1 class="text-3xl font-bold">Set a new password</h1>{#if message}<p role="alert" class="alert">{message}</p>{/if}<label class="label" for="password">Password</label><input class="field" id="password" type="password" bind:value={password} minlength="8" maxlength="128" autocomplete="new-password" required/><button disabled={busy} class="primary w-full mt-6">{busy?'Updating...':'Update password'}</button></form></main>
