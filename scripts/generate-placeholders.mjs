#!/usr/bin/env node
/**
 * Generates simple, self-contained SVG->PNG placeholder product photos so
 * the seed data doesn't depend on any external image host. Each image is a
 * flat card in a category-tinted color with a simple geometric "product"
 * silhouette and the item's short code — good enough to visually populate
 * the catalog grid without pretending to be real photography.
 *
 * Usage: node scripts/generate-placeholders.mjs
 * Requires "sharp" — already a project dependency (used for image
 * optimization/uploads elsewhere), so this runs fine after `npm install`.
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "placeholders");

const CATEGORY_THEMES = {
  tecnologia: { bg: "#e8f0fe", accent: "#2a78d6", label: "TEC" },
  resmas: { bg: "#eef3ea", accent: "#3f7d3a", label: "RES" },
  grafica: { bg: "#fbeee6", accent: "#c9612e", label: "GRA" },
};

function iconShape(category, accent) {
  switch (category) {
    case "tecnologia":
      return `
        <rect x="230" y="260" width="340" height="220" rx="18" fill="none" stroke="${accent}" stroke-width="14"/>
        <rect x="270" y="300" width="260" height="140" rx="8" fill="${accent}" opacity="0.15"/>
        <circle cx="400" cy="230" r="26" fill="${accent}"/>
      `;
    case "resmas":
      return `
        <rect x="260" y="220" width="280" height="360" rx="10" fill="none" stroke="${accent}" stroke-width="14"/>
        <line x1="260" y1="270" x2="540" y2="270" stroke="${accent}" stroke-width="8"/>
        <line x1="260" y1="320" x2="540" y2="320" stroke="${accent}" stroke-width="8"/>
        <line x1="260" y1="370" x2="540" y2="370" stroke="${accent}" stroke-width="8"/>
      `;
    default:
      return `
        <circle cx="400" cy="400" r="150" fill="none" stroke="${accent}" stroke-width="14"/>
        <rect x="330" y="330" width="140" height="140" rx="16" fill="${accent}" opacity="0.18"/>
        <line x1="400" y1="250" x2="400" y2="550" stroke="${accent}" stroke-width="8"/>
      `;
  }
}

function buildSvg({ category, code, bg, accent, label }) {
  return `
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="800" fill="${bg}"/>
  ${iconShape(category, accent)}
  <text x="400" y="650" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${accent}">${label}</text>
  <text x="400" y="700" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="${accent}" opacity="0.75">${code}</text>
</svg>`;
}

export async function generatePlaceholder(category, code, filename) {
  const theme = CATEGORY_THEMES[category] ?? CATEGORY_THEMES.tecnologia;
  const svg = buildSvg({ category, code, ...theme });
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, filename), buffer);
  return `/placeholders/${filename}`;
}

// Allow running standalone to (re)generate every placeholder referenced by
// prisma/seed-data.ts.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { products } = await import("../prisma/seed-data.mjs");
  await mkdir(outDir, { recursive: true });
  for (const p of products) {
    await generatePlaceholder(p.categorySlug, p.sku, `${p.sku}.png`);
    console.log(`Generated placeholders/${p.sku}.png`);
  }
  console.log(`Done. ${products.length} placeholder images written to ${outDir}`);
}
