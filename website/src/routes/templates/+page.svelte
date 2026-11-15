<script lang="ts">
import { base } from '$app/paths';
let { data } = $props();
let filter = $state('All');
let search = $state('');
let visible = $derived(data.templates.filter(t => (filter === 'All' || t.category === filter) && (t.title + t.stack + t.tags.join(' ')).toLowerCase().includes(search.toLowerCase())));
</script>
<svelte:head><title>Templates · Kid StarterPack</title></svelte:head>
<main class="shell pt-20"><a href={base + '/'} class="text-violet-400 text-sm">← Home</a><h1 class="text-5xl font-bold mt-6 tracking-tight">Template library</h1><p class="text-slate-400 mt-4 max-w-2xl">Choose your stack and copy one direct CLI command. Selecting a template skips the interactive wizard.</p>
<div class="mt-9 flex flex-wrap gap-2">{#each ['All','Frontend','Backend','Fullstack'] as kind}<button class="k-btn" class:k-btn-primary={filter===kind} class:k-btn-ghost={filter!==kind} onclick={()=>filter=kind}>{kind}</button>{/each}</div>
<input aria-label="Search templates" class="mt-5 w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 outline-none focus:border-violet-400" placeholder="Search templates or technologies..." bind:value={search}/>
<div class="grid sm:grid-cols-2 gap-4 mt-7">{#each visible as item}<a class="glass k-card p-6" href={base+'/templates/'+item.slug}><div class="flex justify-between gap-2"><span class="k-pill">{item.category}</span><span class="text-xs text-slate-500">{item.level}</span></div><h2 class="font-bold text-xl mt-5">{item.title}</h2><p class="text-slate-400 text-sm mt-2 leading-relaxed">{item.description}</p><div class="flex gap-2 mt-5 flex-wrap">{#each item.tags.slice(0,4) as tag}<span class="k-tag">{tag}</span>{/each}</div><div class="text-violet-300 mt-6 font-semibold text-sm">Explore →</div></a>{/each}</div>
{#if visible.length===0}<p class="text-slate-400 mt-8">No results found.</p>{/if}</main>
