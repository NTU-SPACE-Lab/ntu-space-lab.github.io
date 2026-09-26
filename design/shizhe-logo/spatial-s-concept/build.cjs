const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const dir = __dirname;
  const mark = await sharp(path.join(dir, 'generated-mark.png'))
    .trim({ background: '#00000000', threshold: 5 }).png().toBuffer();
  await fs.writeFile(path.join(dir, 'space-mark-spatial-s.png'), mark);
  const meta = await sharp(mark).metadata();
  const lettering = await fs.readFile(path.join(dir, 'wordmark-refined.svg'));
  const iconHeight = 260;
  const iconWidth = iconHeight * meta.width / meta.height;
  const wordmarkHeight = 1276 * 209 / 1292;
  const textX = 20 + iconWidth + 55;
  const width = Math.ceil(textX + 1276 + 24);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="330" viewBox="0 0 ${width} 330" role="img" aria-label="SPACE Lab">
  <title>SPACE Lab — folded spatial S and sensing node</title>
  <image x="20" y="35" width="${iconWidth}" height="260" href="data:image/png;base64,${mark.toString('base64')}"/>
  <image x="${textX}" y="${(330-wordmarkHeight)/2}" width="1276" height="${wordmarkHeight}" href="data:image/svg+xml;base64,${lettering.toString('base64')}"/>
</svg>`;
  await fs.writeFile(path.join(dir, 'space-logo-spatial-s.svg'), svg);
  await sharp(Buffer.from(svg), { density: 144 }).png().toFile(path.join(dir, 'space-logo-spatial-s.png'));
  await sharp(Buffer.from(svg), { density: 144 }).flatten({ background: '#ffffff' }).png().toFile(path.join(dir, 'preview-white.png'));
  await sharp(Buffer.from(svg)).resize({ width: 244 }).flatten({ background: '#ffffff' }).png().toFile(path.join(dir, 'preview-header-244.png'));
  console.log(`Export: ${width*2} × 660; icon ${iconWidth.toFixed(1)} × 260.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
