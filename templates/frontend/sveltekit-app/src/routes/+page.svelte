<script lang="ts">
  import { onMount } from 'svelte';
  type Task = { id: string; title: string; done: boolean };
  let tasks: Task[] = [ {id:'1',title:'Customize brand colors',done:true}, {id:'2',title:'Connect your backend API',done:false}, {id:'3',title:'Ship the first feature',done:false} ];
  let title = '';
  let activeTab: 'overview'|'tasks' = 'overview';
  let ready = false;
  onMount(() => { try { const value = localStorage.getItem('kid-demo-tasks'); if (value) { const parsed: unknown = JSON.parse(value); if (Array.isArray(parsed)) tasks = parsed.filter((t): t is Task => typeof t?.id === 'string' && typeof t?.title === 'string' && typeof t?.done === 'boolean'); } } catch {} ready = true; });
  function save() { if (ready) localStorage.setItem('kid-demo-tasks', JSON.stringify(tasks)); }
  function add() { if (!title.trim()) return; tasks = [...tasks,{id: crypto.randomUUID(), title:title.trim(), done:false}]; title=''; save(); }
  function toggle(id:string) { tasks = tasks.map((t)=>t.id===id?{...t,done:!t.done}:t); save(); }
  function remove(id:string) { tasks = tasks.filter((t)=>t.id!==id); save(); }
  $: completed = tasks.filter(t=>t.done).length;
</script>
<svelte:head><title>Dashboard · Kid App Starter</title></svelte:head>
<div class="min-h-screen md:flex">
  <aside class="w-full md:w-64 p-6 md:min-h-screen border-b md:border-r md:border-b-0 border-white/10 bg-[#111525]">
    <a href="/" class="text-xl font-black tracking-tight">K<span class="text-violet-400">/</span> Kid App</a>
    <div class="mt-10 text-xs uppercase text-slate-500 tracking-widest">Workspace</div>
    <nav class="mt-3 grid gap-2"><button class:active={activeTab==='overview'} onclick={()=>activeTab='overview'} class="nav-btn">◫ &nbsp; Overview</button><button class:active={activeTab==='tasks'} onclick={()=>activeTab='tasks'} class="nav-btn">☑ &nbsp; Tasks</button></nav>
    <div class="mt-10 text-xs text-slate-500 leading-relaxed">A local-first UI demo. Replace persistence with your own API.</div>
  </aside>
  <main class="flex-1 px-6 py-9 md:px-12 max-w-6xl"><div class="flex justify-between items-center gap-4"><div><div class="text-xs uppercase tracking-[.2em] text-violet-300">Workspace / Starter</div><h1 class="text-4xl font-bold mt-2">{activeTab==='overview'?'Overview':'Your tasks'}</h1></div><span class="text-xs px-3 py-2 bg-white/5 border border-white/10 rounded-full">● Demo mode</span></div>
  {#if activeTab === 'overview'}
    <p class="text-slate-400 mt-4 max-w-lg">Your application shell is ready. This demo ships with persistent tasks, responsive navigation and Tailwind.</p>
    <div class="grid sm:grid-cols-3 gap-4 mt-9"><div class="stat"><div class="text-slate-400 text-sm">Tasks total</div><div class="text-4xl font-bold mt-4">{tasks.length}</div></div><div class="stat"><div class="text-slate-400 text-sm">Completed</div><div class="text-4xl font-bold mt-4 text-emerald-400">{completed}</div></div><div class="stat"><div class="text-slate-400 text-sm">Progress</div><div class="text-4xl font-bold mt-4">{tasks.length ? Math.round(completed/tasks.length*100) : 0}%</div></div></div>
    <div class="mt-8 stat"><h2 class="font-bold text-xl">Next steps</h2><div class="mt-3 text-slate-400 leading-8">1. Add an API client or server endpoints.<br/>2. Enable your preferred authentication.<br/>3. Customize the navigation and components.</div><button onclick={()=>activeTab='tasks'} class="mt-6 py-2.5 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold">Open tasks →</button></div>
  {:else}
    <form class="flex gap-3 mt-8" onsubmit={(e)=>{e.preventDefault();add();}}><input class="flex-1 min-w-0 rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-violet-400" placeholder="Add your next task..." bind:value={title} aria-label="Task title" /><button class="px-5 py-3 bg-violet-600 rounded-xl font-semibold">Add</button></form>
    <ul class="mt-6 grid gap-3">{#each tasks as task (task.id)}<li class="stat flex items-center gap-3"><input type="checkbox" checked={task.done} onchange={()=>toggle(task.id)} aria-label={'Mark '+task.title} class="accent-violet-500 size-5"/><span class:line-through={task.done} class:text-slate-500={task.done} class="flex-1">{task.title}</span><button class="text-sm text-rose-300" onclick={()=>remove(task.id)} aria-label={'Delete '+task.title}>Delete</button></li>{/each}</ul>
  {/if}
  </main>
</div>
<style>.nav-btn{text-align:left;padding:12px 14px;border-radius:12px;color:#b8bed4}.nav-btn:hover,.nav-btn.active{color:white;background:#353052}.stat{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);border-radius:18px;padding:24px}</style>
