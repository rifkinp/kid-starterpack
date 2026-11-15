import { getTemplates } from '$lib/catalog';
export const load = () => ({ templates: getTemplates() });
