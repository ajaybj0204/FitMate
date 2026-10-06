import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { ExerciseAnimationType } from '../types';
import { CameraViewAngle } from '../types/exerciseAnimation';

export interface ExerciseAnimationModelProps {
  type: ExerciseAnimationType;
  motionProgress: number; // 0.0 to 1.0 cycle
  cameraAngle: CameraViewAngle; // 'front' | 'side' | '3d'
  isPeak: boolean;
  onCameraChange?: (angle: CameraViewAngle) => void;
  className?: string;
}

/**
 * ExerciseAnimationModel
 * 3D Human Fitness Model built with Three.js WebGL.
 * Replaces the abstract mannequin style with a realistic athletic human model,
 * multi-angle camera support (front, side, 3/4 perspective), realistic joint articulation,
 * dynamic exercise equipment (barbells, dumbbells, benches), and glowing active muscle groups.
 */
export const ExerciseAnimationModel: React.FC<ExerciseAnimationModelProps> = ({
  type,
  motionProgress,
  cameraAngle,
  isPeak,
  onCameraChange,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // References to dynamic 3D meshes for kinematic animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Body mesh part references
  const humanGroupRef = useRef<THREE.Group | null>(null);
  const pelvisRef = useRef<THREE.Group | null>(null);
  const torsoRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const leftUpperArmRef = useRef<THREE.Group | null>(null);
  const rightUpperArmRef = useRef<THREE.Group | null>(null);
  const leftForearmRef = useRef<THREE.Group | null>(null);
  const rightForearmRef = useRef<THREE.Group | null>(null);
  const leftThighRef = useRef<THREE.Group | null>(null);
  const rightThighRef = useRef<THREE.Group | null>(null);
  const leftShinRef = useRef<THREE.Group | null>(null);
  const rightShinRef = useRef<THREE.Group | null>(null);

  // Equipment mesh references
  const barbellRef = useRef<THREE.Group | null>(null);
  const leftDumbbellRef = useRef<THREE.Group | null>(null);
  const rightDumbbellRef = useRef<THREE.Group | null>(null);
  const benchRef = useRef<THREE.Group | null>(null);

  // Muscle highlight materials
  const muscleMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Camera animation target
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(2.2, 1.4, 2.2));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.05, 0));

  // User interactive drag rotation state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const orbitAngleRef = useRef({ theta: 0.78, phi: 1.15, radius: 3.1 });

  // Update target camera position based on selected cameraAngle ('front' | 'side' | '3d')
  useEffect(() => {
    if (cameraAngle === 'front') {
      orbitAngleRef.current.theta = 0;
      orbitAngleRef.current.phi = Math.PI / 2 - 0.05;
      targetCamPosRef.current.set(0, 1.25, 3.2);
    } else if (cameraAngle === 'side') {
      orbitAngleRef.current.theta = Math.PI / 2;
      orbitAngleRef.current.phi = Math.PI / 2 - 0.05;
      targetCamPosRef.current.set(3.2, 1.25, 0);
    } else {
      // 3/4 perspective view
      orbitAngleRef.current.theta = Math.PI / 4;
      orbitAngleRef.current.phi = 1.1;
      targetCamPosRef.current.set(2.3, 1.45, 2.3);
    }
  }, [cameraAngle]);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 340;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a121d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.copy(targetCamPosRef.current);
    camera.lookAt(targetLookAtRef.current);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xd8e3fb, 0.7);
    scene.add(ambientLight);

    // Main Overhead Spotlight
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 15;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    // Subtle Teal Rim Light from behind
    const rimLight = new THREE.DirectionalLight(0x4edea3, 0.9);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // Soft Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(0, -2, 3);
    scene.add(fillLight);

    // 5. Gym Studio Floor Platform
    const floorGeo = new THREE.CylinderGeometry(2.4, 2.5, 0.08, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111c2d,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.04;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ring accent on floor
    const ringGeo = new THREE.RingGeometry(2.2, 2.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x1f2a3c, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);

    // 6. BUILD REALISTIC 3D ATHLETE BODY
    const humanGroup = new THREE.Group();
    humanGroupRef.current = humanGroup;
    scene.add(humanGroup);

    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xdf9f72,
      roughness: 0.55,
      metalness: 0.05,
    });

    const activeMuscleMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4757,
      roughness: 0.4,
      metalness: 0.1,
      emissive: new THREE.Color(0xff2244),
      emissiveIntensity: 0.4,
    });
    muscleMaterialsRef.current = [activeMuscleMaterial];

    const apparelMaterial = new THREE.MeshStandardMaterial({
      color: 0x162235,
      roughness: 0.7,
      metalness: 0.1,
    });

    const sneakerUpperMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.5,
    });

    const sneakerSoleMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.6,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.15,
    });

    const redPlateMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.4,
    });

    const dumbbellIronMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.3,
    });

    // --- PELVIS (Center of Body Hierarchy) ---
    const pelvis = new THREE.Group();
    pelvis.position.set(0, 0.95, 0);
    pelvisRef.current = pelvis;
    humanGroup.add(pelvis);

    // Shorts / Hips Mesh
    const shortsGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.22, 24);
    const shortsMesh = new THREE.Mesh(shortsGeo, apparelMaterial);
    shortsMesh.castShadow = true;
    pelvis.add(shortsMesh);

    // --- TORSO ---
    const torso = new THREE.Group();
    torso.position.set(0, 0.11, 0);
    torsoRef.current = torso;
    pelvis.add(torso);

    // Abdominal and Chest Mesh (V-Taper)
    const torsoGeo = new THREE.CylinderGeometry(0.21, 0.16, 0.38, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, apparelMaterial);
    torsoMesh.position.y = 0.19;
    torsoMesh.castShadow = true;
    torso.add(torsoMesh);

    // Pectoral Muscle Contours (Front of chest)
    const pecGeo = new THREE.BoxGeometry(0.16, 0.12, 0.08);
    const leftPec = new THREE.Mesh(pecGeo, activeMuscleMaterial);
    leftPec.position.set(-0.09, 0.28, 0.12);
    leftPec.castShadow = true;
    torso.add(leftPec);

    const rightPec = new THREE.Mesh(pecGeo, activeMuscleMaterial);
    rightPec.position.set(0.09, 0.28, 0.12);
    rightPec.castShadow = true;
    torso.add(rightPec);

    // --- HEAD & NECK ---
    const head = new THREE.Group();
    head.position.set(0, 0.42, 0);
    headRef.current = head;
    torso.add(head);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.1, 16);
    const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
    neckMesh.position.y = 0.04;
    neckMesh.castShadow = true;
    head.add(neckMesh);

    // Head (Cranium with facial shape)
    const headGeo = new THREE.SphereGeometry(0.11, 24, 24);
    headGeo.scale(1, 1.15, 1.05);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.position.y = 0.17;
    headMesh.castShadow = true;
    head.add(headMesh);

    // Hair cap
    const hairGeo = new THREE.SphereGeometry(0.115, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1f1712, roughness: 0.9 });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.19, -0.01);
    head.add(hairMesh);

    // Nose & Chin profile
    const noseGeo = new THREE.ConeGeometry(0.02, 0.04, 8);
    const noseMesh = new THREE.Mesh(noseGeo, skinMaterial);
    noseMesh.rotation.x = Math.PI / 2;
    noseMesh.position.set(0, 0.17, 0.12);
    head.add(noseMesh);

    // --- ARMS (LEFT & RIGHT) ---
    // Shoulder Deltoid Caps
    const deltGeo = new THREE.SphereGeometry(0.08, 16, 16);

    // Left Upper Arm
    const leftUpperArm = new THREE.Group();
    leftUpperArm.position.set(-0.25, 0.32, 0);
    leftUpperArmRef.current = leftUpperArm;
    torso.add(leftUpperArm);

    const leftDelt = new THREE.Mesh(deltGeo, skinMaterial);
    leftDelt.castShadow = true;
    leftUpperArm.add(leftDelt);

    const bicepGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.24, 16);
    const leftBicep = new THREE.Mesh(bicepGeo, activeMuscleMaterial);
    leftBicep.position.y = -0.14;
    leftBicep.castShadow = true;
    leftUpperArm.add(leftBicep);

    // Left Forearm
    const leftForearm = new THREE.Group();
    leftForearm.position.set(0, -0.26, 0);
    leftForearmRef.current = leftForearm;
    leftUpperArm.add(leftForearm);

    const forearmGeo = new THREE.CylinderGeometry(0.048, 0.038, 0.24, 16);
    const leftForearmMesh = new THREE.Mesh(forearmGeo, skinMaterial);
    leftForearmMesh.position.y = -0.12;
    leftForearmMesh.castShadow = true;
    leftForearm.add(leftForearmMesh);

    // Left Hand
    const handGeo = new THREE.SphereGeometry(0.045, 12, 12);
    handGeo.scale(0.8, 1.2, 0.6);
    const leftHandMesh = new THREE.Mesh(handGeo, skinMaterial);
    leftHandMesh.position.y = -0.26;
    leftForearm.add(leftHandMesh);

    // Right Upper Arm
    const rightUpperArm = new THREE.Group();
    rightUpperArm.position.set(0.25, 0.32, 0);
    rightUpperArmRef.current = rightUpperArm;
    torso.add(rightUpperArm);

    const rightDelt = new THREE.Mesh(deltGeo, skinMaterial);
    rightDelt.castShadow = true;
    rightUpperArm.add(rightDelt);

    const rightBicep = new THREE.Mesh(bicepGeo, activeMuscleMaterial);
    rightBicep.position.y = -0.14;
    rightBicep.castShadow = true;
    rightUpperArm.add(rightBicep);

    // Right Forearm
    const rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.26, 0);
    rightForearmRef.current = rightForearm;
    rightUpperArm.add(rightForearm);

    const rightForearmMesh = new THREE.Mesh(forearmGeo, skinMaterial);
    rightForearmMesh.position.y = -0.12;
    rightForearmMesh.castShadow = true;
    rightForearm.add(rightForearmMesh);

    // Right Hand
    const rightHandMesh = new THREE.Mesh(handGeo, skinMaterial);
    rightHandMesh.position.y = -0.26;
    rightForearm.add(rightHandMesh);

    // --- LEGS (LEFT & RIGHT) ---
    const thighGeo = new THREE.CylinderGeometry(0.09, 0.068, 0.44, 20);
    const shinGeo = new THREE.CylinderGeometry(0.065, 0.048, 0.44, 20);

    // Left Thigh
    const leftThigh = new THREE.Group();
    leftThigh.position.set(-0.11, -0.08, 0);
    leftThighRef.current = leftThigh;
    pelvis.add(leftThigh);

    const leftThighMesh = new THREE.Mesh(thighGeo, activeMuscleMaterial);
    leftThighMesh.position.y = -0.22;
    leftThighMesh.castShadow = true;
    leftThigh.add(leftThighMesh);

    // Left Shin & Knee
    const leftShin = new THREE.Group();
    leftShin.position.set(0, -0.44, 0);
    leftShinRef.current = leftShin;
    leftThigh.add(leftShin);

    const leftShinMesh = new THREE.Mesh(shinGeo, skinMaterial);
    leftShinMesh.position.y = -0.22;
    leftShinMesh.castShadow = true;
    leftShin.add(leftShinMesh);

    // Left Sneaker
    const leftShoe = new THREE.Group();
    leftShoe.position.set(0, -0.44, 0.04);
    const shoeUpperMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.2), sneakerUpperMat);
    shoeUpperMesh.position.y = 0.04;
    shoeUpperMesh.castShadow = true;
    leftShoe.add(shoeUpperMesh);
    const shoeSoleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.22), sneakerSoleMat);
    shoeSoleMesh.position.y = 0.01;
    leftShoe.add(shoeSoleMesh);
    leftShin.add(leftShoe);

    // Right Thigh
    const rightThigh = new THREE.Group();
    rightThigh.position.set(0.11, -0.08, 0);
    rightThighRef.current = rightThigh;
    pelvis.add(rightThigh);

    const rightThighMesh = new THREE.Mesh(thighGeo, activeMuscleMaterial);
    rightThighMesh.position.y = -0.22;
    rightThighMesh.castShadow = true;
    rightThigh.add(rightThighMesh);

    // Right Shin & Knee
    const rightShin = new THREE.Group();
    rightShin.position.set(0, -0.44, 0);
    rightShinRef.current = rightShin;
    rightThigh.add(rightShin);

    const rightShinMesh = new THREE.Mesh(shinGeo, skinMaterial);
    rightShinMesh.position.y = -0.22;
    rightShinMesh.castShadow = true;
    rightShin.add(rightShinMesh);

    // Right Sneaker
    const rightShoe = new THREE.Group();
    rightShoe.position.set(0, -0.44, 0.04);
    const rightShoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.2), sneakerUpperMat);
    rightShoeUpper.position.y = 0.04;
    rightShoeUpper.castShadow = true;
    rightShoe.add(rightShoeUpper);
    const rightShoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.22), sneakerSoleMat);
    rightShoeSole.position.y = 0.01;
    rightShoe.add(rightShoeSole);
    rightShin.add(rightShoe);

    // --- EQUIPMENT: BARBELL ---
    const barbell = new THREE.Group();
    barbellRef.current = barbell;
    scene.add(barbell);

    const barShaftGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.8, 16);
    const barShaft = new THREE.Mesh(barShaftGeo, chromeMat);
    barShaft.rotation.z = Math.PI / 2;
    barbell.add(barShaft);

    // Left Olympic Bumper Plates
    const plateGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.04, 32);
    const leftPlate1 = new THREE.Mesh(plateGeo, redPlateMat);
    leftPlate1.rotation.z = Math.PI / 2;
    leftPlate1.position.x = -0.75;
    leftPlate1.castShadow = true;
    barbell.add(leftPlate1);

    const rightPlate1 = new THREE.Mesh(plateGeo, redPlateMat);
    rightPlate1.rotation.z = Math.PI / 2;
    rightPlate1.position.x = 0.75;
    rightPlate1.castShadow = true;
    barbell.add(rightPlate1);

    // --- EQUIPMENT: PAIR OF DUMBBELLS ---
    const buildDumbbell = () => {
      const db = new THREE.Group();
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 12), chromeMat);
      handle.rotation.z = Math.PI / 2;
      db.add(handle);
      const headGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.06, 12);
      const h1 = new THREE.Mesh(headGeo, dumbbellIronMat);
      h1.rotation.z = Math.PI / 2;
      h1.position.x = -0.1;
      h1.castShadow = true;
      db.add(h1);
      const h2 = new THREE.Mesh(headGeo, dumbbellIronMat);
      h2.rotation.z = Math.PI / 2;
      h2.position.x = 0.1;
      h2.castShadow = true;
      db.add(h2);
      return db;
    };

    const leftDumbbell = buildDumbbell();
    leftDumbbellRef.current = leftDumbbell;
    scene.add(leftDumbbell);

    const rightDumbbell = buildDumbbell();
    rightDumbbellRef.current = rightDumbbell;
    scene.add(rightDumbbell);

    // --- EQUIPMENT: GYM BENCH ---
    const benchGroup = new THREE.Group();
    benchRef.current = benchGroup;
    scene.add(benchGroup);

    const padMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 1.2), apparelMaterial);
    padMesh.position.y = 0.44;
    padMesh.castShadow = true;
    benchGroup.add(padMesh);
    const legMesh1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.06), dumbbellIronMat);
    legMesh1.position.set(0, 0.22, 0.45);
    benchGroup.add(legMesh1);
    const legMesh2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.06), dumbbellIronMat);
    legMesh2.position.set(0, 0.22, -0.45);
    benchGroup.add(legMesh2);

    // Initial visibility flags
    benchGroup.visible = false;
    barbell.visible = true;
    leftDumbbell.visible = false;
    rightDumbbell.visible = false;

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. RENDER LOOP
    const renderLoop = () => {
      // Smooth camera interpolation toward target
      if (camera) {
        camera.position.lerp(targetCamPosRef.current, 0.08);
        camera.lookAt(targetLookAtRef.current);
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update 3D Kinematics and Exercise Movements based on motionProgress & exercise type
  useEffect(() => {
    const p = Math.sin(motionProgress * Math.PI); // 0.0 to 1.0 (contraction curve)

    const human = humanGroupRef.current;
    const pelvis = pelvisRef.current;
    const torso = torsoRef.current;
    const head = headRef.current;
    const lUpperArm = leftUpperArmRef.current;
    const rUpperArm = rightUpperArmRef.current;
    const lForearm = leftForearmRef.current;
    const rForearm = rightForearmRef.current;
    const lThigh = leftThighRef.current;
    const rThigh = rightThighRef.current;
    const lShin = leftShinRef.current;
    const rShin = rightShinRef.current;

    const barbell = barbellRef.current;
    const lDb = leftDumbbellRef.current;
    const rDb = rightDumbbellRef.current;
    const bench = benchRef.current;

    if (!human || !pelvis || !torso || !lUpperArm || !rUpperArm || !lThigh || !rThigh) return;

    // Default resets
    human.position.set(0, 0, 0);
    human.rotation.set(0, 0, 0);
    pelvis.position.set(0, 0.95, 0);
    pelvis.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0);
    if (head) head.rotation.set(0, 0, 0);

    lUpperArm.rotation.set(0, 0, 0.15);
    rUpperArm.rotation.set(0, 0, -0.15);
    if (lForearm) lForearm.rotation.set(0, 0, 0);
    if (rForearm) rForearm.rotation.set(0, 0, 0);

    lThigh.rotation.set(0, 0, -0.05);
    rThigh.rotation.set(0, 0, 0.05);
    if (lShin) lShin.rotation.set(0, 0, 0);
    if (rShin) rShin.rotation.set(0, 0, 0);

    if (barbell) barbell.visible = false;
    if (lDb) lDb.visible = false;
    if (rDb) rDb.visible = false;
    if (bench) bench.visible = false;

    // --- 1. SQUAT KINEMATICS ---
    if (type === 'squat') {
      if (barbell) barbell.visible = true;

      // Hips drop from 0.95 down to 0.48 (full parallel squat depth)
      const hipDrop = p * 0.46;
      pelvis.position.set(0, 0.95 - hipDrop, -p * 0.18); // Hips hinge backward
      torso.rotation.x = p * 0.42; // Torso hinges forward slightly to maintain center of gravity

      // Hip flexion and knee flexion
      lThigh.rotation.x = -p * 1.55;
      rThigh.rotation.x = -p * 1.55;

      if (lShin) lShin.rotation.x = p * 1.6;
      if (rShin) rShin.rotation.x = p * 1.6;

      // Arms hold barbell across upper traps
      lUpperArm.rotation.set(-0.3, 0.2, 0.5);
      rUpperArm.rotation.set(-0.3, -0.2, -0.5);
      if (lForearm) lForearm.rotation.set(-1.4, 0, 0);
      if (rForearm) rForearm.rotation.set(-1.4, 0, 0);

      if (barbell) {
        barbell.position.set(0, 1.48 - hipDrop, -p * 0.18 + Math.sin(torso.rotation.x) * 0.2);
      }
    }

    // --- 2. BICEPS CURL KINEMATICS ---
    else if (type === 'bicep_curl') {
      if (lDb) lDb.visible = true;
      if (rDb) rDb.visible = true;

      pelvis.position.set(0, 0.95, 0);
      torso.rotation.set(0, 0, 0);

      // Upper arms pinned stationary at ribcage
      lUpperArm.rotation.set(0.08, 0, 0.05);
      rUpperArm.rotation.set(0.08, 0, -0.05);

      // Forearms curl up from straight (-0.1 rad) to peak curl (-2.3 rad)
      const curlAngle = -0.15 - p * 2.15;
      if (lForearm) lForearm.rotation.x = curlAngle;
      if (rForearm) rForearm.rotation.x = curlAngle;

      // Dumbbells track hands
      const dbHandY = 0.92 + Math.cos(curlAngle) * 0.35;
      const dbHandZ = -Math.sin(curlAngle) * 0.35;
      if (lDb) lDb.position.set(-0.25, dbHandY, dbHandZ);
      if (rDb) rDb.position.set(0.25, dbHandY, dbHandZ);
    }

    // --- 3. PUSH-UP KINEMATICS ---
    else if (type === 'pushup') {
      // Horizontal prone plank position
      human.position.set(0, 0.28, 0);
      human.rotation.set(-Math.PI / 2, 0, 0); // horizontal

      const pushY = p * 0.24; // chest lowering toward floor
      pelvis.position.set(0, 0.95, -pushY);

      // Elbows flare back at 45°
      lUpperArm.rotation.set(p * 1.1, 0, 0.6);
      rUpperArm.rotation.set(p * 1.1, 0, -0.6);
      if (lForearm) lForearm.rotation.set(p * 0.8, 0, 0);
      if (rForearm) rForearm.rotation.set(p * 0.8, 0, 0);
    }

    // --- 4. BENCH PRESS KINEMATICS ---
    else if (type === 'bench_press') {
      if (bench) bench.visible = true;
      if (barbell) barbell.visible = true;

      // Supine on bench
      human.position.set(0, 0.52, 0);
      human.rotation.set(Math.PI / 2, 0, 0); // on back

      const barLower = (1 - p) * 0.32; // bar lowers to chest (p=1 is full touch/contract, p=0 is lockout)
      lUpperArm.rotation.set(p * 1.1, 0, 0.8);
      rUpperArm.rotation.set(p * 1.1, 0, -0.8);
      if (lForearm) lForearm.rotation.set(p * 0.9, 0, 0);
      if (rForearm) rForearm.rotation.set(p * 0.9, 0, 0);

      if (barbell) {
        barbell.position.set(0, 0.72 + (1 - p) * 0.32, 0.15);
      }
    }

    // --- 5. LATERAL RAISE KINEMATICS ---
    else if (type === 'lateral_raise') {
      if (lDb) lDb.visible = true;
      if (rDb) rDb.visible = true;

      // Arms raise sideways from thighs to shoulder level
      const raiseAngle = 0.15 + p * 1.35; // ~85 degrees horizontal
      lUpperArm.rotation.set(0, 0, raiseAngle);
      rUpperArm.rotation.set(0, 0, -raiseAngle);
      if (lForearm) lForearm.rotation.set(0, 0, 0.1);
      if (rForearm) rForearm.rotation.set(0, 0, -0.1);

      if (lDb) lDb.position.set(-0.25 - Math.sin(raiseAngle) * 0.5, 1.25 - Math.cos(raiseAngle) * 0.5, 0);
      if (rDb) rDb.position.set(0.25 + Math.sin(raiseAngle) * 0.5, 1.25 - Math.cos(raiseAngle) * 0.5, 0);
    }

    // --- 6. OVERHEAD SHOULDER PRESS KINEMATICS ---
    else if (type === 'shoulder_press' || type === 'military_press') {
      if (lDb) lDb.visible = true;
      if (rDb) rDb.visible = true;

      // Pressing overhead
      const pressProgress = p;
      lUpperArm.rotation.set(0, 0, 0.8 + pressProgress * 0.75);
      rUpperArm.rotation.set(0, 0, -0.8 - pressProgress * 0.75);
      if (lForearm) lForearm.rotation.set(0, 0, -0.7 + pressProgress * 0.65);
      if (rForearm) rForearm.rotation.set(0, 0, 0.7 - pressProgress * 0.65);

      if (lDb) lDb.position.set(-0.35 + pressProgress * 0.08, 1.45 + pressProgress * 0.45, 0.05);
      if (rDb) rDb.position.set(0.35 - pressProgress * 0.08, 1.45 + pressProgress * 0.45, 0.05);
    }

    // --- 7. DEADLIFT KINEMATICS ---
    else if (type === 'deadlift') {
      if (barbell) barbell.visible = true;

      const hinge = p * 0.75;
      pelvis.position.set(0, 0.95 - p * 0.15, p * 0.22); // hips push back
      torso.rotation.x = hinge; // hip hinge

      lThigh.rotation.x = -p * 0.6;
      rThigh.rotation.x = -p * 0.6;
      if (lShin) lShin.rotation.x = p * 0.35;
      if (rShin) rShin.rotation.x = p * 0.35;

      lUpperArm.rotation.set(hinge * 0.6, 0, 0.1);
      rUpperArm.rotation.set(hinge * 0.6, 0, -0.1);

      if (barbell) {
        barbell.position.set(0, 0.75 - p * 0.45, 0.25);
      }
    }

    // --- 8. LUNGE KINEMATICS ---
    else if (type === 'lunge') {
      const drop = p * 0.35;
      pelvis.position.set(0, 0.95 - drop, 0);

      // Left leg steps forward 90/90
      lThigh.rotation.x = -p * 1.5;
      if (lShin) lShin.rotation.x = p * 1.5;

      // Right leg extends back, knee drops
      rThigh.rotation.x = p * 0.8;
      if (rShin) rShin.rotation.x = p * 1.4;
    }

    // --- 9. DEFAULT / ROW / PULL-UP / UNIVERSAL ---
    else {
      if (lDb) lDb.visible = true;
      if (rDb) rDb.visible = true;

      // Bent-over row posture
      pelvis.position.set(0, 0.92, 0.1);
      torso.rotation.x = 0.6;
      const rowPull = p * 0.4;
      lUpperArm.rotation.set(0.4 - rowPull, 0, 0.2);
      rUpperArm.rotation.set(0.4 - rowPull, 0, -0.2);
      if (lForearm) lForearm.rotation.set(-rowPull * 1.2, 0, 0);
      if (rForearm) rForearm.rotation.set(-rowPull * 1.2, 0, 0);

      if (lDb) lDb.position.set(-0.25, 0.85 + rowPull * 0.3, -0.1 + rowPull * 0.2);
      if (rDb) rDb.position.set(0.25, 0.85 + rowPull * 0.3, -0.1 + rowPull * 0.2);
    }

    // Dynamic Muscle Glowing Intensity
    muscleMaterialsRef.current.forEach(mat => {
      mat.emissiveIntensity = isPeak ? 0.9 : 0.25 + p * 0.45;
    });
  }, [type, motionProgress, isPeak]);

  // Mouse & Touch interactive drag rotation (orbiting around 3D human)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    orbitAngleRef.current.theta -= deltaX * 0.01;
    orbitAngleRef.current.phi = Math.max(0.3, Math.min(Math.PI / 2 + 0.1, orbitAngleRef.current.phi - deltaY * 0.01));

    const { theta, phi, radius } = orbitAngleRef.current;
    targetCamPosRef.current.x = radius * Math.sin(phi) * Math.sin(theta);
    targetCamPosRef.current.y = radius * Math.cos(phi) + 0.6;
    targetCamPosRef.current.z = radius * Math.sin(phi) * Math.cos(theta);

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      className={`relative w-full h-72 sm:h-84 md:h-92 overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Three.js WebGL Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Camera Angle Selector Quick Bar (Overlay at top-right of 3D canvas) */}
      <div className="absolute bottom-3 right-3 bg-[#08121f]/85 backdrop-blur-md p-1 rounded-xl border border-[#1f2a3c] flex items-center gap-1 shadow-lg z-10">
        <span className="text-[9px] text-[#86948a] font-bold uppercase px-1.5 hidden sm:inline">
          View:
        </span>
        {(['front', 'side', '3d'] as CameraViewAngle[]).map(angle => (
          <button
            key={angle}
            type="button"
            onClick={e => {
              e.stopPropagation();
              if (onCameraChange) onCameraChange(angle);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
              cameraAngle === angle
                ? 'bg-[#152336] text-[#4edea3] border border-[#4edea3]/40 shadow-sm'
                : 'text-[#86948a] hover:text-[#d8e3fb]'
            }`}
            title={`Switch to ${angle === '3d' ? '3/4 Perspective' : angle} view`}
          >
            {angle === '3d' ? '3/4' : angle}
          </button>
        ))}
      </div>

      {/* 3D Orbit Drag Hint badge */}
      <div className="absolute bottom-3 left-3 bg-[#08121f]/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#1f2a3c] flex items-center gap-1.5 pointer-events-none text-[10px] text-[#86948a]">
        <span className="material-symbols-outlined text-[13px] text-[#4edea3]">3d_rotation</span>
        <span>Drag to rotate 3D view</span>
      </div>
    </div>
  );
};
