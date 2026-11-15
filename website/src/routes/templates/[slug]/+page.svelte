<script lang="ts">
import { base } from '$app/paths';
import { repositoryUrl } from '$lib/config';
let { data } = $props();
let copied = $state(false);
async function copy() { try { await navigator.clipboard.writeText(data.command); copied = true; setTimeout(()=>copied=false,1800); } catch { copied=false; } }
</script>
<svelte:head><title>{data.template.title} · Kid StarterPack</title><meta name="description" content={data.template.description}/></svelte:head>
<main class="shell pt-16 pb-16"><a href={base + '/templates'} class="text-violet-400 text-sm hover:underline">← All templates</a>
<div class="grid lg:grid-cols-[1fr_350px] gap-10 mt-8 items-start"><section><div class="flex gap-2 flex-wrap"><span class="k-pill">{data.template.category}</span><span class="k-pill">{data.template.level}</span></div><h1 class="text-4xl sm:text-5xl font-bold tracking-tight mt-5">{data.template.title}</h1><p class="text-lg text-slate-400 leading-relaxed mt-5 max-w-2xl">{data.template.description}</p><div class="flex flex-wrap gap-2 mt-6">{#each data.template.tags as tag}<span class="k-tag">{tag}</span>{/each}</div><div class="mt-11 prose-k">{@html data.template.html}</div></section>
<aside class="glass p-6 lg:sticky lg:top-28"><div class="text-xs tracking-[.17em] font-bold text-violet-300">QUICK START</div><h2 class="font-bold text-xl mt-3">Get this template</h2><p class="text-xs text-slate-400 leading-relaxed mt-2">Ready to copy from the Kid StarterPack GitHub repository.</p><div class="mt-5 p-4 rounded-xl bg-[#0c1020] border border-white/10 break-all font-mono text-[12px] leading-6 text-slate-300">{data.command}</div><button class="k-btn k-btn-primary w-full mt-3" onclick={copy}>{copied ? '✓ Copied!' : 'Copy Giget command'}</button><p class="text-slate-500 text-xs mt-6">Then run:</p><div class="rounded-xl p-4 mt-2 bg-white/5 font-mono text-xs leading-7 text-slate-300">cd my-app<br/>bun install<br/>bun run dev</div><a class="k-btn k-btn-ghost w-full mt-4" target="_blank" rel="noopener noreferrer" href={repositoryUrl+'/tree/main/'+data.template.path}>View source on GitHub ↗</a></aside></div></main>
