import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface AssetEcosystem3DProps {
  className?: string;
  interactive?: boolean;
}

export const AssetEcosystem3D: React.FC<AssetEcosystem3DProps> = ({
  className = '',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    // 1. WebGL Support Detection
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // 2. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 9.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Premium Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.2);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainKeyLight.position.set(5, 8, 6);
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.4); // soft lavender fill
    fillLight.position.set(-6, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x818cf8, 2.5, 20); // indigo rim glow
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 4. Materials Palette (Human-designed Matte & Brushed Finishes)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean Matte White
      roughness: 0.25,
      metalness: 0.1,
    });

    const darkAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Slate Charcoal
      roughness: 0.35,
      metalness: 0.3,
    });

    const indigoAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1, // AssetFlow Indigo
      roughness: 0.2,
      metalness: 0.2,
    });

    const lavenderMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e7ff, // Soft Lavender
      roughness: 0.3,
      metalness: 0.15,
    });

    const silverMaterial = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc, // Brushed Soft Silver
      roughness: 0.3,
      metalness: 0.6,
    });

    const glowScreenMaterial = new THREE.MeshBasicMaterial({
      color: 0xe0e7ff,
    });

    // 5. Build Procedural Asset Models
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // --- MODEL A: Central Stylized Ultrabook Laptop ---
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0, 0, 0);

    // Base Deck
    const baseGeo = new THREE.BoxGeometry(2.4, 0.08, 1.6);
    const baseMesh = new THREE.Mesh(baseGeo, bodyMaterial);
    laptopGroup.add(baseMesh);

    // Keyboard Area
    const kbGeo = new THREE.BoxGeometry(2.1, 0.015, 0.85);
    const kbMesh = new THREE.Mesh(kbGeo, darkAccentMaterial);
    kbMesh.position.set(0, 0.045, -0.15);
    laptopGroup.add(kbMesh);

    // Trackpad
    const trackpadGeo = new THREE.BoxGeometry(0.7, 0.01, 0.45);
    const trackpadMesh = new THREE.Mesh(trackpadGeo, lavenderMaterial);
    trackpadMesh.position.set(0, 0.045, 0.45);
    laptopGroup.add(trackpadMesh);

    // Screen Lid (Angled at 115 deg)
    const screenGroup = new THREE.Group();
    screenGroup.position.set(0, 0.04, -0.8);
    screenGroup.rotation.x = THREE.MathUtils.degToRad(-25);

    const lidGeo = new THREE.BoxGeometry(2.4, 1.5, 0.06);
    const lidMesh = new THREE.Mesh(lidGeo, bodyMaterial);
    lidMesh.position.set(0, 0.75, 0);
    screenGroup.add(lidMesh);

    const displayGeo = new THREE.BoxGeometry(2.2, 1.32, 0.01);
    const displayMesh = new THREE.Mesh(displayGeo, glowScreenMaterial);
    displayMesh.position.set(0, 0.75, 0.035);
    screenGroup.add(displayMesh);

    // Screen UI Elements (Header bar & mini cards)
    const uiBarGeo = new THREE.BoxGeometry(1.9, 0.12, 0.015);
    const uiBarMesh = new THREE.Mesh(uiBarGeo, indigoAccentMaterial);
    uiBarMesh.position.set(0, 1.25, 0.04);
    screenGroup.add(uiBarMesh);

    const uiCard1Geo = new THREE.BoxGeometry(0.85, 0.45, 0.015);
    const uiCard1Mesh = new THREE.Mesh(uiCard1Geo, lavenderMaterial);
    uiCard1Mesh.position.set(-0.5, 0.85, 0.04);
    screenGroup.add(uiCard1Mesh);

    const uiCard2Geo = new THREE.BoxGeometry(0.85, 0.45, 0.015);
    const uiCard2Mesh = new THREE.Mesh(uiCard2Geo, bodyMaterial);
    uiCard2Mesh.position.set(0.5, 0.85, 0.04);
    screenGroup.add(uiCard2Mesh);

    laptopGroup.add(screenGroup);
    rootGroup.add(laptopGroup);

    // --- MODEL B: Stylized Enterprise Server Module (Left Orbit) ---
    const serverGroup = new THREE.Group();
    serverGroup.position.set(-2.8, 1.1, -0.8);
    serverGroup.rotation.set(0.1, 0.35, -0.05);

    // Server Chassis
    const chassisGeo = new THREE.BoxGeometry(1.2, 1.6, 1.4);
    const chassisMesh = new THREE.Mesh(chassisGeo, bodyMaterial);
    serverGroup.add(chassisMesh);

    // Server Blade Slots
    for (let i = 0; i < 4; i++) {
      const slotGeo = new THREE.BoxGeometry(1.05, 0.22, 0.05);
      const slotMesh = new THREE.Mesh(slotGeo, darkAccentMaterial);
      slotMesh.position.set(0, 0.5 - i * 0.35, 0.71);
      serverGroup.add(slotMesh);

      // Status LED node
      const ledGeo = new THREE.SphereGeometry(0.035, 12, 12);
      const ledMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x10b981 : 0x6366f1, // Emerald or Indigo
      });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(0.38, 0.5 - i * 0.35, 0.74);
      serverGroup.add(ledMesh);
    }
    rootGroup.add(serverGroup);

    // --- MODEL C: Stylized Pro Display Monitor (Right Orbit) ---
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(2.9, 0.8, -0.5);
    monitorGroup.rotation.set(0.08, -0.32, 0.04);

    // Monitor Panel
    const monPanelGeo = new THREE.BoxGeometry(2.0, 1.3, 0.08);
    const monPanelMesh = new THREE.Mesh(monPanelGeo, bodyMaterial);
    monitorGroup.add(monPanelMesh);

    const monScreenGeo = new THREE.BoxGeometry(1.86, 1.16, 0.01);
    const monScreenMesh = new THREE.Mesh(monScreenGeo, glowScreenMaterial);
    monScreenMesh.position.set(0, 0, 0.045);
    monitorGroup.add(monScreenMesh);

    // Stand & Base
    const standGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16);
    const standMesh = new THREE.Mesh(standGeo, silverMaterial);
    standMesh.position.set(0, -0.7, -0.08);
    monitorGroup.add(standMesh);

    const standBaseGeo = new THREE.CylinderGeometry(0.4, 0.42, 0.04, 24);
    const standBaseMesh = new THREE.Mesh(standBaseGeo, silverMaterial);
    standBaseMesh.position.set(0, -1.08, -0.08);
    monitorGroup.add(standBaseMesh);

    rootGroup.add(monitorGroup);

    // --- MODEL D: Stylized Asset Storage Container / Hardware Box (Bottom-Right) ---
    const boxGroup = new THREE.Group();
    boxGroup.position.set(2.2, -1.2, 0.4);
    boxGroup.rotation.set(-0.15, -0.4, 0.1);

    const boxGeo = new THREE.BoxGeometry(1.1, 0.75, 0.9);
    const boxMesh = new THREE.Mesh(boxGeo, lavenderMaterial);
    boxGroup.add(boxMesh);

    // Asset Tag Badge on Box
    const tagGeo = new THREE.BoxGeometry(0.4, 0.2, 0.02);
    const tagMesh = new THREE.Mesh(tagGeo, indigoAccentMaterial);
    tagMesh.position.set(0, 0, 0.46);
    boxGroup.add(tagMesh);
    rootGroup.add(boxGroup);

    // --- MODEL E: Stylized Mobile Tablet (Bottom-Left) ---
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(-2.2, -1.1, 0.5);
    tabletGroup.rotation.set(0.2, 0.4, -0.15);

    const tabletBodyGeo = new THREE.BoxGeometry(0.9, 1.3, 0.05);
    const tabletBodyMesh = new THREE.Mesh(tabletBodyGeo, bodyMaterial);
    tabletGroup.add(tabletBodyMesh);

    const tabletScreenGeo = new THREE.BoxGeometry(0.8, 1.18, 0.01);
    const tabletScreenMesh = new THREE.Mesh(tabletScreenGeo, glowScreenMaterial);
    tabletScreenMesh.position.set(0, 0, 0.03);
    tabletGroup.add(tabletScreenMesh);
    rootGroup.add(tabletGroup);

    // --- MODEL F: Interconnected Telemetry Nodes & Orbiting Rings ---
    const nodesGroup = new THREE.Group();
    const nodeCoords = [
      [-1.6, 1.8, 0.2],
      [1.7, 1.9, -0.3],
      [-2.8, -0.2, 0.8],
      [3.0, -0.4, 0.5],
      [0.0, 2.2, -0.5],
      [0.0, -1.8, 0.2],
    ];

    nodeCoords.forEach(([x, y, z], index) => {
      const nodeGeo = new THREE.SphereGeometry(0.07, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0x6366f1 : 0xa5b4fc, // Indigo / Lavender
        roughness: 0.15,
        metalness: 0.2,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, y, z);
      nodesGroup.add(nodeMesh);

      // Subtle Outer Halo
      const haloGeo = new THREE.RingGeometry(0.1, 0.13, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.set(x, y, z);
      haloMesh.rotation.x = Math.PI / 2;
      nodesGroup.add(haloMesh);
    });

    // Subtle Connecting Arc Line
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, 1.1, -0.8),
      new THREE.Vector3(-1.6, 1.8, 0.2),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(1.7, 1.9, -0.3),
      new THREE.Vector3(2.9, 0.8, -0.5),
    ]);

    const linePoints = curve.getPoints(50);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xc7d2fe,
      transparent: true,
      opacity: 0.5,
    });
    const connectionLine = new THREE.Line(lineGeometry, lineMaterial);
    nodesGroup.add(connectionLine);

    rootGroup.add(nodesGroup);

    // 6. Interaction & Mouse Parallax with Damped Easing
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 0.35;
      mouse.targetY = y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Subtle scene orientation
      rootGroup.rotation.y =
        mouse.x +
        (prefersReducedMotion ? 0 : Math.sin(elapsedTime * 0.3) * 0.06);
      rootGroup.rotation.x =
        -mouse.y +
        (prefersReducedMotion ? 0 : Math.cos(elapsedTime * 0.25) * 0.04);

      if (!prefersReducedMotion) {
        // Subtle floating oscillations for individual assets
        laptopGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.06;
        serverGroup.position.y = 1.1 + Math.sin(elapsedTime * 0.9 + 1) * 0.08;
        monitorGroup.position.y = 0.8 + Math.cos(elapsedTime * 1.0 + 2) * 0.08;
        tabletGroup.position.y = -1.1 + Math.sin(elapsedTime * 1.1 + 3) * 0.07;
        boxGroup.position.y = -1.2 + Math.cos(elapsedTime * 0.8 + 4) * 0.06;

        // Slow telemetry node rotation
        nodesGroup.rotation.y = elapsedTime * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // 9. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive]);

  if (!webGLSupported) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-50/50 via-slate-50 to-violet-50/60 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 ${className}`}
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            AssetFlow Connected Ecosystem
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            Integrated asset tracking, predictive telemetry, and lifecycle management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[420px] select-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
