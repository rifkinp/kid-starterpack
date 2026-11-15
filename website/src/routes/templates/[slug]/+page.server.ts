import { error } from '@sveltejs/kit';
import { getTemplate, getTemplates, templateCommand } from '$lib/catalog';
import type { EntryGenerator, PageServerLoad } from './$types';
export const entries: EntryGenerator = () => getTemplates().map(({ slug }) => ({ slug }));
export const load: PageServerLoad = ({ params }) => {
  const template = getTemplate(params.slug);
  if (!template) error(404, 'Template not found');
  return { template, command: templateCommand(template) };
};
