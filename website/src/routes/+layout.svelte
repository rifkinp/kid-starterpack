<script lang="ts">
import { base } from '$app/paths';
import '../app.css';
import { repositoryUrl } from '$lib/config';
let { children } = $props();
</script>
<svelte:head><meta name="theme-color" content="#080b14" /><meta name="description" content="Open-source web application starter templates. One repo, multiple stacks." /></svelte:head>
<div class="min-h-screen flex flex-col">
  <header class="border-b border-white/10 sticky top-0 z-40 bg-[#080b14]/90 backdrop-blur-xl">
    <div class="shell h-[72px] flex items-center justify-between gap-6">
      <a href={base + '/'} class="flex items-center gap-3 font-bold text-[18px] tracking-tight"><span class="h-8 w-8 rounded-[10px] bg-violet-500 grid place-items-center text-white font-black">K</span>Kid<span class="text-violet-400">StarterPack</span></a>
      <nav aria-label="Primary" class="hidden sm:flex items-center gap-8 text-[13px] text-slate-400"><a class="hover:text-white" href={base + '/templates'}>Templates</a><a class="hover:text-white" href={base + '/docs'}>Docs</a><a class="hover:text-white" href={repositoryUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a></nav>
      <a class="k-btn k-btn-ghost !py-2" href={base + '/templates'}>Explore <span aria-hidden="true">↗</span></a>
    </div>
  </header>
  <div class="flex-1">{@render children()}</div>
  <footer class="border-t border-white/10 mt-16"><div class="shell py-9 flex flex-wrap gap-4 justify-between text-sm text-slate-500"><span>© 2026 Kid StarterPack · MIT licensed</span><span>Made to start, built to ship.</span></div></footer>
</div>
