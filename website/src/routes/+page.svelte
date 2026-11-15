<script lang="ts">
import { base } from '$app/paths';
let { data } = $props();
let selected = $state('All');
let query = $state('');
let filtered = $derived(data.templates.filter((t) => (selected === 'All' || t.category === selected) && (t.title+' '+t.stack+' '+t.tags.join(' ')).toLowerCase().includes(query.toLowerCase())));
</script>
<svelte:head><title>Kid StarterPack — Build from a better starting point</title></svelte:head>
<section class="shell pt-24 pb-20 text-center relative">
 <div class="absolute top-14 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>
 <span class="k-pill">✧ &nbsp; The open-source starter ecosystem</span>
 <h1 class="mx-auto max-w-4xl mt-8 font-extrabold tracking-[-.058em] leading-[1.04] text-5xl sm:text-7xl md:text-[84px]">Less setup.<br/><span class="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">More building.</span></h1>
 <p class="mt-7 text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">Production-minded starting points for SvelteKit, Bun, Elysia and PostgreSQL. Pick your stack. Copy one command. Start shipping.</p>
 <div class="flex flex-wrap justify-center gap-3 mt-9"><a href="#collection" class="k-btn k-btn-primary">Browse templates <span>↗</span></a><a href={base + '/docs'} class="k-btn k-btn-ghost">How it works →</a></div>
 <div class="mt-16 flex flex-wrap gap-9 justify-center text-xs text-slate-500"><span>◈ One GitHub repo</span><span>◎ Independent templates</span><span>⌁ Markdown-powered</span><span>◇ MIT license</span></div>
</section>
<section id="collection" class="shell pt-10 pb-10">
 <div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4"><div><p class="text-violet-400 uppercase tracking-[.2em] text-xs font-bold">THE COLLECTION</p><h2 class="text-3xl sm:text-4xl font-bold tracking-tight mt-2">Find your foundation.</h2><p class="text-slate-400 mt-2">From minimal hello-world to auth-ready fullstack apps.</p></div><div class="text-slate-500 text-sm">{filtered.length} starter templates</div></div>
 <div class="flex flex-col sm:flex-row gap-4 mt-9 mb-6"><div class="flex gap-2 flex-wrap flex-1">{#each ['All','Frontend','Backend','Fullstack'] as category}<button onclick={()=>selected=category} class:chosen={selected===category} class="cat">{category}</button>{/each}</div><input aria-label="Search templates" bind:value={query} placeholder="⌕  Search stacks..." class="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-violet-400 sm:w-64 w-full" /></div>
 <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
 {#each filtered as t (t.slug)}<a href={base+'/templates/'+t.slug} class="glass k-card p-6 min-h-62 flex flex-col" aria-label={'View '+t.title}>
  <div class="flex items-center justify-between"><div class="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-300 text-lg">{t.category==='Frontend'?'◈':t.category==='Backend'?'⌘':'▣'}</div><span class="k-pill !text-[10px]">{t.category} · {t.level}</span></div>
  <h3 class="text-xl font-bold tracking-tight mt-6">{t.title}</h3><p class="text-sm text-slate-400 leading-relaxed mt-2 flex-1">{t.description}</p>
  <div class="flex flex-wrap gap-1.5 mt-5">{#each t.tags.slice(0,3) as tag}<span class="k-tag">{tag}</span>{/each}</div><div class="mt-5 pt-4 border-t border-white/10 text-violet-300 text-sm font-semibold">View template →</div>
 </a>{/each}
 </div>
 {#if filtered.length===0}<div class="glass p-10 text-center text-slate-400">No templates match this search.</div>{/if}
</section>
<section class="shell py-14"><div class="glass rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center"><div><span class="k-pill">UNDER THE HOOD</span><h2 class="text-3xl font-bold mt-4">One repository. Any starting point.</h2><p class="text-slate-400 mt-2 max-w-xl">Every template is self-contained. The website reads Markdown at build time and Giget downloads only the folder you choose.</p></div><a class="k-btn k-btn-primary whitespace-nowrap" href={base + '/docs'}>Read the docs ↗</a></div></section>
<style>.cat{border:1px solid rgba(255,255,255,.12);padding:9px 14px;border-radius:10px;color:#adb3ca;font-size:13px}.cat.chosen{background:#6c5de7;border-color:#7364ed;color:white}.cat:hover{border-color:#8a7efa}</style>
