'use client';
import { useEffect, useRef } from 'react';

interface ParticleOrbProps {
  state: 'idle' | 'listening' | 'speaking' | 'thinking';
}

export function ParticleOrb({ state }: ParticleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- CONFIGURATION ---
    const particleCount = 1200; // Dense cloud like the image
    const baseRadius = 150;     // Size of the sphere
    const connectionDistance = 0; // Set to 20 if you want lines (Video style)
    
    // State-based Colors & Speeds
    let targetSpeed = 0.002;
    let targetColor = { r: 0, g: 255, b: 255 }; // Cyan
    let pulseIntensity = 0;

    // --- PARTICLE SYSTEM ---
    const particles: { x: number; y: number; z: number; theta: number; phi: number }[] = [];

    // Initialize Fibonacci Sphere (Perfect distribution)
    const phi = Math.PI * (3 - Math.sqrt(5)); 
    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      particles.push({
        x: Math.cos(theta) * radius,
        y: y,
        z: Math.sin(theta) * radius,
        theta: theta, // Store original angles for morphing
        phi: Math.acos(y)
      });
    }

    // --- ANIMATION LOOP ---
    let time = 0;
    let rotationX = 0;
    let rotationY = 0;
    let animationFrameId: number;

    const render = () => {
      // 1. Handle Resizing
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Only resize if necessary (Optimization)
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // 2. Clear & Set Style
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter'; // This creates the GLOW effect

      // 3. State Logic
      if (state === 'listening') {
        targetSpeed = 0.002;
        targetColor = { r: 6, g: 182, b: 212 }; // Cyan-500
        pulseIntensity = 2; // Slight breath
      } else if (state === 'speaking') {
        targetSpeed = 0.005;
        targetColor = { r: 59, g: 130, b: 246 }; // Blue-500
        pulseIntensity = 15; // Heavy pulse
      } else if (state === 'thinking') {
        targetSpeed = 0.01;
        targetColor = { r: 168, g: 85, b: 247 }; // Purple-500
        pulseIntensity = 5;
      } else {
        // Idle (Hidden logic handled by parent opacity, but slow down here)
        targetSpeed = 0.001;
      }

      rotationY += targetSpeed;
      rotationX += targetSpeed * 0.5;
      time += 0.05;

      // Pulse Calculation (Breathing)
      const currentRadius = baseRadius + Math.sin(time) * pulseIntensity;

      // 4. Draw Particles
      ctx.fillStyle = `rgba(${targetColor.r}, ${targetColor.g}, ${targetColor.b}, 0.8)`;
      
      particles.forEach((p) => {
        // A. Morphing Logic (The "Move on its own" part)
        // Add sine wave distortion based on Y position
        const distortion = Math.sin(time * 2 + p.y * 5) * (state === 'speaking' ? 20 : 5);
        
        // B. 3D Rotation
        let x = p.x * (currentRadius + distortion);
        let y = p.y * (currentRadius + distortion);
        let z = p.z * (currentRadius + distortion);

        // Rotate Y
        let tempX = x * Math.cos(rotationY) - z * Math.sin(rotationY);
        let tempZ = x * Math.sin(rotationY) + z * Math.cos(rotationY);
        x = tempX; z = tempZ;

        // Rotate X
        let tempY = y * Math.cos(rotationX) - z * Math.sin(rotationX);
        tempZ = y * Math.sin(rotationX) + z * Math.cos(rotationX);
        y = tempY; z = tempZ;

        // C. Project 3D -> 2D
        const perspective = 800;
        const scale = perspective / (perspective + z);
        const x2d = x * scale + centerX;
        const y2d = y * scale + centerY;
        const size = 1.5 * scale; // Particles further away are smaller

        // D. Draw
        if (z < -perspective + 10) return; // Clipping
        
        // Depth-based opacity (Fog)
        const alpha = Math.max(0, (z + baseRadius) / (baseRadius * 2));
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [state]);

  return <canvas ref={canvasRef} className="size-full" />;
}