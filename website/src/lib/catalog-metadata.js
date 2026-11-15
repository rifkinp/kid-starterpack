/** @typedef {{slug:string,title:string,category:string,level:string,stack:string,description:string,path:string,tags:string[],featured:boolean}} Metadata */

const categories = { Frontend: 'frontend', Backend: 'backend', Fullstack: 'fullstack' };
const levels = ['minimal', 'app', 'api', 'auth'];

/** @param {unknown} value @returns {Metadata} */
export function readMetadata(value) {
  if (!value || typeof value !== 'object') throw new Error('Frontmatter must be an object');
  const fields = /** @type {Record<string, unknown>} */ (value);
  for (const key of ['slug', 'title', 'category', 'level', 'stack', 'description', 'path']) {
    if (typeof fields[key] !== 'string' || !fields[key].trim()) {
      throw new Error(`${key} must be a non-empty string`);
    }
  }
  if (typeof fields.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug)) {
    throw new Error('slug must use lowercase kebab-case');
  }
  if (typeof fields.category !== 'string' || !Object.hasOwn(categories, fields.category)) {
    throw new Error('category must be Frontend, Backend or Fullstack');
  }
  if (typeof fields.level !== 'string' || !levels.includes(fields.level)) throw new Error('Invalid readiness level');
  if (typeof fields.path !== 'string' || !/^templates\/(frontend|backend|fullstack)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.path)) {
    throw new Error('path must identify one canonical template folder');
  }
  const category = /** @type {keyof typeof categories} */ (fields.category);
  if (fields.path.split('/')[1] !== categories[category]) throw new Error('category/path mismatch');
  if (fields.path.split('/')[2] !== fields.slug) throw new Error('slug/path mismatch');
  if (!Array.isArray(fields.tags) || !fields.tags.length || fields.tags.some(tag => typeof tag !== 'string' || !tag.trim())) {
    throw new Error('tags must be a non-empty array of strings');
  }
  if (typeof fields.featured !== 'boolean') throw new Error('featured must be a boolean');
  return /** @type {Metadata} */ (fields);
}

/** @param {Pick<Metadata, 'path'>} template @param {string} owner */
export function gigetCommand(template, owner) {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(owner)) throw new Error('Invalid GitHub owner');
  if (!/^templates\/(frontend|backend|fullstack)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(template.path)) {
    throw new Error('Invalid Giget template path');
  }
  return `npx giget@latest gh:${owner}/kid-starterpack/${template.path} my-app`;
}
