const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const dir = __dirname;
  const mark = await sharp(path.join(dir, 'generated-mark.png'))
    .trim({ background: '#00000000', threshold: 5 }).png().toBuffer();
  await fs.writeFile(path.join(dir, 'space-robot-saturn-mark.png'), mark);
  const markMeta = await sharp(mark).metadata();
  const lettering = await fs.readFile(path.join(dir, '..', 'shizhe-space.png'));
  const iconWidth = 360;
  const iconHeight = iconWidth * markMeta.height / markMeta.width;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1730" height="330" viewBox="0 0 1730 330" role="img" aria-label="SPACE Lab">
  <title>SPACE Lab — left-facing robot and Saturn ring</title>
  <image x="20" y="${(330-iconHeight)/2}" width="${iconWidth}" height="${iconHeight}" href="data:image/png;base64,${mark.toString('base64')}"/>
  <image x="425" y="62" width="1276" height="206.41486" href="data:image/png;base64,${lettering.toString('base64')}"/>
</svg>`;
  await fs.writeFile(path.join(dir, 'space-robot-saturn-horizontal.svg'), svg);
  await sharp(Buffer.from(svg), { density: 144 }).png()
    .toFile(path.join(dir, 'space-robot-saturn-horizontal.png'));
  await sharp(Buffer.from(svg), { density: 144 }).flatten({ background: '#ffffff' }).png()
    .toFile(path.join(dir, 'preview-white.png'));
  await sharp(Buffer.from(svg)).resize({ width: 244 }).flatten({ background: '#ffffff' }).png()
    .toFile(path.join(dir, 'preview-header-244.png'));
  console.log(`Mark: ${markMeta.width} × ${markMeta.height}; horizontal export: 3460 × 660.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
