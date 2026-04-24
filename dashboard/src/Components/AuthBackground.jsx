import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Stars, Text, Torus, Octahedron, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// A floating trading candle
const TradingCandle = ({ position, color, height }) => {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        {/* Wick */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.05, height + 0.5, 0.05]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </mesh>
        {/* Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.3, height, 0.3]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      </group>
    </Float>
  );
};

// Floating currency symbols or geometric representations of "money"
const MoneyParticle = ({ position, color }) => {
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <mesh position={position}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} wireframe />
      </mesh>
    </Float>
  );
};

const DigitalGrid = () => {
  const gridRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (gridRef.current) {
      gridRef.current.position.z = (t * 2) % 10;
    }
  });

  return (
    <group ref={gridRef}>
      <gridHelper args={[100, 50, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -10]} />
    </group>
  );
};

const MovingParticles = () => {
  const count = 100;
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20,
        ],
        color: Math.random() > 0.5 ? "#10b981" : "#f43f5e",
        height: Math.random() * 2 + 0.5,
      });
    }
    return temp;
  }, []);

  return (
    <group>
      {particles.map((p, i) => (
        i % 5 === 0 ? (
          <TradingCandle key={i} position={p.position} color={p.color} height={p.height} />
        ) : (
          <MoneyParticle key={i} position={p.position} color={p.color} />
        )
      ))}
    </group>
  );
};

const AuthBackground = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
      }}
    >
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#10b981" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <DigitalGrid />
        <MovingParticles />
        
        {/* Central glowing orb behind the card */}
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <mesh position={[0, 0, -5]}>
            <sphereGeometry args={[8, 32, 32]} />
            <MeshDistortMaterial
              color="#1e293b"
              transparent
              opacity={0.3}
              distort={0.4}
              speed={2}
            />
          </mesh>
        </Float>
      </Canvas>
      
      {/* Decorative overlay for extra depth */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at center, transparent 30%, rgba(2, 6, 23, 0.7) 100%)",
        pointerEvents: "none"
      }} />
    </div>
  );
};

export default AuthBackground;
