// One-off: links the default weekly plan in src/data/mockData.ts to real exercises in the
// photo library (exerciseDbId + start/end images), replacing the old animation keys.
import fs from 'node:fs';

const MAP = {
  'Barbell Bench Press': 'Barbell_Bench_Press_-_Medium_Grip',
  'Seated Dumbbell Press': 'Seated_Dumbbell_Press',
  'Cable Tricep Pushdowns': 'Triceps_Pushdown',
  'Incline Dumbbell Flyes': 'Incline_Dumbbell_Flyes',
  'Dumbbell Lateral Raises': 'Side_Lateral_Raise',
  'Parallel Bar Dips': 'Dips_-_Chest_Version',
  'Lat Pulldown': 'Wide-Grip_Lat_Pulldown',
  'Single-Arm Dumbbell Row': 'One-Arm_Dumbbell_Row',
  'Incline Dumbbell Bicep Curl': 'Incline_Dumbbell_Curl',
  'Full Body Foam Rolling & Mobility': 'Quadriceps-SMR',
  'Barbell Back Squat': 'Barbell_Squat',
  'Romanian Deadlift (RDL)': 'Romanian_Deadlift',
  'Standing Calf Raises': 'Standing_Calf_Raises',
  'Overhead Barbell Military Press': 'Standing_Military_Press',
  'Hanging Leg Raises': 'Hanging_Leg_Raise',
  'HIIT Interval Rowing or Sprints': 'Rowing_Stationary',
};

const db = JSON.parse(fs.readFileSync('src/data/exerciseDb.json', 'utf8'));
const byId = Object.fromEntries(db.exercises.map((e) => [e.id, e]));
for (const id of Object.values(MAP)) if (!byId[id]) throw new Error(`Missing library id ${id}`);

const file = 'src/data/mockData.ts';
const text = fs.readFileSync(file, 'utf8');
const eol = text.includes('\r\n') ? '\r\n' : '\n';
const lines = text.split(/\r?\n/);
const out = [];
let current = null;
let linked = 0;

for (const line of lines) {
  const pad = line.match(/^\s*/)[0];
  const name = line.match(/^\s+name: '(.+)',\s*$/)?.[1];
  if (name && MAP[name]) current = byId[MAP[name]];

  if (current && /^\s+animationType: '/.test(line)) {
    out.push(`${pad}exerciseDbId: '${current.id}',`);
    out.push(`${pad}images: [${current.images.map((p) => `'${p}'`).join(', ')}],`);
    linked++;
    continue;
  }
  if (current && /^\s+imageUrl: '/.test(line)) {
    out.push(`${pad}imageUrl: \`\${EXERCISE_IMAGE_BASE}${current.images[0]}\`,`);
    current = null;
    continue;
  }
  out.push(line);
}

let result = out.join(eol);
if (!result.includes("from './exerciseDb'")) result = `import { EXERCISE_IMAGE_BASE } from './exerciseDb';${eol}${result}`;
fs.writeFileSync(file, result);
console.log(`Linked ${linked} of ${Object.keys(MAP).length} plan exercises`);
