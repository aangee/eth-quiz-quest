// Rend public/icone.svg en PNG 192 et 512 avec Playwright.
const { chromium } = require('playwright');
const { readFileSync } = require('node:fs');

(async () => {
  const svg = readFileSync('public/icone.svg', 'utf8');
  const navigateur = await chromium.launch();
  for (const taille of [192, 512]) {
    const page = await navigateur.newPage({ viewport: { width: taille, height: taille } });
    await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${taille}" height="${taille}" `)}</body>`);
    await page.screenshot({ path: `public/icone-${taille}.png` });
    await page.close();
  }
  await navigateur.close();
})();
