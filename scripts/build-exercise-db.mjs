// Builds src/data/exerciseDb.json from Free Exercise DB (public domain, The Unlicense):
// https://github.com/yuhonas/free-exercise-db
// Pinned to one commit so the data and photo URLs never change under FITORA.
// Run: node scripts/build-exercise-db.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SHA = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5';
const DATA_URL = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${SHA}/dist/exercises.json`;
// jsDelivr serves GitHub files from a global CDN; pinned to the same commit.
export const IMAGE_BASE = `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@${SHA}/exercises/`;

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'src', 'data', 'exerciseDb.json');

// Fix text that was double-encoded upstream (UTF-8 read as Latin-1), e.g. "Â°" -> "°", "â€™" -> "’".
const fixText = (s) => {
  if (!/[ÂÃâ]/.test(s)) return s.trim();
  try {
    const fixed = Buffer.from(s, 'latin1').toString('utf8');
    return (fixed.includes('�') ? s : fixed).trim();
  } catch {
    return s.trim();
  }
};

const title = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const res = await fetch(DATA_URL);
if (!res.ok) throw new Error(`Download failed: ${res.status}`);
const raw = await res.json();

const exercises = raw
  .filter((x) => x.images?.length >= 1)
  .map((x) => ({
    id: x.id,
    name: fixText(x.name),
    level: x.level, // beginner | intermediate | expert
    category: x.category, // strength | stretching | plyometrics | cardio | powerlifting | olympic weightlifting | strongman
    equipment: x.equipment || 'none',
    force: x.force || null,
    mechanic: x.mechanic || null,
    primaryMuscles: x.primaryMuscles,
    secondaryMuscles: x.secondaryMuscles,
    instructions: x.instructions.map(fixText).filter(Boolean),
    images: x.images, // relative to IMAGE_BASE
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(out, JSON.stringify({ source: { name: 'Free Exercise DB', url: 'https://github.com/yuhonas/free-exercise-db', license: 'Unlicense (public domain)', commit: SHA }, imageBase: IMAGE_BASE, exercises }));
console.log(`Wrote ${exercises.length} exercises to ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
console.log('Muscle names:', [...new Set(exercises.flatMap((e) => e.primaryMuscles))].map(title).join(', '));
