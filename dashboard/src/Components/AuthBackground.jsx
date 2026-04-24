import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Float, Sparkles, Grid } from "@react-three/drei";
import * as THREE from "three";

// A stylized 3D Candlestick
const Candlestick = ({ position, color, height, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* Wick */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, height + 2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, height, 0.4]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9} 
          emissive={color} 
          emissiveIntensity={0.6} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

// Animated Market Trend positioned on the right side of the screen
const MarketTrend = () => {
  const groupRef = useRef();
  const count = 50; 

  const candles = useMemo(() => {
    const temp = [];
    let currentY = 0;
    for (let i = 0; i < count; i++) {
      const isUp = Math.random() > 0.45; 
      const change = Math.random() * 2.5;
      currentY += isUp ? change : -change;
      
      temp.push({
        z: -i * 1.8, 
        y: currentY,
        color: isUp ? "#00e676" : "#ff3366", // Neon Green or Red
        height: Math.max(0.5, Math.random() * 4),
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Moves the chart smoothly towards the camera
      groupRef.current.position.z = (t * 3.5) % 1.8;
    }
  });

  return (
    // Shifted to the right (x=6) and angled to face the camera beautifully
    <group ref={groupRef} position={[6, -3, -15]} rotation={[0.1, -0.3, 0]}>
      {candles.map((c, i) => (
        <Candlestick 
          key={i} 
          // Slight curve to the path
          position={[Math.sin(i * 0.15) * 3, c.y * 0.25, c.z]} 
          color={c.color} 
          height={c.height} 
        />
      ))}
    </group>
  );
};

const AuthBackground = () => {
  return (
    <div className="auth-canvas-container">
      <Canvas dpr={[1, 2]}>
        {/* Adjusted camera to look slightly down and right */}
        <PerspectiveCamera makeDefault position={[0, 3, 10]} fov={55} />
        <fog attach="fog" args={["#030b17", 8, 35]} />
        
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, 0, -10]} intensity={1.5} color="#00e676" />
        <pointLight position={[10, -5, -10]} intensity={2} color="#1e3a8a" />
        
        {/* Cyberpunk/Fintech Floor Grid */}
        <Grid 
          position={[0, -5, 0]} 
          args={[100, 100]} 
          cellSize={1} 
          cellThickness={1} 
          cellColor="#1e3a8a" 
          sectionSize={5} 
          sectionThickness={1.5} 
          sectionColor="#00e676" 
          fadeDistance={40} 
          fadeStrength={1} 
        />

        {/* Ambient floating data points */}
        <Sparkles count={200} scale={25} size={2} speed={0.2} color="#00e676" opacity={0.4} />

        <MarketTrend />
        
        {/* Distant tech sphere to anchor the background */}
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <mesh position={[12, 5, -25]}>
            <icosahedronGeometry args={[4, 1]} />
            <meshStandardMaterial 
              color="#030b17" 
              emissive="#1e3a8a" 
              emissiveIntensity={0.8} 
              wireframe 
            />
          </mesh>
        </Float>
      </Canvas>
      <div className="auth-overlay-gradient"></div>
    </div>
  );
};

export default AuthBackground;