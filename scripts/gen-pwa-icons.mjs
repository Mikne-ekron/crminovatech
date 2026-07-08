// Genera los íconos de la PWA a partir de public/app-icon.png.
// Recorta el margen transparente, agranda el espiral y usa FONDO SÓLIDO
// (evita el negro que pone iOS cuando el ícono es transparente).
//   node scripts/gen-pwa-icons.mjs
import { Jimp } from 'jimp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(dir, '..', 'public');
const SRC = path.join(pub, 'app-icon.png');
const BG = 0xdfdfdfff; // gris claro sólido (223,223,223) = fondo del ícono de marca

if (!fs.existsSync(SRC)) {
  console.error(`No existe ${SRC}. Guarda el ícono como public/app-icon.png.`);
  process.exit(1);
}

const src = await Jimp.read(SRC);

// Bounding box del contenido no transparente (para recortar el margen vacío)
function contentBBox(img) {
  const { width: W, height: H, data } = img.bitmap;
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * 4 + 3] > 20) {
      if (x < minX) minX = x; if (y < minY) minY = y;
      if (x > maxX) maxX = x; if (y > maxY) maxY = y;
    }
  }
  return { x: minX, y: minY, w: (maxX - minX + 1), h: (maxY - minY + 1) };
}
const bb = contentBBox(src);
const cropped = src.clone().crop({ x: bb.x, y: bb.y, w: bb.w, h: bb.h });

// Canvas cuadrado con fondo sólido; el ícono ocupa `fill` del lado.
function make(size, fill) {
  const canvas = new Jimp({ width: size, height: size, color: BG });
  const inner = Math.round(size * fill);
  const c = cropped.clone();
  const scale = Math.min(inner / c.bitmap.width, inner / c.bitmap.height);
  c.resize({ w: Math.max(1, Math.round(c.bitmap.width * scale)), h: Math.max(1, Math.round(c.bitmap.height * scale)) });
  canvas.composite(c, Math.round((size - c.bitmap.width) / 2), Math.round((size - c.bitmap.height) / 2));
  return canvas;
}

await make(512, 0.90).write(path.join(pub, 'pwa-512.png'));
await make(192, 0.90).write(path.join(pub, 'pwa-192.png'));
await make(64, 0.88).write(path.join(pub, 'favicon.png'));
await make(512, 0.78).write(path.join(pub, 'pwa-maskable-512.png')); // safe zone maskable
await make(180, 0.88).write(path.join(pub, 'apple-touch-icon.png'));

console.log('✅ Íconos regenerados: fondo sólido gris claro + espiral más grande (sin transparencia)');
