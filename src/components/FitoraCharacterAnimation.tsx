import React, { useMemo } from 'react';
import { ExerciseAnimationType } from '../types';

export interface FitoraCharacterAnimationProps {
  type: ExerciseAnimationType;
  motionProgress: number; // 0.0 to 1.0 (continuous cycle)
  isPeak: boolean;
  className?: string;
}

/**
 * FitoraCharacterAnimation
 * A clean, modern, stylized animated human fitness character inspired by modern
 * motion design. Demonstrates exercises clearly at first glance with full-body visibility,
 * natural athletic proportions, exercise-specific equipment, and zero visual clutter.
 */
export const FitoraCharacterAnimation: React.FC<FitoraCharacterAnimationProps> = ({
  type,
  motionProgress,
  isPeak,
  className = '',
}) => {
  // Biomechanical sinusoidal ease-in-out contraction curve (0 -> 1 -> 0)
  const p = Math.sin(motionProgress * Math.PI); // 0.0 to 1.0
  const isDescending = motionProgress < 0.5;

  return (
    <svg
      viewBox="0 0 500 360"
      className={`w-full h-full max-h-80 sm:max-h-92 md:max-h-96 select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Stylized Human Skin Tones (Warm Athletic Tan) */}
        <linearGradient id="charSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8c8a0" />
          <stop offset="100%" stopColor="#e5a87b" />
        </linearGradient>

        <linearGradient id="charSkinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e5a87b" />
          <stop offset="100%" stopColor="#cb8859" />
        </linearGradient>

        {/* FITORA Modern Athletic Apparel */}
        {/* Sleeveless Tank Top: Modern Teal / Emerald Slate */}
        <linearGradient id="charTankTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#254854" />
          <stop offset="60%" stopColor="#1b3640" />
          <stop offset="100%" stopColor="#142930" />
        </linearGradient>

        {/* Gym Shorts: Dark Charcoal with FITORA Teal Trim */}
        <linearGradient id="charShorts" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#202c3d" />
          <stop offset="100%" stopColor="#141c27" />
        </linearGradient>

        {/* Hair: Modern Dark Styled Hair */}
        <linearGradient id="charHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2c201a" />
          <stop offset="100%" stopColor="#17100c" />
        </linearGradient>

        {/* Athletic Footwear: Clean White/Teal Sneakers */}
        <linearGradient id="charSneaker" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="80%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Equipment: Matte Chrome & Rubber Cast Iron */}
        <linearGradient id="charDumbbellIron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#384556" />
          <stop offset="50%" stopColor="#242e3a" />
          <stop offset="100%" stopColor="#161c24" />
        </linearGradient>

        <linearGradient id="charChrome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Olympic Bumper Plate (Red) */}
        <linearGradient id="charBumperRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="60%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>

        {/* Soft Dynamic Floor Contact Shadow */}
        <radialGradient id="charFloorShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Clean Studio Gym Floor & Dynamic Ground Shadow */}
      <g>
        {/* Subtle baseline floor grid line */}
        <line x1="60" y1="318" x2="440" y2="318" stroke="#1f2a3c" strokeWidth="2" strokeLinecap="round" />
        {/* Dynamic floor shadow expanding / contracting with body height */}
        <ellipse
          cx="250"
          cy="318"
          rx={type === 'pushup' || type === 'plank' || type === 'bench_press' ? 140 : 55 + p * 15}
          ry={type === 'pushup' || type === 'plank' || type === 'bench_press' ? 14 : 9 - p * 2}
          fill="url(#charFloorShadow)"
        />
      </g>

      {/* ========================================================================= */}
      {/* 1. SQUAT / THRUSTER: Standing -> Sinking into deep squat -> Driving up    */}
      {/* ========================================================================= */}
      {type === 'squat' && (() => {
        // Hips drop from y=165 down to y=235
        const hipY = 165 + p * 68;
        const kneeY = 245 + p * 14;
        const kneeSpread = 32 + p * 16;
        const torsoTilt = p * 18; // slight natural forward tilt

        // Hands holding dumbbells at shoulder level (or overhead thruster)
        const handY = hipY - 72;

        return (
          <g transform="translate(0, 0)">
            {/* Sneaker Feet (Planted wide with toes slightly angled) */}
            <g transform="translate(195, 308)">
              <rect x="0" y="6" width="34" height="6" rx="2" fill="url(#charSneaker)" />
              <path d="M 4 6 L 28 6 Q 32 3 28 0 L 8 0 Q 3 2 4 6 Z" fill="#38bdf8" />
              <line x1="8" y1="0" x2="16" y2="6" stroke="#ffffff" strokeWidth="1" />
            </g>
            <g transform="translate(270, 308)">
              <rect x="0" y="6" width="34" height="6" rx="2" fill="url(#charSneaker)" />
              <path d="M 4 6 L 28 6 Q 32 3 28 0 L 8 0 Q 3 2 4 6 Z" fill="#38bdf8" />
              <line x1="8" y1="0" x2="16" y2="6" stroke="#ffffff" strokeWidth="1" />
            </g>

            {/* White Athletic Socks */}
            <rect x="204" y="298" width="16" height="11" rx="2" fill="#ffffff" />
            <rect x="279" y="298" width="16" height="11" rx="2" fill="#ffffff" />

            {/* Calves & Shins */}
            <path d={`M 204 300 L ${250 - kneeSpread} ${kneeY} L ${250 - kneeSpread + 18} ${kneeY} L 220 300 Z`} fill="url(#charSkin)" />
            <path d={`M 280 300 L ${250 + kneeSpread - 18} ${kneeY} L ${250 + kneeSpread} ${kneeY} L 296 300 Z`} fill="url(#charSkin)" />

            {/* Thighs */}
            <path d={`M ${250 - kneeSpread} ${kneeY} L 235 ${hipY + 12} L 250 ${hipY + 12} L ${250 - kneeSpread + 18} ${kneeY} Z`} fill="url(#charSkin)" />
            <path d={`M ${250 + kneeSpread} ${kneeY} L 265 ${hipY + 12} L 250 ${hipY + 12} L ${250 + kneeSpread - 18} ${kneeY} Z`} fill="url(#charSkin)" />

            {/* Athletic Shorts */}
            <path
              d={`M 220 ${hipY} Q 250 ${hipY - 10} 280 ${hipY} L 275 ${hipY + 28} Q 250 ${hipY + 20} 225 ${hipY + 28} Z`}
              fill="url(#charShorts)"
            />
            {/* FITORA Emerald Trim Band on Shorts */}
            <path d={`M 222 ${hipY + 26} L 278 ${hipY + 26}`} stroke="#4edea3" strokeWidth="2.5" />

            {/* Torso & Head (tilts slightly forward as hips sink) */}
            <g transform={`rotate(${torsoTilt}, 250, ${hipY})`}>
              {/* Torso Tank Top */}
              <path
                d={`M 226 ${hipY} L 228 ${hipY - 65} L 272 ${hipY - 65} L 274 ${hipY} Z`}
                fill="url(#charTankTop)"
              />
              {/* FITORA Logo Accent on Chest */}
              <circle cx="250" cy={hipY - 45} r="3" fill="#4edea3" />

              {/* Neck */}
              <rect x="243" y={hipY - 80} width="14" height="18" rx="2" fill="url(#charSkin)" />

              {/* Head & Face */}
              <ellipse cx="250" cy={hipY - 96} rx="15" ry="18" fill="url(#charSkin)" />
              {/* Modern Styled Hair */}
              <path
                d={`M 235 ${hipY - 98} Q 242 ${hipY - 118} 265 ${hipY - 106} L 262 ${hipY - 98} Z`}
                fill="url(#charHair)"
              />
              {/* Ears */}
              <circle cx="234" cy={hipY - 96} r="3.5" fill="url(#charSkinShadow)" />
              <circle cx="266" cy={hipY - 96} r="3.5" fill="url(#charSkinShadow)" />

              {/* Olympic Barbell across upper back / traps */}
              <rect x="135" y={hipY - 74} width="230" height="7" rx="3" fill="url(#charChrome)" />
              {/* Red Bumper Plates */}
              <rect x="155" y={hipY - 100} width="12" height="58" rx="3" fill="url(#charBumperRed)" />
              <rect x="333" y={hipY - 100} width="12" height="58" rx="3" fill="url(#charBumperRed)" />

              {/* Arms gripping bar firmly */}
              <path
                d={`M 230 ${hipY - 65} Q 215 ${hipY - 45} 205 ${hipY - 70}`}
                stroke="url(#charSkin)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="205" cy={hipY - 70} r="7" fill="url(#charSkinShadow)" />

              <path
                d={`M 270 ${hipY - 65} Q 285 ${hipY - 45} 295 ${hipY - 70}`}
                stroke="url(#charSkin)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="295" cy={hipY - 70} r="7" fill="url(#charSkinShadow)" />
            </g>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 2. BENCH PRESS: Person lying on bench, pressing barbell to lockout        */}
      {/* ========================================================================= */}
      {type === 'bench_press' && (() => {
        // Barbell descends from lockout (y=110) down to chest touch (y=178)
        const barY = 175 - (1 - p) * 65;
        const elbowX = 225 - (1 - p) * 20;
        const elbowY = 180 - (1 - p) * 28;

        return (
          <g transform="translate(20, 10)">
            {/* Flat Gym Workout Bench */}
            <g>
              {/* Padded bench top */}
              <rect x="120" y="200" width="260" height="18" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              {/* Bench upright support posts */}
              <rect x="155" y="218" width="12" height="85" fill="#0f172a" />
              <rect x="335" y="218" width="12" height="85" fill="#0f172a" />
              <rect x="135" y="298" width="52" height="6" rx="2" fill="#090d16" />
              <rect x="315" y="298" width="52" height="6" rx="2" fill="#090d16" />
            </g>

            {/* Athlete lying on bench */}
            {/* Planted foot & shoe */}
            <g transform="translate(355, 296)">
              <rect x="0" y="0" width="34" height="8" rx="2" fill="url(#charSneaker)" />
            </g>
            {/* Leg bent from bench to floor */}
            <path d="M 330 205 L 360 250 L 360 298" stroke="url(#charSkin)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Torso lying on bench */}
            <path d="M 160 196 Q 230 186 310 200" stroke="url(#charTankTop)" strokeWidth="28" strokeLinecap="round" fill="none" />

            {/* Head resting on bench pad */}
            <circle cx="150" cy="192" r="16" fill="url(#charSkin)" />
            <path d="M 136 190 Q 142 176 156 182" fill="url(#charHair)" />

            {/* Arm Kinematics */}
            <line x1="185" y1="188" x2={elbowX} y2={elbowY} stroke="url(#charSkin)" strokeWidth="15" strokeLinecap="round" />
            <line x1={elbowX} y1={elbowY} x2="225" y2={barY} stroke="url(#charSkinShadow)" strokeWidth="13" strokeLinecap="round" />
            <circle cx="225" cy={barY} r="7" fill="url(#charSkin)" />

            {/* Olympic Barbell */}
            <rect x="60" y={barY - 4} width="330" height="8" rx="4" fill="url(#charChrome)" />
            {/* Left Weight Plates */}
            <rect x="85" y={barY - 34} width="12" height="68" rx="3" fill="url(#charBumperRed)" />
            <rect x="99" y={barY - 26} width="8" height="52" rx="2" fill="#4edea3" />
            {/* Right Weight Plates */}
            <rect x="355" y={barY - 34} width="12" height="68" rx="3" fill="url(#charBumperRed)" />
            <rect x="345" y={barY - 26} width="8" height="52" rx="2" fill="#4edea3" />
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 3. PUSH-UP: Person in plank, lowering body and pushing back up            */}
      {/* ========================================================================= */}
      {type === 'pushup' && (() => {
        // High plank (y=215) down to lowest hover (y=275)
        const bodyY = 215 + p * 60;
        const elbowY = bodyY - 14 - p * 8;

        return (
          <g transform="translate(10, 10)">
            {/* Planted toes / sneakers */}
            <g transform="translate(390, 292)">
              <rect x="0" y="4" width="22" height="6" rx="2" fill="url(#charSneaker)" />
              <path d="M 0 4 L 18 4 L 14 -8 L 0 -4 Z" fill="#38bdf8" />
            </g>

            {/* Hand flat on floor */}
            <path d="M 168 295 L 192 295 L 188 288 L 170 288 Z" fill="url(#charSkin)" />

            {/* RIGID BODY LINE (Calves -> Thighs -> Hips -> Torso -> Head) */}
            <line x1="395" y1="288" x2="310" y2={bodyY + 26} stroke="url(#charSkin)" strokeWidth="18" strokeLinecap="round" />
            <line x1="315" y1={bodyY + 26} x2="260" y2={bodyY + 12} stroke="url(#charShorts)" strokeWidth="22" strokeLinecap="round" />
            <line x1="265" y1={bodyY + 12} x2="175" y2={bodyY} stroke="url(#charTankTop)" strokeWidth="26" strokeLinecap="round" />

            {/* Head in neutral spine line */}
            <ellipse cx="140" cy={bodyY - 4} rx="15" ry="17" fill="url(#charSkin)" transform={`rotate(-10, 140, ${bodyY - 4})`} />
            <path d="M 126 290 Q 134 275 146 282" fill="none" />

            {/* Upper arm & Forearm */}
            <line x1="175" y1={bodyY} x2={205 + p * 12} y2={elbowY} stroke="url(#charSkin)" strokeWidth="14" strokeLinecap="round" />
            <line x1={205 + p * 12} y1={elbowY} x2="175" y2="295" stroke="url(#charSkinShadow)" strokeWidth="12" strokeLinecap="round" />
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 4. BICEPS CURL: Standing tall, curling dumbbells up to shoulders          */}
      {/* ========================================================================= */}
      {type === 'bicep_curl' && (() => {
        // Forearms curl from y=245 up to y=140
        const handY = 245 - p * 105;
        const handX = 295 - p * 20;

        return (
          <g transform="translate(10, 0)">
            {/* Sneaker Feet */}
            <g transform="translate(225, 308)">
              <rect x="0" y="6" width="34" height="6" rx="2" fill="url(#charSneaker)" />
              <path d="M 4 6 L 28 6 Q 32 3 28 0 L 8 0 Q 3 2 4 6 Z" fill="#38bdf8" />
            </g>
            <g transform="translate(265, 308)">
              <rect x="0" y="6" width="34" height="6" rx="2" fill="url(#charSneaker)" />
              <path d="M 4 6 L 28 6 Q 32 3 28 0 L 8 0 Q 3 2 4 6 Z" fill="#38bdf8" />
            </g>

            {/* Straight Legs */}
            <path d="M 235 308 L 242 220 L 258 220 L 252 308 Z" fill="url(#charSkin)" />
            <path d="M 272 308 L 278 220 L 294 220 L 290 308 Z" fill="url(#charSkin)" />

            {/* Shorts */}
            <rect x="235" y="180" width="60" height="44" rx="6" fill="url(#charShorts)" />
            <line x1="235" y1="184" x2="295" y2="184" stroke="#4edea3" strokeWidth="2" />

            {/* Torso Tank Top */}
            <path d="M 240 180 L 244 110 L 286 110 L 290 180 Z" fill="url(#charTankTop)" />
            <circle cx="265" cy="140" r="3" fill="#4edea3" />

            {/* Head & Neck */}
            <rect x="258" y="94" width="14" height="18" rx="2" fill="url(#charSkin)" />
            <ellipse cx="265" cy="80" rx="15" ry="18" fill="url(#charSkin)" />
            <path d="M 252 75 Q 262 60 278 68 L 276 74 Q 266 68 252 78 Z" fill="url(#charHair)" />

            {/* Left Arm (Relaxed at side) */}
            <line x1="244" y1="115" x2="238" y2="175" stroke="url(#charSkin)" strokeWidth="13" strokeLinecap="round" />
            <line x1="238" y1="175" x2="235" y2="240" stroke="url(#charSkinShadow)" strokeWidth="11" strokeLinecap="round" />
            <circle cx="235" cy="240" r="7" fill="url(#charSkin)" />

            {/* Right Arm: Upper arm pinned at side */}
            <line x1="286" y1="115" x2="292" y2="175" stroke="url(#charSkin)" strokeWidth="14" strokeLinecap="round" />
            {/* Forearm Curling Upward */}
            <line x1="292" y1="175" x2={handX} y2={handY} stroke="url(#charSkinShadow)" strokeWidth="12" strokeLinecap="round" />

            {/* Hex Dumbbell in Right Hand */}
            <g transform={`translate(${handX}, ${handY}) rotate(-12)`}>
              <circle cx="0" cy="0" r="8" fill="url(#charSkin)" />
              <rect x="-18" y="-3.5" width="36" height="7" rx="2" fill="url(#charChrome)" />
              <rect x="-24" y="-18" width="8" height="36" rx="2" fill="url(#charDumbbellIron)" />
              <rect x="16" y="-18" width="8" height="36" rx="2" fill="url(#charDumbbellIron)" />
            </g>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 5. SHOULDER PRESS / THRUSTER: Pressing dumbbells overhead                 */}
      {/* ========================================================================= */}
      {(type === 'shoulder_press' || type === 'military_press') && (() => {
        // Dumbbells travel from shoulders (y=135) to full overhead lockout (y=50)
        const dbY = 135 - p * 85;
        const elbowY = 155 - p * 65;

        return (
          <g transform="translate(0, 0)">
            {/* Sneakers */}
            <g transform="translate(225, 308)">
              <rect x="0" y="6" width="34" height="6" rx="2" fill="url(#charSneaker)" />
              <path d="M 4 6 L 28 6 Q 32 3 28 0 L 8 0 Q 3 2 4 6 Z" fill="#38bdf8" />
            </g>
            <g transform="translate(265, 308)">
              <rect x="0" y="6" width="34" height="6" rx="2" fill="url(#charSneaker)" />
              <path d="M 4 6 L 28 6 Q 32 3 28 0 L 8 0 Q 3 2 4 6 Z" fill="#38bdf8" />
            </g>

            {/* Legs */}
            <path d="M 235 308 L 242 210 L 258 210 L 252 308 Z" fill="url(#charSkin)" />
            <path d="M 272 308 L 278 210 L 294 210 L 290 308 Z" fill="url(#charSkin)" />

            {/* Shorts */}
            <rect x="235" y="175" width="60" height="42" rx="5" fill="url(#charShorts)" />

            {/* Torso */}
            <path d="M 240 175 L 244 115 L 286 115 L 290 175 Z" fill="url(#charTankTop)" />

            {/* Head */}
            <ellipse cx="265" cy="85" rx="15" ry="18" fill="url(#charSkin)" />
            <path d="M 252 80 Q 262 65 278 73 L 276 79 Q 266 73 252 83 Z" fill="url(#charHair)" />

            {/* Left Arm & Dumbbell */}
            <line x1="244" y1="118" x2="225" y2={elbowY} stroke="url(#charSkin)" strokeWidth="13" strokeLinecap="round" />
            <line x1="225" y1={elbowY} x2="220" y2={dbY} stroke="url(#charSkinShadow)" strokeWidth="11" strokeLinecap="round" />
            <g transform={`translate(220, ${dbY})`}>
              <circle cx="0" cy="0" r="7" fill="url(#charSkin)" />
              <rect x="-16" y="-3" width="32" height="6" rx="2" fill="url(#charChrome)" />
              <rect x="-22" y="-14" width="7" height="28" rx="2" fill="url(#charDumbbellIron)" />
              <rect x="15" y="-14" width="7" height="28" rx="2" fill="url(#charDumbbellIron)" />
            </g>

            {/* Right Arm & Dumbbell */}
            <line x1="286" y1="118" x2="305" y2={elbowY} stroke="url(#charSkin)" strokeWidth="13" strokeLinecap="round" />
            <line x1="305" y1={elbowY} x2="310" y2={dbY} stroke="url(#charSkinShadow)" strokeWidth="11" strokeLinecap="round" />
            <g transform={`translate(310, ${dbY})`}>
              <circle cx="0" cy="0" r="7" fill="url(#charSkin)" />
              <rect x="-16" y="-3" width="32" height="6" rx="2" fill="url(#charChrome)" />
              <rect x="-22" y="-14" width="7" height="28" rx="2" fill="url(#charDumbbellIron)" />
              <rect x="15" y="-14" width="7" height="28" rx="2" fill="url(#charDumbbellIron)" />
            </g>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 6. LATERAL RAISE: Raising dumbbells out to shoulder height               */}
      {/* ========================================================================= */}
      {type === 'lateral_raise' && (() => {
        const armAngle = 18 + p * 68; // 18° down to 86° horizontal
        const leftHandX = 265 - Math.sin((armAngle * Math.PI) / 180) * 85;
        const leftHandY = 120 + Math.cos((armAngle * Math.PI) / 180) * 85;
        const rightHandX = 275 + Math.sin((armAngle * Math.PI) / 180) * 85;
        const rightHandY = 120 + Math.cos((armAngle * Math.PI) / 180) * 85;

        return (
          <g transform="translate(0, 0)">
            {/* Feet */}
            <g transform="translate(230, 308)">
              <rect x="0" y="6" width="34" height="6" rx="2" fill="url(#charSneaker)" />
            </g>
            <g transform="translate(270, 308)">
              <rect x="0" y="6" width="34" height="6" rx="2" fill="url(#charSneaker)" />
            </g>

            {/* Legs */}
            <path d="M 238 308 L 245 210 L 260 210 L 255 308 Z" fill="url(#charSkin)" />
            <path d="M 275 308 L 280 210 L 295 210 L 290 308 Z" fill="url(#charSkin)" />

            <rect x="240" y="175" width="55" height="40" rx="5" fill="url(#charShorts)" />
            <path d="M 245 175 L 248 115 L 286 115 L 290 175 Z" fill="url(#charTankTop)" />
            <ellipse cx="268" cy="85" rx="15" ry="18" fill="url(#charSkin)" />
            <path d="M 255 80 Q 265 65 281 73 L 279 79 Q 269 73 255 83 Z" fill="url(#charHair)" />

            {/* Left Arm & Dumbbell */}
            <line x1="248" y1="118" x2={leftHandX} y2={leftHandY} stroke="url(#charSkin)" strokeWidth="12" strokeLinecap="round" />
            <g transform={`translate(${leftHandX}, ${leftHandY})`}>
              <circle cx="0" cy="0" r="6" fill="url(#charSkin)" />
              <rect x="-14" y="-3" width="28" height="6" rx="2" fill="url(#charChrome)" />
              <rect x="-18" y="-12" width="6" height="24" rx="2" fill="url(#charDumbbellIron)" />
              <rect x="12" y="-12" width="6" height="24" rx="2" fill="url(#charDumbbellIron)" />
            </g>

            {/* Right Arm & Dumbbell */}
            <line x1="286" y1="118" x2={rightHandX} y2={rightHandY} stroke="url(#charSkin)" strokeWidth="12" strokeLinecap="round" />
            <g transform={`translate(${rightHandX}, ${rightHandY})`}>
              <circle cx="0" cy="0" r="6" fill="url(#charSkin)" />
              <rect x="-14" y="-3" width="28" height="6" rx="2" fill="url(#charChrome)" />
              <rect x="-18" y="-12" width="6" height="24" rx="2" fill="url(#charDumbbellIron)" />
              <rect x="12" y="-12" width="6" height="24" rx="2" fill="url(#charDumbbellIron)" />
            </g>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 7. DEADLIFT: Hip hinge over barbell, standing to lockout                  */}
      {/* ========================================================================= */}
      {type === 'deadlift' && (() => {
        const hipX = 265 + p * 28;
        const barY = 175 + p * 88;
        const torsoTilt = p * 36;

        return (
          <g transform="translate(10, 0)">
            <g transform="translate(245, 308)">
              <rect x="0" y="4" width="38" height="8" rx="2" fill="url(#charSneaker)" />
            </g>
            <line x1="255" y1="308" x2="265" y2="235" stroke="url(#charSkin)" strokeWidth="16" strokeLinecap="round" />
            <line x1="265" y1="235" x2={hipX} y2="165" stroke="url(#charSkin)" strokeWidth="18" strokeLinecap="round" />
            <circle cx={hipX} cy="165" r="18" fill="url(#charShorts)" />

            <g transform={`rotate(${torsoTilt}, ${hipX}, 165)`}>
              <path d={`M ${hipX} 165 L ${hipX - 65} 130`} stroke="url(#charTankTop)" strokeWidth="24" strokeLinecap="round" />
              <circle cx={hipX - 85} cy="120" r="16" fill="url(#charSkin)" />

              <line x1={hipX - 48} y1="140" x2="245" y2={barY} stroke="url(#charSkinShadow)" strokeWidth="12" strokeLinecap="round" />
              <circle cx="245" cy={barY} r="7" fill="url(#charSkin)" />

              <rect x="130" y={barY - 4} width="240" height="8" rx="4" fill="url(#charChrome)" />
              <rect x="150" y={barY - 32} width="12" height="64" rx="3" fill="url(#charBumperRed)" />
              <rect x="330" y={barY - 32} width="12" height="64" rx="3" fill="url(#charBumperRed)" />
            </g>
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 8. LUNGE: Stepping forward into a 90/90 knee bend                         */}
      {/* ========================================================================= */}
      {type === 'lunge' && (() => {
        const dropY = p * 45;
        const frontKneeX = 225;
        const frontKneeY = 240 + dropY * 0.4;
        const backKneeX = 325;
        const backKneeY = 245 + dropY * 1.1;

        return (
          <g transform="translate(0, 5)">
            {/* Feet */}
            <g transform="translate(205, 308)">
              <rect x="0" y="4" width="36" height="8" rx="2" fill="url(#charSneaker)" />
            </g>
            <g transform="translate(345, 304)">
              <rect x="0" y="4" width="26" height="8" rx="2" fill="url(#charSneaker)" transform="rotate(-25)" />
            </g>

            {/* Front & Back Legs */}
            <line x1="225" y1="308" x2={frontKneeX} y2={frontKneeY} stroke="url(#charSkin)" strokeWidth="15" strokeLinecap="round" />
            <line x1={frontKneeX} y1={frontKneeY} x2="275" y2={180 + dropY} stroke="url(#charSkin)" strokeWidth="17" strokeLinecap="round" />
            <line x1="355" y1="304" x2={backKneeX} y2={backKneeY} stroke="url(#charSkin)" strokeWidth="15" strokeLinecap="round" />
            <line x1={backKneeX} y1={backKneeY} x2="275" y2={180 + dropY} stroke="url(#charSkin)" strokeWidth="17" strokeLinecap="round" />

            <rect x="255" y={170 + dropY} width="40" height="34" rx="5" fill="url(#charShorts)" />
            <path d={`M 260 ${170 + dropY} L 265 ${105 + dropY} L 285 ${105 + dropY} L 290 ${170 + dropY} Z`} fill="url(#charTankTop)" />
            <ellipse cx="275" cy={80 + dropY} rx="15" ry="18" fill="url(#charSkin)" />

            {/* Dumbbells held at sides */}
            <line x1="265" y1={115 + dropY} x2="265" y2={180 + dropY} stroke="url(#charSkin)" strokeWidth="11" strokeLinecap="round" />
            <rect x="255" y={175 + dropY} width="20" height="12" rx="3" fill="url(#charDumbbellIron)" />
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 9. PLANK / LEG RAISE: Core abdominal stability                           */}
      {/* ========================================================================= */}
      {(type === 'plank' || type === 'leg_raise') && (() => {
        const isPlank = type === 'plank';
        const legAngle = isPlank ? 0 : p * 75;

        return (
          <g transform="translate(10, 10)">
            {isPlank ? (
              <g>
                <rect x="410" y="280" width="24" height="8" rx="2" fill="url(#charSneaker)" />
                <rect x="175" y="284" width="28" height="6" rx="2" fill="url(#charSkin)" />

                <line x1="415" y1="282" x2="330" y2="245" stroke="url(#charSkin)" strokeWidth="17" strokeLinecap="round" />
                <line x1="335" y1="245" x2="260" y2="235" stroke="url(#charShorts)" strokeWidth="22" strokeLinecap="round" />
                <line x1="265" y1="235" x2="195" y2="230" stroke="url(#charTankTop)" strokeWidth="25" strokeLinecap="round" />

                <circle cx="165" cy="225" r="15" fill="url(#charSkin)" />
                <line x1="195" y1="230" x2="190" y2="284" stroke="url(#charSkinShadow)" strokeWidth="14" strokeLinecap="round" />
              </g>
            ) : (
              <g>
                <line x1="170" y1="280" x2="290" y2="280" stroke="url(#charTankTop)" strokeWidth="24" strokeLinecap="round" />
                <circle cx="150" cy="275" r="15" fill="url(#charSkin)" />
                <rect x="270" y="268" width="35" height="24" rx="4" fill="url(#charShorts)" />

                <g transform={`rotate(-${legAngle}, 300, 280)`}>
                  <line x1="300" y1="280" x2="420" y2="280" stroke="url(#charSkin)" strokeWidth="16" strokeLinecap="round" />
                  <rect x="415" y="272" width="22" height="10" rx="3" fill="url(#charSneaker)" />
                </g>
              </g>
            )}
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 10. PULL-UP / LAT PULLDOWN: Pulling down to chest                        */}
      {/* ========================================================================= */}
      {(type === 'pullup' || type === 'lat_pulldown') && (() => {
        const isPullup = type === 'pullup';
        const pullY = isPullup ? -p * 50 : 0;
        const barY = isPullup ? 65 : 65 + p * 55;

        return (
          <g transform="translate(0, 10)">
            <line x1="160" y1="65" x2="380" y2="65" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

            <g transform={`translate(0, ${pullY})`}>
              <ellipse cx="270" cy="110" rx="15" ry="18" fill="url(#charSkin)" />
              <path d="M 245 130 L 255 190 L 285 190 L 295 130 Z" fill="url(#charTankTop)" />
              <rect x="250" y="190" width="40" height="34" rx="4" fill="url(#charShorts)" />
              <path d="M 255 224 L 260 295 L 280 295 L 285 224 Z" fill="url(#charSkin)" />
            </g>

            <line x1="245" y1={130 + pullY} x2="225" y2={barY} stroke="url(#charSkin)" strokeWidth="14" strokeLinecap="round" />
            <circle cx="225" cy={barY} r="7" fill="url(#charSkin)" />
            <line x1="295" y1={130 + pullY} x2="315" y2={barY} stroke="url(#charSkin)" strokeWidth="14" strokeLinecap="round" />
            <circle cx="315" cy={barY} r="7" fill="url(#charSkin)" />
          </g>
        );
      })()}

      {/* ========================================================================= */}
      {/* 11. BENT-OVER ROW / DIPS / TRICEPS / CARDIO / RECOVERY                   */}
      {/* ========================================================================= */}
      {(type === 'row' || type === 'tricep' || type === 'chest_fly' || type === 'dips' || type === 'calf_raise' || type === 'leg_press' || type === 'cardio' || type === 'recovery') && (() => {
        const motionY = p * 45;

        return (
          <g transform="translate(10, 10)">
            <g transform="translate(245, 308)">
              <rect x="0" y="4" width="34" height="8" rx="2" fill="url(#charSneaker)" />
            </g>
            <line x1="255" y1="308" x2="265" y2="220" stroke="url(#charSkin)" strokeWidth="16" strokeLinecap="round" />
            <rect x="245" y="175" width="45" height="42" rx="5" fill="url(#charShorts)" />
            <path d="M 248 175 L 255 110 L 285 110 L 290 175 Z" fill="url(#charTankTop)" />
            <ellipse cx="270" cy="85" rx="15" ry="18" fill="url(#charSkin)" />

            <line x1="255" y1="115" x2="230" y2={165 + (type === 'row' ? -motionY : motionY)} stroke="url(#charSkin)" strokeWidth="14" strokeLinecap="round" />
            <line x1="230" y1={165 + (type === 'row' ? -motionY : motionY)} x2="265" y2={210 + (type === 'row' ? -motionY : motionY)} stroke="url(#charSkinShadow)" strokeWidth="12" strokeLinecap="round" />
            <circle cx="265" cy={210 + (type === 'row' ? -motionY : motionY)} r="7" fill="url(#charSkin)" />
          </g>
        );
      })()}
    </svg>
  );
};
