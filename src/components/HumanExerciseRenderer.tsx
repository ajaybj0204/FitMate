import React from 'react';
import { ExerciseAnimationType } from '../types';
import { CameraViewAngle } from '../types/exerciseAnimation';

interface HumanExerciseRendererProps {
  type: ExerciseAnimationType;
  motionProgress: number; // 0.0 to 1.0 (continuous cycle)
  cameraAngle: CameraViewAngle; // 'side' | 'front' | '3d'
  isPeak: boolean;
  activePhaseIndex: number;
}

/**
 * HumanExerciseRenderer
 * Renders an anatomically proportioned human fitness athlete performing
 * the exact, exercise-specific biomechanical movement with realistic athletic
 * physique, joint articulation, athletic apparel, equipment, and motion guidance arrows.
 */
export const HumanExerciseRenderer: React.FC<HumanExerciseRendererProps> = ({
  type,
  motionProgress,
  cameraAngle,
  isPeak,
  activePhaseIndex,
}) => {
  // Biomechanical displacement curve (0 to 1 and back to 0 with natural acceleration/deceleration)
  const repProgress = Math.sin(motionProgress * Math.PI); // 0.0 -> 1.0 -> 0.0
  const isMovingDown = motionProgress < 0.5;

  return (
    <svg
      viewBox="0 0 540 360"
      className="w-full h-full max-h-80 sm:max-h-92 md:max-h-96 select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Realistic Human Athlete Skin Tone Gradients */}
        <linearGradient id="skinPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7c8a0" />
          <stop offset="40%" stopColor="#e5a676" />
          <stop offset="80%" stopColor="#cf8b57" />
          <stop offset="100%" stopColor="#b36e3c" />
        </linearGradient>

        <linearGradient id="skinHighlight" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fedfc4" />
          <stop offset="50%" stopColor="#f0b68a" />
          <stop offset="100%" stopColor="#d9935f" />
        </linearGradient>

        <linearGradient id="skinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d9935f" />
          <stop offset="100%" stopColor="#8c4b20" />
        </linearGradient>

        {/* Athletic Performance Hair / Cap */}
        <linearGradient id="athleteHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#33241b" />
          <stop offset="70%" stopColor="#1a110b" />
          <stop offset="100%" stopColor="#0d0805" />
        </linearGradient>

        {/* Premium Athletic Apparel (FITORA Dark Charcoal & Emerald) */}
        <linearGradient id="apparelShorts" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="60%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>

        <linearGradient id="apparelTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#13271f" />
          <stop offset="60%" stopColor="#0b1b14" />
          <stop offset="100%" stopColor="#06120d" />
        </linearGradient>

        {/* Athletic Footwear / Sneakers */}
        <linearGradient id="sneakerUpper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="sneakerSole" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Gym Equipment Metals */}
        <linearGradient id="chromeBar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#cbd5e1" />
          <stop offset="60%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        <linearGradient id="olympicBumperRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>

        <linearGradient id="olympicBumperGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4edea3" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Subtle Muscle Highlight Glow Filters (Soft Coral Red) */}
        <radialGradient id="muscleContractionGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4757" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#ff2e44" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ff4757" stopOpacity="0" />
        </radialGradient>

        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Motion Arrow Pulse Glow */}
        <filter id="arrowGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <marker id="arrowHeadUp" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M 0 6 L 3 0 L 6 6 Z" fill="#4edea3" />
        </marker>
        <marker id="arrowHeadDown" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M 0 0 L 3 6 L 6 0 Z" fill="#4edea3" />
        </marker>
      </defs>

      {/* Gym Floor Platform Mat with grid perspective */}
      <g opacity="0.85">
        <line x1="40" y1="315" x2="500" y2="315" stroke="#1f2c3d" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="270" cy="316" rx="160" ry="8" fill="#080f1a" opacity="0.6" />
        {/* Subtle floor perspective markers */}
        <line x1="170" y1="315" x2="150" y2="330" stroke="#152233" strokeWidth="1.5" />
        <line x1="270" y1="315" x2="270" y2="332" stroke="#152233" strokeWidth="1.5" />
        <line x1="370" y1="315" x2="390" y2="330" stroke="#152233" strokeWidth="1.5" />
      </g>

      {/* ========================================================================= */}
      {/* 1. SQUAT: Human performing full barbell back squat                        */}
      {/* ========================================================================= */}
      {type === 'squat' && (() => {
        // Biomechanical kinematics:
        // Standing: hips at (270, 150), knees at (295, 230), feet at (270, 312)
        // Bottom Squat: hips hinge back and descend to (235, 218), knees push forward to (305, 245)
        const isFrontView = cameraAngle === 'front';
        const is3DView = cameraAngle === '3d';

        const hipX = isFrontView ? 270 : is3DView ? 260 - repProgress * 22 : 255 - repProgress * 30;
        const hipY = 145 + repProgress * 70; // 145 (standing) -> 215 (parallel squat depth)
        const kneeX = isFrontView ? 230 - repProgress * 15 : is3DView ? 290 + repProgress * 20 : 285 + repProgress * 24;
        const kneeY = 230 + repProgress * 18;
        const chestTilt = isFrontView ? 0 : is3DView ? repProgress * 18 : repProgress * 24; // natural forward torso hinge

        return (
          <g transform="translate(0, 0)">
            {/* Dynamic Motion Arrow Guidance */}
            <g opacity="0.9" filter="url(#arrowGlow)">
              {isMovingDown ? (
                <g>
                  {/* Lowering Arrow */}
                  <path
                    d="M 175 160 Q 165 200 175 235"
                    stroke="#4edea3"
                    strokeWidth="3"
                    strokeDasharray="4 3"
                    fill="none"
                  />
                  <polygon points="171,235 179,235 175,245" fill="#4edea3" />
                  <text x="120" y="200" fill="#4edea3" fontSize="10" fontWeight="bold">
                    SINK HIPS ⬇️
                  </text>
                </g>
              ) : (
                <g>
                  {/* Driving Up Arrow */}
                  <path
                    d="M 175 235 Q 165 195 175 160"
                    stroke="#4edea3"
                    strokeWidth="3"
                    strokeDasharray="4 3"
                    fill="none"
                  />
                  <polygon points="171,160 179,160 175,150" fill="#4edea3" />
                  <text x="120" y="200" fill="#4edea3" fontSize="10" fontWeight="bold">
                    DRIVE UP ⬆️
                  </text>
                </g>
              )}
            </g>

            {/* Ground Contact Shadow */}
            <ellipse cx="270" cy="316" rx="45" ry="7" fill="#000000" opacity="0.5" />

            {/* HUMAN ATHLETE BODY */}
            <g>
              {/* Back Foot / Shoe */}
              <g transform="translate(245, 306)">
                <path d="M 0 8 L 30 8 Q 34 6 32 0 L 8 -1 Q 3 2 0 8 Z" fill="url(#sneakerUpper)" />
                <rect x="0" y="6" width="34" height="4" rx="2" fill="url(#sneakerSole)" />
              </g>

              {/* Front Foot / Shoe (Planted firmly on midfoot/heel) */}
              <g transform="translate(265, 308)">
                <path d="M 0 8 L 36 8 Q 40 6 37 0 L 10 -2 Q 4 1 0 8 Z" fill="url(#sneakerUpper)" />
                <rect x="0" y="6" width="40" height="4" rx="2" fill="url(#sneakerSole)" />
                {/* Laces */}
                <line x1="14" y1="0" x2="22" y2="4" stroke="#ffffff" strokeWidth="1.2" />
                <line x1="16" y1="-2" x2="24" y2="2" stroke="#ffffff" strokeWidth="1.2" />
              </g>

              {/* Lower Leg / Calf (Gastrocnemius & Tibia) */}
              <path
                d={`M 275 306 Q 288 270 ${kneeX} ${kneeY} L ${kneeX - 16} ${kneeY} Q 262 272 262 306 Z`}
                fill="url(#skinPrimary)"
                stroke="url(#skinShadow)"
                strokeWidth="1"
              />

              {/* Thigh (Femur with sculpted Quadriceps & Hamstrings) */}
              <path
                d={`M ${kneeX} ${kneeY} Q ${(kneeX + hipX) / 2 + 14} ${(kneeY + hipY) / 2 + 12} ${hipX + 16} ${hipY + 8} L ${hipX - 14} ${hipY - 6} Q ${(kneeX + hipX) / 2 - 14} ${(kneeY + hipY) / 2 - 12} ${kneeX - 16} ${kneeY} Z`}
                fill="url(#skinPrimary)"
                stroke="url(#skinShadow)"
                strokeWidth="1"
              />

              {/* SUBTLE MUSCLE HIGHLIGHT: Quadriceps Glow during movement */}
              <g opacity={0.65 + repProgress * 0.35} filter="url(#softGlow)">
                <path
                  d={`M ${kneeX - 4} ${kneeY - 6} Q ${(kneeX + hipX) / 2 + 6} ${(kneeY + hipY) / 2 - 2} ${hipX + 2} ${hipY + 2} L ${hipX - 6} ${hipY - 4} Q ${(kneeX + hipX) / 2 - 8} ${(kneeY + hipY) / 2 - 10} ${kneeX - 10} ${kneeY - 6} Z`}
                  fill="url(#muscleContractionGlow)"
                />
              </g>

              {/* Gluteus Maximus Highlight at bottom pause */}
              {isPeak && (
                <circle cx={hipX - 10} cy={hipY + 4} r="14" fill="url(#muscleContractionGlow)" opacity="0.8" filter="url(#softGlow)" />
              )}

              {/* Athletic Compression Shorts */}
              <path
                d={`M ${hipX - 22} ${hipY - 14} Q ${hipX} ${hipY - 24} ${hipX + 24} ${hipY - 10} L ${hipX + 16} ${hipY + 22} Q ${hipX} ${hipY + 20} ${hipX - 18} ${hipY + 16} Z`}
                fill="url(#apparelShorts)"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              {/* Teal waistband accent */}
              <path d={`M ${hipX - 22} ${hipY - 14} Q ${hipX} ${hipY - 24} ${hipX + 24} ${hipY - 10}`} stroke="#4edea3" strokeWidth="2" fill="none" />

              {/* Torso & Head rotated with natural squat hinge */}
              <g transform={`rotate(${chestTilt}, ${hipX}, ${hipY})`}>
                {/* Torso (Erect spine, athletic chest & upper back) */}
                <path
                  d={`M ${hipX - 16} ${hipY - 10} L ${hipX - 8} ${hipY - 78} L ${hipX + 16} ${hipY - 76} L ${hipX + 12} ${hipY - 10} Z`}
                  fill="url(#apparelTop)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
                {/* FITORA Chest emblem */}
                <circle cx={hipX + 6} cy={hipY - 58} r="3" fill="#4edea3" />

                {/* Neck */}
                <path d={`M ${hipX} ${hipY - 78} L ${hipX} ${hipY - 92} L ${hipX + 10} ${hipY - 92} L ${hipX + 12} ${hipY - 78} Z`} fill="url(#skinPrimary)" />

                {/* Athletic Head (Realistic Face profile & Hair) */}
                <g>
                  {/* Cranium & Jaw */}
                  <ellipse cx={hipX + 8} cy={hipY - 104} rx="14" ry="16" fill="url(#skinHighlight)" />
                  {/* Nose & Chin profile */}
                  <path d={`M ${hipX + 20} ${hipY - 106} L ${hipX + 24} ${hipY - 102} L ${hipX + 19} ${hipY - 98} L ${hipX + 20} ${hipY - 92} L ${hipX + 12} ${hipY - 90}`} fill="url(#skinPrimary)" />
                  {/* Athletic Hair */}
                  <path d={`M ${hipX - 4} ${hipY - 108} Q ${hipX + 4} ${hipY - 124} ${hipX + 20} ${hipY - 114} L ${hipX + 18} ${hipY - 108} Q ${hipX + 8} ${hipY - 112} ${hipX - 4} ${hipY - 104} Z`} fill="url(#athleteHair)" />
                  {/* Ear */}
                  <ellipse cx={hipX + 4} cy={hipY - 102} rx="3" ry="4.5" fill="url(#skinShadow)" />
                </g>

                {/* Olympic Barbell resting safely across upper traps */}
                <rect x={hipX - 110} y={hipY - 84} width="220" height="7" rx="3" fill="url(#chromeBar)" />
                {/* Olympic Red 20kg Bumper Plates */}
                <rect x={hipX - 98} y={hipY - 114} width="11" height="66" rx="3" fill="url(#olympicBumperRed)" stroke="#7f1d1d" strokeWidth="1" />
                <rect x={hipX + 88} y={hipY - 114} width="11" height="66" rx="3" fill="url(#olympicBumperRed)" stroke="#7f1d1d" strokeWidth="1" />

                {/* Arm gripping the barbell */}
                <path
                  d={`M ${hipX + 6} ${hipY - 70} Q ${hipX - 15} ${hipY - 55} ${hipX - 45} ${hipY - 80}`}
                  stroke="url(#skinPrimary)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Hand on bar */}
                <circle cx={hipX - 45} cy={hipY - 80} r="6" fill="url(#skinHighlight)" />
              </g>
            </g>

            {/* Biomechanical Depth Guide Line (Parallel indicator) */}
            <g opacity="0.65" transform="translate(0, 0)">
              <line x1="200" y1="215" x2="330" y2="215" stroke="#4edea3" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="338" y="218" fill="#4edea3" fontSize="9" fontWeight="bold">
                PARALLEL DEPTH
              </text>
            </g>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 2. BICEPS CURL: Person standing upright, curling dumbbells                */}
      {/* ========================================================================= */}
      {type === 'bicep_curl' && (() => {
        // Standing erect athlete
        // Upper arm stays vertical at ribcage
        // Forearm pivots from extended (y=245) up to shoulder height (y=140)
        const handY = 245 - repProgress * 105;
        const handX = 295 - repProgress * 22;
        const bicepBulgeRadius = 9 + repProgress * 5;

        return (
          <g transform="translate(10, 0)">
            {/* Motion Arrow Arc */}
            <g opacity="0.85" filter="url(#arrowGlow)">
              <path
                d="M 315 240 Q 330 190 295 145"
                stroke="#4edea3"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                fill="none"
              />
              <polygon points="295,145 303,142 300,152" fill="#4edea3" />
              <text x="335" y="195" fill="#4edea3" fontSize="10" fontWeight="bold">
                CURL ARC ⬆️
              </text>
            </g>

            {/* Feet planted */}
            <g transform="translate(225, 308)">
              <path d="M 0 8 L 34 8 Q 38 6 35 0 L 10 -2 Q 4 1 0 8 Z" fill="url(#sneakerUpper)" />
              <rect x="0" y="6" width="38" height="4" rx="2" fill="url(#sneakerSole)" />
            </g>
            <g transform="translate(265, 308)">
              <path d="M 0 8 L 34 8 Q 38 6 35 0 L 10 -2 Q 4 1 0 8 Z" fill="url(#sneakerUpper)" />
              <rect x="0" y="6" width="38" height="4" rx="2" fill="url(#sneakerSole)" />
            </g>

            {/* Legs (Straight standing posture) */}
            <path d="M 235 308 L 245 220 L 260 220 L 255 308 Z" fill="url(#skinPrimary)" />
            <path d="M 275 308 L 280 220 L 295 220 L 295 308 Z" fill="url(#skinHighlight)" />

            {/* Athletic Shorts */}
            <rect x="235" y="180" width="60" height="44" rx="6" fill="url(#apparelShorts)" />
            <line x1="235" y1="184" x2="295" y2="184" stroke="#4edea3" strokeWidth="2" />

            {/* Torso (Athletic tank top) */}
            <path d="M 240 180 L 244 110 L 286 110 L 290 180 Z" fill="url(#apparelTop)" />
            <circle cx="265" cy="140" r="3" fill="#4edea3" />

            {/* Neck & Head */}
            <rect x="258" y="94" width="14" height="18" fill="url(#skinPrimary)" />
            <ellipse cx="265" cy="80" rx="15" ry="18" fill="url(#skinHighlight)" />
            {/* Facial profile */}
            <path d="M 278 78 L 283 82 L 277 86 L 278 90 L 270 92" fill="url(#skinPrimary)" />
            <path d="M 252 75 Q 262 60 278 68 L 276 74 Q 266 68 252 78 Z" fill="url(#athleteHair)" />

            {/* Stationed Shoulder Deltoid */}
            <circle cx="286" cy="115" r="11" fill="url(#skinHighlight)" />

            {/* Upper Arm (Pinned firmly at ribcage) */}
            <line x1="286" y1="115" x2="292" y2="175" stroke="url(#skinPrimary)" strokeWidth="15" strokeLinecap="round" />

            {/* ACTIVE WORKING MUSCLE: BICEPS BRACHII (THICKENS AT TOP SQUEEZE) */}
            <g opacity={0.6 + repProgress * 0.4} filter="url(#softGlow)">
              <ellipse
                cx="290"
                cy="148"
                rx={bicepBulgeRadius}
                ry="16"
                fill="url(#muscleContractionGlow)"
                transform="rotate(-10, 290, 148)"
              />
            </g>

            {/* Forearm pivoting up */}
            <line x1="292" y1="175" x2={handX} y2={handY} stroke="url(#skinHighlight)" strokeWidth="13" strokeLinecap="round" />

            {/* Realistic Hex Dumbbell in hand */}
            <g transform={`translate(${handX}, ${handY}) rotate(-12)`}>
              {/* Hand wrapping handle */}
              <circle cx="0" cy="0" r="8" fill="url(#skinPrimary)" />
              {/* Knurled Handle */}
              <rect x="-18" y="-3.5" width="36" height="7" rx="2" fill="url(#chromeBar)" />
              {/* Hex rubber weight heads */}
              <rect x="-24" y="-18" width="8" height="36" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="16" y="-18" width="8" height="36" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            </g>

            {/* Stationary Elbow Cue */}
            <circle cx="292" cy="175" r="4" fill="#4edea3" opacity="0.8" />
            <text x="302" y="178" fill="#86948a" fontSize="8" fontWeight="bold">
              ELBOW PINNED
            </text>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 3. PUSH-UP: Person in high plank, lowering chest toward floor             */}
      {/* ========================================================================= */}
      {type === 'pushup' && (() => {
        // High Plank: hands at (190, 295), feet at (420, 295)
        // Body lowers as a single rigid line from y=210 down to y=275
        const bodyY = 210 + repProgress * 65; // High plank -> low chest hover
        const elbowX = 220 + repProgress * 15;
        const elbowY = bodyY - 18 - repProgress * 8;

        return (
          <g transform="translate(0, 10)">
            {/* Motion Arrow Cue */}
            <g opacity="0.85" filter="url(#arrowGlow)">
              {isMovingDown ? (
                <g>
                  <path d="M 120 220 L 120 270" stroke="#4edea3" strokeWidth="2.5" strokeDasharray="3 3" />
                  <polygon points="117,270 123,270 120,277" fill="#4edea3" />
                  <text x="75" y="245" fill="#4edea3" fontSize="9" fontWeight="bold">
                    LOWER ⬇️
                  </text>
                </g>
              ) : (
                <g>
                  <path d="M 120 270 L 120 220" stroke="#4edea3" strokeWidth="2.5" strokeDasharray="3 3" />
                  <polygon points="117,220 123,220 120,213" fill="#4edea3" />
                  <text x="80" y="245" fill="#4edea3" fontSize="9" fontWeight="bold">
                    PUSH ⬆️
                  </text>
                </g>
              )}
            </g>

            {/* Feet planted on toes */}
            <g transform="translate(415, 292)">
              <ellipse cx="6" cy="6" rx="14" ry="5" fill="#000000" opacity="0.4" />
              <path d="M 0 5 L 18 5 L 14 -8 L 0 -4 Z" fill="url(#sneakerUpper)" />
              <rect x="0" y="3" width="20" height="3" fill="url(#sneakerSole)" />
            </g>

            {/* Hand planted flat on gym mat */}
            <ellipse cx="190" cy="298" rx="12" ry="4" fill="#000000" opacity="0.5" />
            <path d="M 180 295 L 202 295 L 198 288 L 182 288 Z" fill="url(#skinPrimary)" />

            {/* RIGID BODY LINE (Calves -> Thighs -> Hips -> Torso -> Head) */}
            {/* Legs */}
            <line x1="418" y1="288" x2="330" y2={bodyY + 28} stroke="url(#skinPrimary)" strokeWidth="18" strokeLinecap="round" />
            {/* Shorts */}
            <line x1="335" y1={bodyY + 28} x2="280" y2={bodyY + 14} stroke="url(#apparelShorts)" strokeWidth="22" strokeLinecap="round" />

            {/* Torso (Chest & Abs in straight rigid plank) */}
            <line x1="285" y1={bodyY + 14} x2="195" y2={bodyY} stroke="url(#apparelTop)" strokeWidth="26" strokeLinecap="round" />

            {/* SUBTLE CHEST & TRICEPS CONTRACTION GLOW */}
            <g opacity={0.6 + repProgress * 0.4} filter="url(#softGlow)">
              <ellipse cx="205" cy={bodyY + 6} rx="18" ry="12" fill="url(#muscleContractionGlow)" />
            </g>

            {/* Head in neutral spine alignment */}
            <ellipse cx="160" cy={bodyY - 4} rx="15" ry="17" fill="url(#skinHighlight)" transform={`rotate(-10, 160, ${bodyY - 4})`} />
            <path d="M 148 290 Q 155 275 168 282" fill="none" />

            {/* Arm Kinematics (Shoulder -> Elbow -> Hand on floor) */}
            {/* Upper arm */}
            <line x1="195" y1={bodyY} x2={elbowX} y2={elbowY} stroke="url(#skinPrimary)" strokeWidth="14" strokeLinecap="round" />
            {/* Forearm */}
            <line x1={elbowX} y1={elbowY} x2="190" y2="295" stroke="url(#skinHighlight)" strokeWidth="12" strokeLinecap="round" />

            {/* Rigid Plank Guide Line */}
            <line x1="160" y1={bodyY - 4} x2="420" y2="288" stroke="#4edea3" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <text x="290" y={bodyY - 12} fill="#4edea3" fontSize="8" fontWeight="bold">
              STRAIGHT PLANK LINE
            </text>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 4. BENCH PRESS: Supine on flat gym bench pressing barbell                 */}
      {/* ========================================================================= */}
      {type === 'bench_press' && (() => {
        // Flat workout bench
        // Barbell travels from chest (y=180) up to full arm extension (y=105)
        const barY = 175 - repProgress * 70;
        const elbowX = 230 - repProgress * 22;
        const elbowY = 185 - repProgress * 32;

        return (
          <g transform="translate(15, 10)">
            {/* Motion Arrow */}
            <g opacity="0.85" filter="url(#arrowGlow)">
              <path d="M 155 175 L 155 110" stroke="#4edea3" strokeWidth="2.5" strokeDasharray="3 3" />
              <polygon points="152,110 158,110 155,102" fill="#4edea3" />
              <text x="100" y="145" fill="#4edea3" fontSize="9" fontWeight="bold">
                PRESS UP ⬆️
              </text>
            </g>

            {/* Flat Gym Bench */}
            <g>
              <rect x="140" y="200" width="260" height="18" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <rect x="175" y="218" width="14" height="88" fill="#1e293b" />
              <rect x="355" y="218" width="14" height="88" fill="#1e293b" />
              <rect x="155" y="302" width="54" height="6" rx="2" fill="#020617" />
              <rect x="335" y="302" width="54" height="6" rx="2" fill="#020617" />
            </g>

            {/* Athlete lying on bench */}
            {/* Foot on floor */}
            <g transform="translate(365, 300)">
              <rect x="0" y="0" width="32" height="8" rx="3" fill="url(#sneakerUpper)" />
            </g>
            <path d="M 345 208 L 375 255 L 375 304" stroke="url(#skinPrimary)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Torso lying on bench with arch */}
            <path d="M 175 195 Q 240 185 320 200" stroke="url(#apparelTop)" strokeWidth="28" strokeLinecap="round" fill="none" />

            {/* SUBTLE CHEST MUSCLE CONTRACTION HIGHLIGHT */}
            <g opacity={0.6 + repProgress * 0.4} filter="url(#softGlow)">
              <ellipse cx="235" cy="184" rx="22" ry="12" fill="url(#muscleContractionGlow)" />
            </g>

            {/* Head on bench */}
            <circle cx="160" cy="192" r="16" fill="url(#skinHighlight)" />

            {/* Arms Kinematics */}
            <line x1="195" y1="185" x2={elbowX} y2={elbowY} stroke="url(#skinPrimary)" strokeWidth="16" strokeLinecap="round" />
            <line x1={elbowX} y1={elbowY} x2="235" y2={barY} stroke="url(#skinHighlight)" strokeWidth="13" strokeLinecap="round" />
            <circle cx="235" cy={barY} r="7" fill="url(#skinPrimary)" />

            {/* Olympic Barbell & Weight Plates */}
            <rect x="70" y={barY - 4} width="330" height="8" rx="4" fill="url(#chromeBar)" />
            {/* Plates on Left */}
            <rect x="95" y={barY - 34} width="10" height="68" rx="3" fill="url(#olympicBumperRed)" stroke="#7f1d1d" />
            <rect x="107" y={barY - 26} width="8" height="52" rx="2" fill="url(#olympicBumperGreen)" stroke="#047857" />
            {/* Plates on Right */}
            <rect x="365" y={barY - 34} width="10" height="68" rx="3" fill="url(#olympicBumperRed)" stroke="#7f1d1d" />
            <rect x="355" y={barY - 26} width="8" height="52" rx="2" fill="url(#olympicBumperGreen)" stroke="#047857" />
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 5. DEADLIFT: Hip hinge, pulling bar from shins to standing lockout        */}
      {/* ========================================================================= */}
      {type === 'deadlift' && (() => {
        // Standing: hips at 265, 150, bar at thighs (y=170)
        // Hinged down: hips back at (295, 175), bar down at shins (y=265)
        const hipX = 265 + repProgress * 28;
        const barY = 175 + repProgress * 90;
        const torsoTilt = repProgress * 38;

        return (
          <g transform="translate(10, 0)">
            {/* Motion Arrow */}
            <g opacity="0.85" filter="url(#arrowGlow)">
              <path d="M 160 265 L 160 180" stroke="#4edea3" strokeWidth="2.5" strokeDasharray="3 3" />
              <polygon points="157,180 163,180 160,172" fill="#4edea3" />
              <text x="115" y="225" fill="#4edea3" fontSize="9" fontWeight="bold">
                PULL UP ⬆️
              </text>
            </g>

            {/* Feet planted */}
            <g transform="translate(245, 308)">
              <rect x="0" y="0" width="38" height="8" rx="3" fill="url(#sneakerUpper)" />
            </g>

            {/* Shins & Calves */}
            <line x1="255" y1="308" x2="265" y2="235" stroke="url(#skinPrimary)" strokeWidth="16" strokeLinecap="round" />

            {/* Thigh (Femur hinging back) */}
            <line x1="265" y1="235" x2={hipX} y2="165" stroke="url(#skinPrimary)" strokeWidth="18" strokeLinecap="round" />

            {/* HAMSTRING & GLUTE HIGHLIGHT */}
            <g opacity={0.65 + repProgress * 0.35} filter="url(#softGlow)">
              <line x1="265" y1="235" x2={hipX} y2="165" stroke="url(#muscleContractionGlow)" strokeWidth="12" strokeLinecap="round" />
            </g>

            {/* Shorts */}
            <circle cx={hipX} cy="165" r="18" fill="url(#apparelShorts)" />

            {/* Torso & Head rotated with hip hinge */}
            <g transform={`rotate(${torsoTilt}, ${hipX}, 165)`}>
              <path d={`M ${hipX} 165 L ${hipX - 68} 130`} stroke="url(#apparelTop)" strokeWidth="24" strokeLinecap="round" />
              <circle cx={hipX - 88} cy="120" r="16" fill="url(#skinHighlight)" />

              {/* Arms hanging holding barbell */}
              <line x1={hipX - 50} y1="140" x2="245" y2={barY} stroke="url(#skinPrimary)" strokeWidth="12" strokeLinecap="round" />
              <circle cx="245" cy={barY} r="7" fill="url(#skinHighlight)" />

              {/* Olympic Barbell & Plates */}
              <rect x="130" y={barY - 4} width="240" height="8" rx="4" fill="url(#chromeBar)" />
              <rect x="150" y={barY - 32} width="12" height="64" rx="3" fill="url(#olympicBumperRed)" />
              <rect x="330" y={barY - 32} width="12" height="64" rx="3" fill="url(#olympicBumperRed)" />
            </g>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 6. SHOULDER & MILITARY PRESS: Pressing vertically overhead                */}
      {/* ========================================================================= */}
      {(type === 'shoulder_press' || type === 'military_press') && (() => {
        // Dumbbells/barbell travels from shoulders (y=140) to overhead lockout (y=55)
        const dbY = 140 - repProgress * 85;
        const handLeftX = 225 - repProgress * 15;
        const handRightX = 305 + repProgress * 15;
        const elbowY = 160 - repProgress * 65;

        return (
          <g transform="translate(0, 5)">
            {/* Motion Arrow */}
            <g opacity="0.85" filter="url(#arrowGlow)">
              <path d="M 175 140 L 175 60" stroke="#4edea3" strokeWidth="2.5" strokeDasharray="3 3" />
              <polygon points="172,60 178,60 175,52" fill="#4edea3" />
              <text x="115" y="105" fill="#4edea3" fontSize="9" fontWeight="bold">
                PRESS UP ⬆️
              </text>
            </g>

            {/* Standing posture */}
            <rect x="235" y="306" width="30" height="8" rx="3" fill="url(#sneakerUpper)" />
            <rect x="270" y="306" width="30" height="8" rx="3" fill="url(#sneakerUpper)" />
            <path d="M 245 306 L 250 200 L 285 200 L 285 306 Z" fill="url(#skinPrimary)" />
            <rect x="240" y="170" width="55" height="40" rx="5" fill="url(#apparelShorts)" />

            {/* Torso */}
            <path d="M 245 170 L 250 115 L 285 115 L 290 170 Z" fill="url(#apparelTop)" />
            <circle cx="268" cy="140" r="3" fill="#4edea3" />

            {/* Head */}
            <ellipse cx="268" cy="85" rx="15" ry="18" fill="url(#skinHighlight)" />

            {/* ACTIVE DELTOID MUSCLE HIGHLIGHT */}
            <g opacity={0.7 + repProgress * 0.3} filter="url(#softGlow)">
              <ellipse cx="242" cy="118" rx="12" ry="15" fill="url(#muscleContractionGlow)" />
              <ellipse cx="294" cy="118" rx="12" ry="15" fill="url(#muscleContractionGlow)" />
            </g>

            {/* Left Arm & Weight */}
            <line x1="245" y1="118" x2="225" y2={elbowY} stroke="url(#skinPrimary)" strokeWidth="13" strokeLinecap="round" />
            <line x1="225" y1={elbowY} x2={handLeftX} y2={dbY} stroke="url(#skinHighlight)" strokeWidth="11" strokeLinecap="round" />
            <g transform={`translate(${handLeftX}, ${dbY})`}>
              <circle cx="0" cy="0" r="7" fill="url(#skinPrimary)" />
              <rect x="-16" y="-3" width="32" height="6" rx="2" fill="url(#chromeBar)" />
              <rect x="-22" y="-14" width="7" height="28" rx="2" fill="#1e293b" />
              <rect x="15" y="-14" width="7" height="28" rx="2" fill="#1e293b" />
            </g>

            {/* Right Arm & Weight */}
            <line x1="290" y1="118" x2="310" y2={elbowY} stroke="url(#skinPrimary)" strokeWidth="13" strokeLinecap="round" />
            <line x1="310" y1={elbowY} x2={handRightX} y2={dbY} stroke="url(#skinHighlight)" strokeWidth="11" strokeLinecap="round" />
            <g transform={`translate(${handRightX}, ${dbY})`}>
              <circle cx="0" cy="0" r="7" fill="url(#skinPrimary)" />
              <rect x="-16" y="-3" width="32" height="6" rx="2" fill="url(#chromeBar)" />
              <rect x="-22" y="-14" width="7" height="28" rx="2" fill="#1e293b" />
              <rect x="15" y="-14" width="7" height="28" rx="2" fill="#1e293b" />
            </g>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 7. LATERAL RAISE: Standing, raising dumbbells in side arc                */}
      {/* ========================================================================= */}
      {type === 'lateral_raise' && (() => {
        // Arms raise from thighs (y=220) out to shoulder height (y=120)
        const armAngle = 20 + repProgress * 65; // 20° down to 85° horizontal
        const leftHandX = 265 - Math.sin((armAngle * Math.PI) / 180) * 85;
        const leftHandY = 120 + Math.cos((armAngle * Math.PI) / 180) * 85;
        const rightHandX = 275 + Math.sin((armAngle * Math.PI) / 180) * 85;
        const rightHandY = 120 + Math.cos((armAngle * Math.PI) / 180) * 85;

        return (
          <g transform="translate(0, 10)">
            {/* Lateral Motion Arrows */}
            <g opacity="0.85" filter="url(#arrowGlow)">
              <path d="M 215 200 Q 185 170 170 130" stroke="#4edea3" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
              <polygon points="170,130 174,138 165,136" fill="#4edea3" />
              <path d="M 325 200 Q 355 170 370 130" stroke="#4edea3" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
              <polygon points="370,130 375,136 366,138" fill="#4edea3" />
            </g>

            {/* Standing athlete */}
            <rect x="240" y="306" width="28" height="8" rx="3" fill="url(#sneakerUpper)" />
            <rect x="272" y="306" width="28" height="8" rx="3" fill="url(#sneakerUpper)" />
            <path d="M 248 306 L 252 205 L 288 205 L 292 306 Z" fill="url(#skinPrimary)" />
            <rect x="245" y="175" width="50" height="38" rx="5" fill="url(#apparelShorts)" />

            <path d="M 248 175 L 252 115 L 288 115 L 292 175 Z" fill="url(#apparelTop)" />
            <ellipse cx="270" cy="85" rx="15" ry="18" fill="url(#skinHighlight)" />

            {/* DELTOIDS CONTRACTION HIGHLIGHT */}
            <g opacity={0.65 + repProgress * 0.35} filter="url(#softGlow)">
              <circle cx="250" cy="118" r="12" fill="url(#muscleContractionGlow)" />
              <circle cx="290" cy="118" r="12" fill="url(#muscleContractionGlow)" />
            </g>

            {/* Left Arm & Weight */}
            <line x1="252" y1="118" x2={leftHandX} y2={leftHandY} stroke="url(#skinPrimary)" strokeWidth="12" strokeLinecap="round" />
            <g transform={`translate(${leftHandX}, ${leftHandY})`}>
              <circle cx="0" cy="0" r="6" fill="url(#skinHighlight)" />
              <rect x="-14" y="-3" width="28" height="6" rx="2" fill="url(#chromeBar)" />
              <rect x="-18" y="-12" width="6" height="24" rx="2" fill="#1e293b" />
              <rect x="12" y="-12" width="6" height="24" rx="2" fill="#1e293b" />
            </g>

            {/* Right Arm & Weight */}
            <line x1="288" y1="118" x2={rightHandX} y2={rightHandY} stroke="url(#skinPrimary)" strokeWidth="12" strokeLinecap="round" />
            <g transform={`translate(${rightHandX}, ${rightHandY})`}>
              <circle cx="0" cy="0" r="6" fill="url(#skinHighlight)" />
              <rect x="-14" y="-3" width="28" height="6" rx="2" fill="url(#chromeBar)" />
              <rect x="-18" y="-12" width="6" height="24" rx="2" fill="#1e293b" />
              <rect x="12" y="-12" width="6" height="24" rx="2" fill="#1e293b" />
            </g>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 8. LUNGE: Stepping forward into 90/90 knee bend                            */}
      {/* ========================================================================= */}
      {type === 'lunge' && (() => {
        const dropY = repProgress * 48; // hips drop into 90/90
        const frontKneeX = 230;
        const frontKneeY = 240 + dropY * 0.4;
        const backKneeX = 330;
        const backKneeY = 245 + dropY * 1.1;

        return (
          <g transform="translate(0, 10)">
            {/* Motion Arrow */}
            <g opacity="0.85" filter="url(#arrowGlow)">
              <path d="M 280 180 L 280 230" stroke="#4edea3" strokeWidth="2.5" strokeDasharray="3 3" />
              <polygon points="277,230 283,230 280,237" fill="#4edea3" />
              <text x="290" y="210" fill="#4edea3" fontSize="9" fontWeight="bold">
                SINK 90/90 ⬇️
              </text>
            </g>

            {/* Front Foot Planted */}
            <g transform="translate(210, 306)">
              <rect x="0" y="0" width="38" height="8" rx="3" fill="url(#sneakerUpper)" />
            </g>
            {/* Back Foot on Toes */}
            <g transform="translate(350, 304)">
              <rect x="0" y="0" width="26" height="8" rx="3" fill="url(#sneakerUpper)" transform="rotate(-25)" />
            </g>

            {/* Front Leg (Shin & Thigh) */}
            <line x1="225" y1="306" x2={frontKneeX} y2={frontKneeY} stroke="url(#skinPrimary)" strokeWidth="15" strokeLinecap="round" />
            <line x1={frontKneeX} y1={frontKneeY} x2="275" y2={180 + dropY} stroke="url(#skinPrimary)" strokeWidth="17" strokeLinecap="round" />

            {/* Back Leg (Shin hovering & Thigh) */}
            <line x1="360" y1="304" x2={backKneeX} y2={backKneeY} stroke="url(#skinPrimary)" strokeWidth="15" strokeLinecap="round" />
            <line x1={backKneeX} y1={backKneeY} x2="275" y2={180 + dropY} stroke="url(#skinPrimary)" strokeWidth="17" strokeLinecap="round" />

            {/* QUAD & GLUTE HIGHLIGHT */}
            <g opacity={0.65 + repProgress * 0.35} filter="url(#softGlow)">
              <circle cx={frontKneeX} cy={frontKneeY - 12} r="14" fill="url(#muscleContractionGlow)" />
            </g>

            {/* Shorts */}
            <rect x="255" y={170 + dropY} width="40" height="34" rx="5" fill="url(#apparelShorts)" />

            {/* Torso upright like a soldier */}
            <path d={`M 260 ${170 + dropY} L 265 ${105 + dropY} L 285 ${105 + dropY} L 290 ${170 + dropY} Z`} fill="url(#apparelTop)" />
            <ellipse cx="275" cy={80 + dropY} rx="15" ry="18" fill="url(#skinHighlight)" />

            {/* Arms at sides holding dumbbells */}
            <line x1="265" y1={115 + dropY} x2="265" y2={180 + dropY} stroke="url(#skinPrimary)" strokeWidth="11" strokeLinecap="round" />
            <rect x="255" y={175 + dropY} width="20" height="12" rx="3" fill="#1e293b" />
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 9. PULL-UP & LAT PULLDOWN: Vertical pull engaging wide lats               */}
      {/* ========================================================================= */}
      {(type === 'pullup' || type === 'lat_pulldown') && (() => {
        const isPullup = type === 'pullup';
        const pullProgress = repProgress;
        const chinY = isPullup ? 120 - pullProgress * 55 : 120;
        const barY = isPullup ? 65 : 65 + pullProgress * 55;
        const elbowX = 230 - pullProgress * 15;
        const elbowY = 135 + (isPullup ? -pullProgress * 45 : pullProgress * 25);

        return (
          <g transform="translate(0, 10)">
            {/* Overhead Rig Bar */}
            <line x1="160" y1="65" x2="380" y2="65" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

            {/* Motion Arrow */}
            <g opacity="0.85" filter="url(#arrowGlow)">
              <path d="M 130 140 L 130 80" stroke="#4edea3" strokeWidth="2.5" strokeDasharray="3 3" />
              <polygon points="127,80 133,80 130,72" fill="#4edea3" />
              <text x="80" y="115" fill="#4edea3" fontSize="9" fontWeight="bold">
                PULL CHIN UP ⬆️
              </text>
            </g>

            {/* Athlete Torso hanging or seated */}
            <g transform={`translate(0, ${isPullup ? -pullProgress * 55 : 0})`}>
              {/* Head with chin rising over bar */}
              <ellipse cx="270" cy={110} rx="15" ry="18" fill="url(#skinHighlight)" />

              {/* LATS MUSCLE CONTRACTION HIGHLIGHT */}
              <g opacity={0.7 + pullProgress * 0.3} filter="url(#softGlow)">
                <ellipse cx="250" cy="148" rx="16" ry="24" fill="url(#muscleContractionGlow)" />
                <ellipse cx="290" cy="148" rx="16" ry="24" fill="url(#muscleContractionGlow)" />
              </g>

              {/* Back / Torso (V-taper) */}
              <path d="M 245 130 L 255 190 L 285 190 L 295 130 Z" fill="url(#apparelTop)" />
              <rect x="250" y="190" width="40" height="34" rx="4" fill="url(#apparelShorts)" />

              {/* Legs hanging or crossed */}
              <path d="M 255 224 L 260 295 L 280 295 L 285 224 Z" fill="url(#skinPrimary)" />
            </g>

            {/* Arm Kinematics pulling up to bar */}
            <line x1="245" y1={isPullup ? 130 - pullProgress * 55 : 130} x2={elbowX} y2={elbowY} stroke="url(#skinPrimary)" strokeWidth="15" strokeLinecap="round" />
            <line x1={elbowX} y1={elbowY} x2="225" y2={barY} stroke="url(#skinHighlight)" strokeWidth="12" strokeLinecap="round" />
            <circle cx="225" cy={barY} r="7" fill="url(#skinHighlight)" />

            <line x1="295" y1={isPullup ? 130 - pullProgress * 55 : 130} x2={540 - elbowX} y2={elbowY} stroke="url(#skinPrimary)" strokeWidth="15" strokeLinecap="round" />
            <line x1={540 - elbowX} y1={elbowY} x2="315" y2={barY} stroke="url(#skinHighlight)" strokeWidth="12" strokeLinecap="round" />
            <circle cx="315" cy={barY} r="7" fill="url(#skinHighlight)" />
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 10. PLANK & LEG RAISE: Core abdominal stability                           */}
      {/* ========================================================================= */}
      {(type === 'plank' || type === 'leg_raise') && (() => {
        const isPlank = type === 'plank';
        const legRaiseAngle = isPlank ? 0 : repProgress * 80;

        return (
          <g transform="translate(0, 15)">
            {/* Forearm Plank on Floor */}
            {isPlank ? (
              <g>
                <line x1="160" y1="288" x2="440" y2="288" stroke="#4edea3" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                {/* Feet */}
                <rect x="420" y="278" width="22" height="10" rx="3" fill="url(#sneakerUpper)" />
                {/* Forearms on mat */}
                <rect x="180" y="282" width="28" height="6" rx="2" fill="url(#skinPrimary)" />

                {/* Rigid Body Line */}
                <line x1="425" y1="280" x2="330" y2="245" stroke="url(#skinPrimary)" strokeWidth="17" strokeLinecap="round" />
                <line x1="335" y1="245" x2="260" y2="235" stroke="url(#apparelShorts)" strokeWidth="22" strokeLinecap="round" />
                <line x1="265" y1="235" x2="195" y2="230" stroke="url(#apparelTop)" strokeWidth="25" strokeLinecap="round" />

                {/* CORE ABS CONTRACTION PULSE */}
                <g opacity={0.75 + (isPeak ? 0.25 : 0)} filter="url(#softGlow)">
                  <rect x="235" y="235" width="38" height="14" rx="4" fill="url(#muscleContractionGlow)" />
                </g>

                {/* Head */}
                <circle cx="165" cy="225" r="15" fill="url(#skinHighlight)" />
                <line x1="195" y1="230" x2="190" y2="282" stroke="url(#skinPrimary)" strokeWidth="14" strokeLinecap="round" />

                <text x="250" y="215" fill="#4edea3" fontSize="9" fontWeight="bold">
                  RIGID CORE BRACE
                </text>
              </g>
            ) : (
              /* Lying Leg Raise */
              <g>
                {/* Lying on back */}
                <line x1="170" y1="280" x2="290" y2="280" stroke="url(#apparelTop)" strokeWidth="24" strokeLinecap="round" />
                <circle cx="150" cy="275" r="15" fill="url(#skinHighlight)" />
                <rect x="270" y="268" width="35" height="24" rx="4" fill="url(#apparelShorts)" />

                {/* Legs rotating upward */}
                <g transform={`rotate(-${legRaiseAngle}, 300, 280)`}>
                  <line x1="300" y1="280" x2="420" y2="280" stroke="url(#skinPrimary)" strokeWidth="16" strokeLinecap="round" />
                  <rect x="415" y="272" width="22" height="10" rx="3" fill="url(#sneakerUpper)" />
                </g>

                {/* Lower Abs Glow */}
                <g opacity={0.7 + repProgress * 0.3} filter="url(#softGlow)">
                  <circle cx="280" cy="275" r="14" fill="url(#muscleContractionGlow)" />
                </g>
              </g>
            )}
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 11. UNIVERSAL FALLBACK: Bent-Over Row / Dips / Triceps / Other             */}
      {/* ========================================================================= */}
      {(type === 'row' || type === 'tricep' || type === 'chest_fly' || type === 'dips' || type === 'calf_raise' || type === 'leg_press' || type === 'cardio' || type === 'recovery') && (() => {
        // High quality dynamic athletic posture
        const motionY = repProgress * 50;

        return (
          <g transform="translate(10, 10)">
            <ellipse cx="270" cy="316" rx="40" ry="7" fill="#000000" opacity="0.4" />
            <rect x="245" y="306" width="32" height="8" rx="3" fill="url(#sneakerUpper)" />

            {/* Standing athlete */}
            <line x1="255" y1="306" x2="265" y2="220" stroke="url(#skinPrimary)" strokeWidth="16" strokeLinecap="round" />
            <rect x="245" y="175" width="45" height="42" rx="5" fill="url(#apparelShorts)" />
            <path d="M 248 175 L 255 110 L 285 110 L 290 175 Z" fill="url(#apparelTop)" />
            <ellipse cx="270" cy="85" rx="15" ry="18" fill="url(#skinHighlight)" />

            {/* Dynamic Target Muscle Glow */}
            <g opacity={0.7 + repProgress * 0.3} filter="url(#softGlow)">
              <ellipse cx="270" cy="140" rx="20" ry="16" fill="url(#muscleContractionGlow)" />
            </g>

            {/* Animated Active Arm */}
            <line x1="255" y1="115" x2="230" y2={165 + (type === 'row' ? -motionY : motionY)} stroke="url(#skinPrimary)" strokeWidth="14" strokeLinecap="round" />
            <line x1="230" y1={165 + (type === 'row' ? -motionY : motionY)} x2="265" y2={210 + (type === 'row' ? -motionY : motionY)} stroke="url(#skinHighlight)" strokeWidth="12" strokeLinecap="round" />
            <circle cx="265" cy={210 + (type === 'row' ? -motionY : motionY)} r="7" fill="url(#skinPrimary)" />

            {/* Direction cue */}
            <g opacity="0.8" filter="url(#arrowGlow)">
              <text x="140" y="160" fill="#4edea3" fontSize="10" fontWeight="bold">
                {type === 'row' ? 'PULL TO HIPS ⬅️' : 'CONTROL TEMPO 🔄'}
              </text>
            </g>
          </g>
        );
      })()}
    </svg>
  );
};
