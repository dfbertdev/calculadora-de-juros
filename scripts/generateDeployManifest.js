const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(__dirname, '.output/public');
const manifestPath = path.join(outputDir, 'deploy-manifest.json');

const manifestContent = {
  version: 1,
  app: "calculadora-de-juros",
  build: "nuxt generate",
  files: fs.readdirSync(outputDir)
};

fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2));

console.log("✅ deploy-manifest.json criado com sucesso!");
