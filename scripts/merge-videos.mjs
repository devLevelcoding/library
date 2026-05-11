import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const resultsDir = resolve(__dirname, '../test-results');
const output = resolve(resultsDir, 'FULL-SHOP-TOUR.mp4');

// Collect all video.webm files sorted by folder name (= test order)
const videos = readdirSync(resultsDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('FULL'))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(d => resolve(resultsDir, d.name, 'video.webm'))
  .filter(p => existsSync(p));

if (videos.length === 0) {
  console.error('❌  No video.webm files found. Run `npm run test:e2e` first.');
  process.exit(1);
}

console.log(`🎬  Found ${videos.length} videos:`);
videos.forEach(v => console.log(`   ${v}`));
console.log(`\n🔗  Merging → ${output}\n`);

// Build a single ffmpeg command that inputs all videos and concatenates them
const cmd = ffmpeg();

videos.forEach(v => cmd.input(v));

cmd
  .on('start', cmdLine => console.log('▶  ffmpeg:', cmdLine))
  .on('progress', p => process.stdout.write(`\r⏳  ${Math.round(p.percent ?? 0)}%   `))
  .on('end', () => {
    console.log('\n\n✅  Done!');
    console.log(`📁  ${output}`);
    // Open in default video player on macOS
    try { execSync(`open "${output}"`); } catch {}
  })
  .on('error', err => {
    console.error('\n❌  ffmpeg error:', err.message);
    process.exit(1);
  })
  .mergeToFile(output, '/tmp');
