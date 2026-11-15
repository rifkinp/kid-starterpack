import { spawn } from 'node:child_process';
import { access, cp, lstat, mkdir, mkdtemp, readdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promptForOptions } from './wizard.mjs';

export const DEFAULT_REPOSITORY = 'https://github.com/rifkinp/kid-starterpack.git';
export const CATALOG_URL = 'https://raw.githubusercontent.com/rifkinp/kid-starterpack/main/catalog/templates.json';
const bundledCatalogFile = fileURLToPath(new URL('../catalog.json', import.meta.url));
const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const validRef = /^(?!-)[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/;

export function parseArgs(argv) {
  const options = { template: null, directory: null, install: false, packageManager: 'bun', ref: 'main', list: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') continue;
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--list') options.list = true;
    else if (arg === '--install') options.install = true;
    else if (arg === '--no-install') options.install = false;
    else if (arg === '--yes' || arg === '-y') options.yes = true;
    else if (['--template', '-t', '--dir', '-d', '--ref', '--package-manager'].includes(arg)) {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error('Missing value for ' + arg);
      const field = ({ '--template': 'template', '-t': 'template', '--dir': 'directory', '-d': 'directory', '--ref': 'ref', '--package-manager': 'packageManager' })[arg];
      options[field] = value;
    } else if (arg.startsWith('-')) throw new Error('Unknown option: ' + arg);
    else if (options.directory === null) options.directory = arg;
    else throw new Error('Unexpected argument: ' + arg);
  }
  if (!['bun', 'npm', 'pnpm'].includes(options.packageManager)) {
    throw new Error('Package manager must be bun, npm, or pnpm');
  }
  if (!validRef.test(options.ref) || options.ref.includes('..') || options.ref.endsWith('.lock')) {
    throw new Error('Invalid Git ref: ' + options.ref);
  }
  if (options.template && !validSlug.test(options.template)) {
    throw new Error('Invalid template ID: ' + options.template);
  }
  return options;
}

export function validateCatalog(data) {
  if (!data || !Array.isArray(data.templates) || !data.templates.length) {
    throw new Error('Invalid template catalog');
  }
  const ids = new Set();
  return data.templates.map((entry) => {
    if (!entry || typeof entry.id !== 'string' || !validSlug.test(entry.id) || ids.has(entry.id)) {
      throw new Error('Invalid or duplicate template ID');
    }
    ids.add(entry.id);
    if (typeof entry.title !== 'string' || !entry.title || typeof entry.description !== 'string') {
      throw new Error('Missing template title/description for ' + entry.id);
    }
    if (typeof entry.path !== 'string' ||
      !new RegExp('^templates/(frontend|backend|fullstack)/' + entry.id + '$').test(entry.path)) {
      throw new Error('Invalid template path for ' + entry.id);
    }
    return { id: entry.id, title: entry.title, description: entry.description, path: entry.path, category: entry.category || '' };
  });
}

export async function loadCatalog({ fetchImpl = globalThis.fetch, url = CATALOG_URL } = {}) {
  try {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Remote catalog unavailable');
    return validateCatalog(await response.json());
  } catch {
    const bundled = JSON.parse(await readFile(bundledCatalogFile, 'utf8'));
    return validateCatalog(bundled);
  }
}

export function resolveDestination(cwd, directory) {
  if (!directory || directory === '.' || directory === '..') {
    throw new Error('Project directory must be a new child directory');
  }
  const base = resolve(cwd);
  const target = resolve(base, directory);
  const rel = relative(base, target);
  if (!rel || rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) {
    throw new Error('Project directory must stay inside the working directory');
  }
  return target;
}

export function exec(program, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(program, args, {
      cwd: options.cwd,
      shell: false,
      windowsHide: !options.interactive,
      env: process.env,
      stdio: options.interactive ? 'inherit' : ['ignore', 'pipe', 'pipe']
    });
    let stderr = '';
    child.stderr?.on('data', (chunk) => {
      stderr = (stderr + String(chunk)).slice(-4000);
    });
    child.stdout?.resume();
    child.on('error', (error) => {
      rejectPromise(new Error(program + ' could not start: ' + error.message));
    });
    child.on('close', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(program + ' exited with code ' + code + (stderr ? ': ' + stderr.trim() : '')));
    });
  });
}

async function rejectSymlinks(path) {
  const stat = await lstat(path);
  if (stat.isSymbolicLink()) throw new Error('Template contains a symbolic link: ' + path);
  if (stat.isDirectory()) {
    for (const name of await readdir(path)) {
      await rejectSymlinks(join(path, name));
    }
  } else if (!stat.isFile()) {
    throw new Error('Template contains an unsupported file type: ' + path);
  }
}

