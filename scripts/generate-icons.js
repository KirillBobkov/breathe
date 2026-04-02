import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG source content - exact copy of vite.svg, scaled to 512x512
// Original vite.svg is 64x64, we scale it 8x
const svgContent = `
<svg width="512" height="512" viewBox="0 0 64 64" fill="#000000" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="28" stroke="#7FAF9B" stroke-width="7"/>
  <path d="M16 32C20 24 28 24 32 32C36 40 44 40 48 32" stroke="#A8D5BA" stroke-width="7" stroke-linecap="round"/>
</svg>
`;

// Sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Output directory
const outputDir = path.join(__dirname, '..', 'public', 'pwa-icons');

async function generateIcons() {
  console.log('Generating PWA icons...');

  // Create temp SVG file
  const svgPath = path.join(outputDir, 'temp.svg');
  fs.writeFileSync(svgPath, svgContent);

  // Generate PNG for each size
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Clean up temp SVG
  fs.unlinkSync(svgPath);
  console.log('Done! Icons generated successfully.');
}

generateIcons().catch(console.error);
