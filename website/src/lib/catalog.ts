import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { githubOwner } from './config';

const files = import.meta.glob('../../../content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
export type Template = {
  slug: string; title: string; category: string; level: string; stack: string;
  description: string; path: string; tags: string[]; featured: boolean; html: string;
};
const entries = Object.values(files).map((file) => {
  const { data, content } = matter(file);
  return {
    slug: String(data.slug), title: String(data.title), category: String(data.category),
    level: String(data.level), stack: String(data.stack), description: String(data.description),
    path: String(data.path), tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    featured: Boolean(data.featured),
    html: sanitizeHtml(marked.parse(content.replaceAll('YOUR_ACCOUNT', githubOwner), { async: false }) as string, {
      allowedTags: ['h1','h2','h3','h4','p','strong','em','ul','ol','li','code','pre','a','blockquote','hr'],
      allowedAttributes: { a: ['href','title','target','rel'] },
      allowedSchemes: ['https','http']
    })
  } satisfies Template;
}).sort((a,b)=>a.title.localeCompare(b.title));
export function getTemplates(): Template[] { return entries; }
export function getTemplate(slug: string): Template | undefined { return entries.find(x => x.slug === slug); }
export function templateCommand(t: Template): string { return `npx --yes create-kid-starter@latest --template ${t.slug} my-app`; }