function packageNameFor(directory) {
  return basename(directory).toLowerCase().replace(/[^a-z0-9-_.]/g, '-').replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '') || 'kid-project';
}

export async function createProject({
  template, directory, ref = 'main', install = false, initializeGit = false, packageManager = 'bun',
  repository = DEFAULT_REPOSITORY, cwd = process.cwd(), execImpl = exec
}) {
  const entry = validateCatalog({ templates: [template] })[0];
  if (!validRef.test(ref) || ref.includes('..')) throw new Error('Invalid Git ref');
  const destination = resolveDestination(cwd, directory);
  const base = resolve(cwd);
  // Never overwrite or merge with an existing project directory.
  if (await access(destination).then(() => true).catch(() => false)) {
    throw new Error('Destination already exists: ' + destination);
  }
  await mkdir(dirname(destination), { recursive: true });
  const realBase = await realpath(base);
  const realParent = await realpath(dirname(destination));
  const parentRelative = relative(realBase, realParent);
  if (parentRelative === '..' || parentRelative.startsWith('..' + sep) || isAbsolute(parentRelative)) {
    throw new Error('Destination parent resolves outside the working directory');
  }
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'kid-starter-'));
  const checkout = join(temporaryRoot, 'checkout');
  let createdDestination = false;
  try {
    await execImpl('git', ['clone', '--depth', '1', '--filter=blob:none', '--sparse', '--branch', ref, '--', repository, checkout]);
    await execImpl('git', ['-C', checkout, 'sparse-checkout', 'set', '--cone', '--', entry.path]);
    const source = join(checkout, ...entry.path.split('/'));
    await rejectSymlinks(source);
    // mkdir without recursive=true makes destination creation atomic.
    await mkdir(destination);
    createdDestination = true;
    // The destination was created atomically above and is empty. Keep force=false
    // to prevent replacing files if another process races with the copy.
    await cp(source, destination, { recursive: true, force: false, errorOnExist: false });
    const manifestPath = join(destination, 'package.json');
    try {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      manifest.name = packageNameFor(destination);
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (initializeGit) {
      await execImpl('git', ['init', '--initial-branch=main'], { cwd: destination });
    }
  } catch (error) {
    if (createdDestination) await rm(destination, { recursive: true, force: true });
    throw error;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
  if (install) {
    // Explicit opt-in: package managers may run third-party lifecycle scripts.
    await execImpl(packageManager, ['install'], { cwd: destination, interactive: true });
  }
  return destination;
}

export const HELP = [
  'Kid StarterPack — open-source project generator',
  '',
  'Interactive wizard:',
  '  npm create kid-starter@latest',
  '',
  'Direct copy (NO wizard):',
  '  npx create-kid-starter@latest --template elysia-api my-api',
  '  npm create kid-starter@latest -- --template elysia-api my-api',
  '',
  'Options:',
  '  -t, --template <id>     Choose a template and bypass ALL prompts',
  '  -d, --dir <folder>      Output directory (or use a positional argument)',
  '      --install           Opt in to installing dependencies',
  '      --package-manager   bun | npm | pnpm (default: bun)',
  '      --ref <branch>      Source repository branch/tag (default: main)',
  '      --list              Show available templates',
  '  -h, --help              Show help',
].join('\n');

export async function runCLI(argv, {
  catalogLoader = loadCatalog, projectCreator = createProject,
  prompt = promptForOptions, output = console
} = {}) {
  const args = parseArgs(argv);
  if (args.help) { output.log(HELP); return; }
  const catalog = await catalogLoader();
  if (args.list) {
    catalog.forEach((item) => output.log(item.id.padEnd(22) + item.title));
    return;
  }
  let selected;
  let directory;
  let install = args.install;
  let initializeGit = false;
  if (args.template) {
    // A specific template is the complete direct-copy mode: NO prompts.
    selected = catalog.find((item) => item.id === args.template);
    if (!selected) throw new Error('Unknown template: ' + args.template + '. Use --list to see available templates.');
    directory = args.directory || args.template;
  } else {
    if (args.yes) throw new Error('--yes requires --template to avoid guessing your stack');
    const chosen = await prompt(catalog);
    selected = chosen.template;
    directory = args.directory || chosen.directory;
    install = install || chosen.install;
    initializeGit = chosen.initializeGit === true;
  }
  output.log('Creating ' + directory + ' from ' + selected.id + ' ...');
  const destination = await projectCreator({
    template: selected, directory, ref: args.ref,
    install, initializeGit, packageManager: args.packageManager
  });
  output.log('\nProject ready: ' + destination);
  output.log('Next steps:\n  cd ' + directory + (install ? '' : '\n  bun install') + '\n  bun run dev');
  return destination;
}
