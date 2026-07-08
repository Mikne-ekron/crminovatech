// Genera los íconos de la PWA a partir de public/app-icon.png (cuadrado, >=512px).
//   node scripts/gen-pwa-icons.mjs
import { Jimp } from 'jimp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(dir, '..', 'public');
const SRC = path.join(pub, 'app-icon.png');
const BG = 0xffffffff; // fondo blanco para maskable / apple (0xRRGGBBAA)

if (!fs.existsSync(SRC)) {
  console.error(`No existe ${SRC}. Guarda el ícono como public/app-icon.png (cuadrado, >=512px).`);
  process.exit(1);
}

// Devuelve un Jimp cuadrado de `size` con la imagen contenida y centrada.
function contain(img, size, pad = 0, bg = 0x00000000) {
  const canvas = new Jimp({ width: size, height: size, color: bg });
  const inner = Math.round(size * (1 - pad * 2));
  const c = img.clone();
  const scale = Math.min(inner / c.bitmap.width, inner / c.bitmap.height);
  c.resize({ w: Math.max(1, Math.round(c.bitmap.width * scale)), h: Math.max(1, Math.round(c.bitmap.height * scale)) });
  canvas.composite(c, Math.round((size - c.bitmap.width) / 2), Math.round((size - c.bitmap.height) / 2));
  return canvas;
}

const src = await Jimp.read(SRC);

await contain(src, 512).write(path.join(pub, 'pwa-512.png'));
await contain(src, 192).write(path.join(pub, 'pwa-192.png'));
await contain(src, 64).write(path.join(pub, 'favicon.png'));
await contain(src, 512, 0.12, BG).write(path.join(pub, 'pwa-maskable-512.png'));
await contain(src, 180, 0.10, BG).write(path.join(pub, 'apple-touch-icon.png'));

console.log('✅ Íconos PWA generados: pwa-192, pwa-512, pwa-maskable-512, apple-touch-icon, favicon (en public/)');
