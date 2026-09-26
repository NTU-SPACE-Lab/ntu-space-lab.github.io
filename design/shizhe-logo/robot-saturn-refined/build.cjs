const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const dir = __dirname;
  const mark = await sharp(path.join(dir, 'generated-mark.png'))
    .trim({ background: '#00000000', threshold: 5 }).png().toBuffer();
  await fs.writeFile(path.join(dir, 'space-mark-refined.png'), mark);
  const markMeta = await sharp(mark).metadata();
  const lettering = await fs.readFile(path.join(dir, '..', 'shizhe-space.png'));
  const iconWidth = 330;
  const iconHeight = iconWidth * markMeta.height / markMeta.width;
  const wordmarkHeight = 1276 * 209 / 1292;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1700" height="330" viewBox="0 0 1700 330" role="img" aria-label="SPACE Lab">
  <title>SPACE Lab — refined geometric robot and Saturn ring</title>
  <image x="20" y="${(330-iconHeight)/2}" width="${iconWidth}" height="${iconHeight}" href="data:image/png;base64,${mark.toString('base64')}"/>
  <image x="400" y="${(330-wordmarkHeight)/2}" width="1276" height="${wordmarkHeight}" href="data:image/png;base64,${lettering.toString('base64')}"/>
</svg>`;
  await fs.writeFile(path.join(dir, 'space-logo-refined.svg'), svg);
  await sharp(Buffer.from(svg), { density: 144 }).png()
    .toFile(path.join(dir, 'space-logo-refined.png'));
  await sharp(Buffer.from(svg), { density: 144 }).flatten({ background: '#ffffff' }).png()
    .toFile(path.join(dir, 'preview-white.png'));
  await sharp(Buffer.from(svg)).resize({ width: 244 }).flatten({ background: '#ffffff' }).png()
    .toFile(path.join(dir, 'preview-header-244.png'));
  console.log(`Mark: ${markMeta.width} × ${markMeta.height}; icon height ${iconHeight.toFixed(1)}; type height ${wordmarkHeight.toFixed(1)}.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
