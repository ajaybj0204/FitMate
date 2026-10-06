import React, { useMemo, useState } from 'react';
import { useFitMate } from '../context/FitMateContext';
import { ProgressEntry } from '../types';

export const ProgressSection: React.FC = () => {
  const { progressEntries, addProgressEntry, userProfile, achievements, logSteps, logSleep, stepsLog, sleepLog } = useFitMate();

  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50); // 0-100%

  // Temporary steps / sleep input
  const [inputSteps, setInputSteps] = useState(stepsLog.currentSteps);
  const [inputSleepHours, setInputSleepHours] = useState(sleepLog.sleepHours);
  const [inputSleepMins, setInputSleepMins] = useState(sleepLog.sleepMinutes);
  const [inputSleepQuality, setInputSleepQuality] = useState<any>(sleepLog.sleepQuality);

  // Form state for logging progress
  const [newWeight, setNewWeight] = useState<number>(userProfile.weightKg);
  const [newWaist, setNewWaist] = useState<number>(32.5);
  const [newChest, setNewChest] = useState<number>(42.0);
  const [newArms, setNewArms] = useState<number>(15.2);
  const [newThighs, setNewThighs] = useState<number>(22.1);
  const [newNotes, setNewNotes] = useState<string>('');

  const latestEntry = progressEntries[progressEntries.length - 1];
  const initialEntry = progressEntries[0];

  // Deltas
  const currentWeightLbs = (userProfile.weightKg * 2.20462).toFixed(1);
  const startWeightLbs = initialEntry ? (initialEntry.weightKg * 2.20462).toFixed(1) : '182.0';
  const goalWeightLbs = (68 * 2.20462).toFixed(1); // ~150 lbs / goal
  const deltaWeightLbs = (parseFloat(currentWeightLbs) - parseFloat(startWeightLbs)).toFixed(1);

  const waistDelta = latestEntry && initialEntry ? (latestEntry.waistInches - initialEntry.waistInches).toFixed(1) : '-1.5';
  const chestDelta = latestEntry && initialEntry ? (latestEntry.chestInches - initialEntry.chestInches).toFixed(1) : '+0.5';
  const armsDelta = latestEntry && initialEntry ? (latestEntry.armsInches - initialEntry.armsInches).toFixed(1) : '+0.8';

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProgressEntry({
      date: new Date().toISOString().split('T')[0],
      weightKg: newWeight,
      waistInches: newWaist,
      chestInches: newChest,
      armsInches: newArms,
      thighsInches: newThighs,
      notes: newNotes || 'Routine biometrics check-in.',
      bodyFatPercent: 16.2,
    });
    setIsLogModalOpen(false);
  };

  // Generate SVG path for chart based on timeframe
  const chartPoints = useMemo(() => {
    if (timeframe === '7d') {
      return [
        { x: 0, y: 70, label: 'Mon', val: '77.2 kg' },
        { x: 100, y: 75, label: 'Tue', val: '77.0 kg' },
        { x: 200, y: 85, label: 'Wed', val: '76.8 kg' },
        { x: 300, y: 80, label: 'Thu', val: '76.9 kg' },
        { x: 400, y: 100, label: 'Fri', val: '76.7 kg' },
        { x: 500, y: 120, label: 'Sat', val: '76.5 kg' },
        { x: 600, y: 130, label: 'Sun', val: '76.4 kg' },
      ];
    } else if (timeframe === '30d') {
      return [
        { x: 0, y: 40, label: 'Week 1', val: '182.0 lbs' },
        { x: 150, y: 65, label: 'Week 2', val: '179.4 lbs' },
        { x: 300, y: 95, label: 'Week 3', val: '176.8 lbs' },
        { x: 450, y: 120, label: 'Week 4', val: '175.2 lbs' },
        { x: 600, y: 150, label: 'Latest', val: '174.5 lbs' },
      ];
    } else {
      // 90d
      return [
        { x: 0, y: 30, label: 'Month 1', val: '82.5 kg' },
        { x: 200, y: 75, label: 'Month 2', val: '79.0 kg' },
        { x: 400, y: 120, label: 'Month 3', val: '77.1 kg' },
        { x: 600, y: 160, label: 'Goal Target', val: '76.5 kg' },
      ];
    }
  }, [timeframe]);

  const svgPathD = useMemo(() => {
    if (chartPoints.length < 2) return '';
    return chartPoints.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [chartPoints]);

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Top Banner / Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[#4edea3] text-xs font-bold uppercase tracking-wider mb-1">
            Analytics &amp; Milestones
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#d8e3fb]">
            Your Progress
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#111c2d] p-1 rounded-xl flex items-center border border-[#1f2a3c]">
            {[
              { id: '7d' as const, label: '7-Day' },
              { id: '30d' as const, label: '30-Day' },
              { id: '90d' as const, label: '90-Day' },
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === tf.id
                    ? 'bg-[#4edea3] text-[#003824] shadow-md shadow-[#4edea3]/20'
                    : 'text-[#bbcabf] hover:text-[#d8e3fb]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-[#4edea3]/20"
          >
            <span className="material-symbols-outlined text-[18px]">add_chart</span>
            Log Today's Progress
          </button>
        </div>
      </div>

      {/* Main Grid: Weight Progress & Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weight Progress Cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#111c2d] p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden border border-[#1f2a3c] shadow-xl group">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#4edea3]/5 rounded-full blur-2xl group-hover:bg-[#4edea3]/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86948a]">
                Current Weight
              </span>
              <span className="material-symbols-outlined text-[#4edea3] text-[20px]">scale</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl sm:text-5xl font-bold text-[#d8e3fb] tabular-nums">
                {userProfile.weightKg}
              </span>
              <span className="text-base text-[#86948a] font-medium">kg ({currentWeightLbs} lbs)</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[#4edea3] text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              <span>{deltaWeightLbs} lbs total change from baseline</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111c2d] p-5 rounded-2xl flex flex-col justify-between border border-[#1f2a3c]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">
                Starting
              </span>
              <div className="mt-3">
                <span className="font-headline text-2xl font-bold text-[#d8e3fb] tabular-nums">
                  {initialEntry?.weightKg || 82.5}
                </span>
                <span className="text-xs text-[#86948a]"> kg</span>
              </div>
            </div>

            <div className="bg-[#111c2d] p-5 rounded-2xl flex flex-col justify-between border border-[#1f2a3c]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#86948a]">
                Goal Target
              </span>
              <div className="mt-3">
                <span className="font-headline text-2xl font-bold text-[#98da27] tabular-nums">
                  75.0
                </span>
                <span className="text-xs text-[#86948a]"> kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weight History SVG Curve Chart */}
        <div className="lg:col-span-8 bg-[#111c2d] p-6 rounded-2xl flex flex-col justify-between border border-[#1f2a3c] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">
                Weight Trajectory Curve
              </h3>
              <p className="text-xs text-[#86948a]">
                {timeframe === '7d' ? 'Last 7 days' : timeframe === '30d' ? 'Last 30 days performance' : '90 days macro period'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]" />
              <span className="text-xs text-[#bbcabf] font-medium">Trajectory (Weight Trend)</span>
            </div>
          </div>

          {/* SVG Area & Line Chart */}
          <div className="w-full h-48 sm:h-52 relative flex items-end bg-[#152031] rounded-xl p-3 border border-[#1f2a3c]/60">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="progressGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4edea3" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4edea3" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area */}
              <path
                d={`${svgPathD} L 600 200 L 0 200 Z`}
                fill="url(#progressGrad)"
              />

              {/* Stroke line */}
              <path
                d={svgPathD}
                fill="none"
                stroke="#4edea3"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Point Circles */}
              {chartPoints.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={idx === chartPoints.length - 1 ? 6 : 4}
                    fill="#4edea3"
                    stroke="#081425"
                    strokeWidth={idx === chartPoints.length - 1 ? 2.5 : 1}
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Bottom X-Axis Labels */}
          <div className="flex justify-between text-xs text-[#86948a] font-medium mt-3 px-1">
            {chartPoints.map((pt, idx) => (
              <span key={idx} className={idx === chartPoints.length - 1 ? 'text-[#4edea3] font-bold' : ''}>
                {pt.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Body Measurements & Workout Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Body Measurements */}
        <div className="lg:col-span-6 bg-[#111c2d] p-6 rounded-2xl flex flex-col justify-between border border-[#1f2a3c] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">Body Measurements</h3>
            <span className="text-xs text-[#86948a] font-medium">Delta vs Start</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Waist */}
            <div className="bg-[#152031] p-3.5 rounded-xl flex items-center justify-between border border-[#1f2a3c]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1f2a3c] flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[20px]">straighten</span>
                </div>
                <div>
                  <div className="text-[11px] text-[#86948a]">Waist</div>
                  <div className="font-headline text-base font-bold text-[#d8e3fb]">
                    {latestEntry?.waistInches || 32.5}"{' '}
                    <span className="text-[#4edea3] text-xs ml-1 font-semibold">{waistDelta}"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chest */}
            <div className="bg-[#152031] p-3.5 rounded-xl flex items-center justify-between border border-[#1f2a3c]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1f2a3c] flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[20px]">accessibility</span>
                </div>
                <div>
                  <div className="text-[11px] text-[#86948a]">Chest</div>
                  <div className="font-headline text-base font-bold text-[#d8e3fb]">
                    {latestEntry?.chestInches || 42.0}"{' '}
                    <span className="text-[#4edea3] text-xs ml-1 font-semibold">{chestDelta}"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arms */}
            <div className="bg-[#152031] p-3.5 rounded-xl flex items-center justify-between border border-[#1f2a3c]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1f2a3c] flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                </div>
                <div>
                  <div className="text-[11px] text-[#86948a]">Arms</div>
                  <div className="font-headline text-base font-bold text-[#d8e3fb]">
                    {latestEntry?.armsInches || 15.2}"{' '}
                    <span className="text-[#4edea3] text-xs ml-1 font-semibold">{armsDelta}"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thighs */}
            <div className="bg-[#152031] p-3.5 rounded-xl flex items-center justify-between border border-[#1f2a3c]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1f2a3c] flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-[20px]">directions_run</span>
                </div>
                <div>
                  <div className="text-[11px] text-[#86948a]">Thighs</div>
                  <div className="font-headline text-base font-bold text-[#d8e3fb]">
                    {latestEntry?.thighsInches || 22.1}"{' '}
                    <span className="text-[#86948a] text-xs ml-1">0.0"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Statistics */}
        <div className="lg:col-span-6 bg-[#111c2d] p-6 rounded-2xl flex flex-col justify-between border border-[#1f2a3c] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">Workout Statistics</h3>
            <span className="text-xs text-[#86948a] font-medium">This Month</span>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <div className="bg-[#152031] p-4 rounded-xl flex flex-col items-center text-center border border-[#1f2a3c]">
              <div className="text-[#4edea3] mb-2">
                <span className="material-symbols-outlined text-[28px]">task_alt</span>
              </div>
              <span className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] tabular-nums">
                {userProfile.completedWorkoutsCount}
              </span>
              <span className="text-[11px] text-[#86948a] mt-0.5 font-medium">Completed</span>
            </div>

            <div className="bg-[#152031] p-4 rounded-xl flex flex-col items-center text-center border border-[#1f2a3c]">
              <div className="text-[#98da27] mb-2">
                <span className="material-symbols-outlined text-[28px]">local_fire_department</span>
              </div>
              <span className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] tabular-nums">
                88%
              </span>
              <span className="text-[11px] text-[#86948a] mt-0.5 font-medium">Consistency</span>
            </div>

            <div className="bg-[#152031] p-4 rounded-xl flex flex-col items-center text-center border border-[#1f2a3c]">
              <div className="text-[#ffb3af] mb-2">
                <span className="material-symbols-outlined text-[28px]">schedule</span>
              </div>
              <span className="font-headline text-2xl sm:text-3xl font-bold text-[#d8e3fb] tabular-nums">
                24h
              </span>
              <span className="text-[11px] text-[#86948a] mt-0.5 font-medium">Total Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Before & After Comparison Slider */}
      <div className="bg-[#111c2d] p-6 sm:p-8 rounded-2xl border border-[#1f2a3c] shadow-xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">Visual Transformation</div>
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-[#d8e3fb] mt-0.5">
              Before &amp; After Comparison Slider
            </h3>
            <p className="text-xs text-[#86948a] mt-0.5">
              Week 1 (82.5 kg, 18.5% BF) vs Week 4 (76.5 kg, 16.5% BF)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStepsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#152031] hover:bg-[#1f2a3c] text-[#98da27] border border-[#1f2a3c] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">directions_walk</span>
              <span>Log Steps</span>
            </button>
            <button
              onClick={() => setIsSleepModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#152031] hover:bg-[#1f2a3c] text-[#ffb3af] border border-[#1f2a3c] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">bedtime</span>
              <span>Log Sleep</span>
            </button>
          </div>
        </div>

        {/* Interactive Comparison Canvas */}
        <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-[#1f2a3c] bg-[#081425] select-none">
          {/* After image (full width behind) */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzvBKu5sZFk8xKMEYvSFvmAlbmAynYeppu9qHJGe1jwbNi5D3w_p_jBIz6HmQC8fIeq5qOk20SNivWZWDJOOTig1MV7ui5zD2wv57elkrhwRDEmzB8POw1Vb_p-fuVc-_mZWx-L3UqHV2LD5MJSLUlA6VXM9Kgkl5hk2GmbQFbS9sKmlrG1tCCXWFadDsLWLYwBSyy_0nAEIdlJvTZBkMD9CoPGYKbw67_BwodgK2njZa_Iy1ctzZ_ow"
            alt="Week 4 Current"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-[#081425]/85 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-[#4edea3] border border-[#4edea3]/40 z-10">
            WEEK 4 (NOW) • 76.5 kg
          </div>

          {/* Before image (clipped by slider position) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzp4aA584ztb62N5vTJc21hmEKZnMHKtkfnskZk8oQNX6V0aaD3HHbhpKNAtmEZGP0SL_UTl3Ha-vpph1EbVFg0Z7Y0SIjrsI1t6XC8TDXEzQ7HhaenVoRag48njDTrGuGGdhj691fFGApFM2QOGeNIm247dvUdZwHfV4B7KJFbuDPIs1iOwsLrIedeGXIG7I1rjsp_0vGiCt2OIhCyPlXtfHakX6ilqOevwVBaVr5hK1g4D6h37QhFA"
              alt="Week 1 Baseline"
              className="absolute inset-0 h-full object-cover max-w-none"
              style={{ width: '100%', minWidth: '100%', objectFit: 'cover' }}
            />
            <div className="absolute top-4 left-4 bg-[#081425]/85 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-[#d8e3fb] border border-[#3c4a42] z-10">
              WEEK 1 (BASELINE) • 82.5 kg
            </div>
          </div>

          {/* Vertical divider line and handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-[#4edea3] shadow-[0_0_10px_#4edea3] pointer-events-none z-20"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#4edea3] text-[#003824] flex items-center justify-center shadow-xl">
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            </div>
          </div>

          {/* Range Slider Controller overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={e => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />
        </div>

        <div className="text-center text-xs text-[#86948a]">
          ← Drag slider left or right to inspect muscle definition and abdominal changes →
        </div>
      </div>

      {/* Achievements & Badges Showcase */}
      <div className="bg-[#111c2d] p-6 sm:p-8 rounded-2xl border border-[#1f2a3c] shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">Gamification &amp; Consistency</div>
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-[#d8e3fb] mt-0.5">
              Achievements &amp; Badges
            </h3>
            <p className="text-xs text-[#86948a] mt-0.5">
              Milestone badges unlocked through workout consistency and nutritional compliance
            </p>
          </div>
          <span className="text-xs font-bold text-[#4edea3] bg-[#10b981]/20 px-3 py-1 rounded-full">
            {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                ach.unlocked
                  ? 'bg-[#152031] border-[#4edea3]/40'
                  : 'bg-[#152031]/50 border-[#1f2a3c] opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  ach.unlocked
                    ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                    : 'bg-[#1f2a3c] text-[#86948a]'
                }`}
              >
                <span className="material-symbols-outlined text-[26px]">{ach.icon}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#d8e3fb]">{ach.title}</h4>
                  {ach.unlocked && (
                    <span className="text-[10px] font-bold text-[#4edea3] bg-[#4edea3]/20 px-1.5 py-0.5 rounded">
                      Earned
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#bbcabf] mt-0.5 leading-relaxed">{ach.description}</p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#86948a]">
                  <span>Progress</span>
                  <span className="font-bold text-[#d8e3fb]">
                    {ach.progress} / {ach.maxProgress}
                  </span>
                </div>
                <div className="w-full bg-[#111c2d] h-1.5 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-[#4edea3] rounded-full"
                    style={{ width: `${Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Progress Visual Timeline */}
      <div className="bg-[#111c2d] p-6 rounded-2xl border border-[#1f2a3c] shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb]">Progress Timeline</h3>
            <p className="text-xs text-[#86948a]">
              Visual milestone check-ins from Week 1 to Week 4
            </p>
          </div>
          <span className="text-xs font-bold text-[#4edea3] bg-[#10b981]/20 px-3 py-1 rounded-full">
            Phase 1 Complete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              week: 'Week 1',
              weight: '182.0 lbs (82.5 kg)',
              bodyFat: '18.5%',
              img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzp4aA584ztb62N5vTJc21hmEKZnMHKtkfnskZk8oQNX6V0aaD3HHbhpKNAtmEZGP0SL_UTl3Ha-vpph1EbVFg0Z7Y0SIjrsI1t6XC8TDXEzQ7HhaenVoRag48njDTrGuGGdhj691fFGApFM2QOGeNIm247dvUdZwHfV4B7KJFbuDPIs1iOwsLrIedeGXIG7I1rjsp_0vGiCt2OIhCyPlXtfHakX6ilqOevwVBaVr5hK1g4D6h37QhFA',
              isLatest: false,
            },
            {
              week: 'Week 2',
              weight: '179.4 lbs (81.3 kg)',
              bodyFat: '17.9%',
              img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKceQB06CbqGQljOkKJJJo9iYgVwWYOeTLCv-dFpPoGoQO_bUSR-GgcAzlUwKu9zS5-4ZFK9wm5GefmPBW6vzZtMLS_gtFjgTcVTynCYiw-9lUjEZct2vLLnd3N48bXnf5JvqyYdyHCt54d635I14Smu0D1JtwCOOEec8X45vVwyfz89OweM9cNE8m0pSSQxphoBdPNj5fqjop08h5DfizUyLk3rlNu2NL_W0uTOK0Opb9jQcepKtTEA',
              isLatest: false,
            },
            {
              week: 'Week 3',
              weight: '176.8 lbs (80.2 kg)',
              bodyFat: '17.2%',
              img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSw8S49rJ-_ocvvR1U4OGdpcXH-dJGACXJECaEm69PGIVcKYpUP_Qeg5CeOsXh4-bX6778O1I3tSpxnphwKxbKSHUn-MyFVDHzV4UzuZ70yNntlBEqxfZXLundSl6aPNRgLNtQPbgvwjCBOE4l226gtZGgLIkVCrAnbaMbcWM052wjTf2Bjqx8sIa2g-8BEZ0hVvsoJiKnnbG4vKT8HRGuIQoJCfR-dygS04HI_wyYGgKy8jjjbF_hYw',
              isLatest: false,
            },
            {
              week: 'Week 4 (Latest)',
              weight: '174.5 lbs (76.5 kg)',
              bodyFat: '16.5%',
              img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzvBKu5sZFk8xKMEYvSFvmAlbmAynYeppu9qHJGe1jwbNi5D3w_p_jBIz6HmQC8fIeq5qOk20SNivWZWDJOOTig1MV7ui5zD2wv57elkrhwRDEmzB8POw1Vb_p-fuVc-_mZWx-L3UqHV2LD5MJSLUlA6VXM9Kgkl5hk2GmbQFbS9sKmlrG1tCCXWFadDsLWLYwBSyy_0nAEIdlJvTZBkMD9CoPGYKbw67_BwodgK2njZa_Iy1ctzZ_ow',
              isLatest: true,
            },
          ].map((entry, idx) => (
            <div
              key={idx}
              className={`bg-[#152031] rounded-xl overflow-hidden flex flex-col border ${
                entry.isLatest ? 'border-[#4edea3]/70 ring-1 ring-[#4edea3]/30' : 'border-[#1f2a3c]'
              }`}
            >
              <div className="h-40 bg-cover bg-center relative bg-[#040e1f]">
                <img
                  src={entry.img}
                  alt={entry.week}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#081425]/85 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#d8e3fb]">
                  {entry.week}
                </div>
              </div>

              <div className="p-3.5 flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#86948a]">Weight</span>
                  <span className="text-[#d8e3fb] font-semibold">{entry.weight}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#86948a]">Body Fat</span>
                  <span className="text-[#4edea3] font-bold">{entry.bodyFat}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Modal */}
      {isStepsModalOpen && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#152031] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-[#1f2a3c]">
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] mb-1">Log Today's Steps</h3>
            <p className="text-xs text-[#86948a] mb-4">Daily NEAT physical activity tracking</p>
            <input
              type="number"
              value={inputSteps}
              onChange={e => setInputSteps(Number(e.target.value))}
              className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] font-bold mb-4 focus:outline-none focus:border-[#4edea3]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsStepsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logSteps(inputSteps);
                  setIsStepsModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-bold"
              >
                Save Steps
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Modal */}
      {isSleepModalOpen && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#152031] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-[#1f2a3c]">
            <h3 className="font-headline text-lg font-bold text-[#d8e3fb] mb-1">Log Sleep &amp; Recovery</h3>
            <p className="text-xs text-[#86948a] mb-4">Calculate neurological &amp; muscular readiness score</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[11px] text-[#86948a] block mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={inputSleepHours}
                  onChange={e => setInputSleepHours(Number(e.target.value))}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-3 py-2 text-xs text-[#d8e3fb]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#86948a] block mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputSleepMins}
                  onChange={e => setInputSleepMins(Number(e.target.value))}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-3 py-2 text-xs text-[#d8e3fb]"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[11px] text-[#86948a] block mb-1">Quality</label>
              <select
                value={inputSleepQuality}
                onChange={e => setInputSleepQuality(e.target.value)}
                className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-3 py-2 text-xs text-[#d8e3fb]"
              >
                <option value="Deep">Deep &amp; Restorative</option>
                <option value="Restful">Restful</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor / Fragmented</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsSleepModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logSleep(inputSleepHours, inputSleepMins, inputSleepQuality);
                  setIsSleepModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-bold"
              >
                Save Sleep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Progress Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#152031] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-[#1f2a3c] my-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-headline text-xl font-bold text-[#d8e3fb]">
                Log Today's Progress
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-[#86948a] hover:text-[#d8e3fb]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={e => setNewWeight(Number(e.target.value))}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2.5 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">
                    Waist (inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWaist}
                    onChange={e => setNewWaist(Number(e.target.value))}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">
                    Chest (inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newChest}
                    onChange={e => setNewChest(Number(e.target.value))}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">
                    Arms (inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newArms}
                    onChange={e => setNewArms(Number(e.target.value))}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">
                    Thighs (inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newThighs}
                    onChange={e => setNewThighs(Number(e.target.value))}
                    className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2 text-sm text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#d8e3fb] block mb-1">
                  Progress Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Feeling energetic, recovered well from leg day..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full bg-[#111c2d] border border-[#3c4a42] rounded-xl px-4 py-2 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1f2a3c]">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111c2d] text-[#d8e3fb] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4edea3] text-[#003824] text-xs font-bold hover:bg-[#6ffbbe]"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
