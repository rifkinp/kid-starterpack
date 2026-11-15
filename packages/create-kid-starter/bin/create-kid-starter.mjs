#!/usr/bin/env node
import { runCLI } from '../src/index.mjs';

runCLI(process.argv.slice(2)).catch((error) => {
  console.error('\nKid StarterPack: ' + error.message);
  process.exitCode = 1;
});
