import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Corrigir __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, '../.output/public');
const manifestPath = path.join(outputDir, 'deploy-manifest.json');

const manifestContent = {
  version: 1,
  app: "calculadora-de-juros",
  build: "nuxt generate",
  files: fs.readdirSync(outputDir)
};

fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2));

console.log("✅ deploy-manifest.json criado com sucesso!");
