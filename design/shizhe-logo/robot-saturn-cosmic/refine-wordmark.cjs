const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

module.exports = async function refineWordmark() {
  const dir = __dirname;
  const original = await fs.readFile(path.join(dir, '..', 'shizhe-space.png'));
  const image = `<image width="1292" height="209" href="data:image/png;base64,${original.toString('base64')}"/>`;
  // Preserve the original robotic arm and its white separating contours.
  const armRegion = `
    <circle cx="869.5" cy="56.8" r="25.5"/>
    <circle cx="833" cy="150.3" r="31"/>
    <path d="M847 60L885 71L860 138L807 145Z"/>
    <path d="M880 43L894 48L946 73L962 77L961 110L928 102L881 83Z"/>
    <circle cx="955" cy="91.3" r="20"/>
    <rect x="930" y="83" width="95" height="70"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1292" height="209" viewBox="0 0 1292 209">
  <title>SPACE lettering with parallel C arms and continuous E crossbar</title>
  <defs>
    <clipPath id="original-spa"><rect width="788" height="209"/></clipPath>
    <clipPath id="original-arm">${armRegion}</clipPath>
    <mask id="letter-c-mask" maskUnits="userSpaceOnUse" x="780" y="0" width="260" height="209">
      <rect x="780" width="260" height="209" fill="white"/>
      <g fill="black">${armRegion}</g>
    </mask>
    <linearGradient id="c-ink" x1="0" y1="0" x2="0.4" y2="1">
      <stop stop-color="#193048"/><stop offset="1" stop-color="#132B44"/>
    </linearGradient>
    <linearGradient id="e-ink" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#122B43"/><stop offset="1" stop-color="#132A44"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#original-spa)">${image}</g>
  <path fill="url(#c-ink)" mask="url(#letter-c-mask)"
    d="M1033 0H891C834 0 789 45 789 101.5C789 158 834 203 891 203H1033L1003 162H891C857 162 833 136 833 101.5C833 67 857 41 891 41H1003Z"/>
  <g clip-path="url(#original-arm)">${image}</g>
  <path fill="url(#e-ink)"
    d="M1290 0H1158C1101 0 1056 45 1056 101.5C1056 158 1101 203 1158 203H1290V162H1158C1132 162 1111 145 1103 121H1260V82H1103C1111 58 1132 41 1158 41H1290Z"/>
</svg>`;
  await fs.writeFile(path.join(dir, 'wordmark-refined.svg'), svg);
  await sharp(Buffer.from(svg), { density: 144 }).png().toFile(path.join(dir, 'wordmark-refined.png'));
};

if (require.main === module) module.exports().catch(error => { console.error(error); process.exitCode = 1; });
