<script lang="ts">
  import { base } from '$app/paths';
  import { repositoryUrl } from '$lib/config';

  let { data } = $props();
  let copied = $state<'direct' | 'wizard' | null>(null);

  async function copyCommand(command: string, kind: 'direct' | 'wizard') {
    try {
      await navigator.clipboard.writeText(command);
      copied = kind;
      setTimeout(() => { if (copied === kind) copied = null; }, 1800);
    } catch {
      copied = null;
    }
  }

  const wizardCommand = 'npm create kid-starter@latest';
</script>

<svelte:head>
  <title>{data.template.title} · Kid StarterPack</title>
  <meta name="description" content={data.template.description} />
</svelte:head>

<main class="shell pt-16 pb-16">
  <a href={base + '/templates'} class="text-violet-400 text-sm hover:underline">← All templates</a>

  <div class="grid lg:grid-cols-[1fr_350px] gap-10 mt-8 items-start">
    <section>
      <div class="flex gap-2 flex-wrap">
        <span class="k-pill">{data.template.category}</span>
        <span class="k-pill">{data.template.level}</span>
      </div>
      <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mt-5">{data.template.title}</h1>
      <p class="text-lg text-slate-400 leading-relaxed mt-5 max-w-2xl">{data.template.description}</p>
      <div class="flex flex-wrap gap-2 mt-6">
        {#each data.template.tags as tag}
          <span class="k-tag">{tag}</span>
        {/each}
      </div>
      <div class="mt-11 prose-k">{@html data.template.html}</div>
    </section>

    <aside class="glass p-6 lg:sticky lg:top-28">
      <div class="text-xs tracking-[.17em] font-bold text-violet-300">QUICK START · NO WIZARD</div>
      <h2 class="font-bold text-xl mt-3">Copy {data.template.title}</h2>
      <p class="text-xs text-slate-400 leading-relaxed mt-2">
        This command selects the template automatically, creates my-app, and skips every CLI question.
      </p>

      <div class="mt-5 p-4 rounded-xl bg-[#0c1020] border border-white/10 break-all font-mono text-[12px] leading-6 text-slate-300 select-all">{data.command}</div>
      <button
        type="button"
        class="k-btn k-btn-primary w-full mt-3"
        onclick={() => copyCommand(data.command, 'direct')}
      >
        {copied === 'direct' ? '✓ Command copied' : 'Copy command · Skip wizard'}
      </button>
      <p class="text-xs text-amber-200/80 mt-3">
        CLI 0.1.0 is available on npm. Direct copy skips all setup questions.
      </p>

      <p class="text-slate-500 text-xs mt-6">Then run:</p>
      <div class="rounded-xl p-4 mt-2 bg-white/5 font-mono text-xs leading-7 text-slate-300">
        cd my-app<br />
        bun install<br />
        bun run dev
      </div>

      <div class="border-t border-white/10 mt-6 pt-5">
        <div class="text-xs tracking-wider font-semibold text-slate-300">PREFER AN INTERACTIVE WIZARD?</div>
        <p class="text-xs text-slate-400 mt-2">Choose a template and setup options in your terminal instead.</p>
        <div class="mt-3 p-3 rounded-xl bg-white/5 text-xs font-mono text-slate-200 break-all">{wizardCommand}</div>
        <button
          type="button"
          class="k-btn k-btn-ghost w-full mt-3"
          onclick={() => copyCommand(wizardCommand, 'wizard')}
        >
          {copied === 'wizard' ? '✓ Command copied' : 'Copy wizard command'}
        </button>
      </div>
      <a class="k-btn k-btn-ghost w-full mt-4" target="_blank" rel="noopener noreferrer" href={repositoryUrl + '/tree/main/' + data.template.path}>
        View source on GitHub ↗
      </a>
    </aside>
  </div>
</main>
