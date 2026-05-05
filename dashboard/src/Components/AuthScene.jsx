import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { Text, Sparkles, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function HorizontalSymbols() {
    const count = 30;
    const symbols = ["₹", "$"];

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                position: [
                    (Math.random() - 0.5) * 30, // Random X
                    (Math.random() - 0.5) * 15, // Random Y
                    (Math.random() - 0.5) * 10, // Random Z
                ],
                speed: 0.01 + Math.random() * 0.03,
                symbol: symbols[Math.floor(Math.random() * symbols.length)],
                scale: 0.15 + Math.random() * 0.3,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
            });
        }
        return temp;
    }, []);

    return (
        <group>
            {particles.map((p, i) => (
                <SymbolItem key={i} {...p} />
            ))}
        </group>
    );
}

function SymbolItem({ position, speed, symbol, scale, rotationSpeed }) {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            ref.current.position.x += speed;
            ref.current.rotation.y += rotationSpeed;

            // Loop back to left when exiting right
            if (ref.current.position.x > 15) {
                ref.current.position.x = -15;
            }
        }
    });

    return (
        <Text
            ref={ref}
            position={position}
            fontSize={scale}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            opacity={0.25}
            transparent
        >
            {symbol}
        </Text>
    );
}

function AmbientCandles() {
    const group = useRef();

    useFrame((state) => {
        if (group.current) {
            group.current.children.forEach((c, i) => {
                c.position.y += Math.sin(state.clock.getElapsedTime() + i) * 0.002;
            });
        }
    });

    return (
        <group ref={group}>
            {[...Array(12)].map((_, i) => {
                const h = Math.random() * 1.2 + 0.3;
                return (
                    <mesh key={i} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12, -8]}>
                        <boxGeometry args={[0.05, h, 0.05]} />
                        <meshStandardMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.15}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

export default function AuthScene() {
    return (
        <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />

            <HorizontalSymbols />
            <AmbientCandles />
            <Sparkles count={80} scale={20} size={1} speed={0.1} color="#ffffff" opacity={0.2} />
        </Canvas>
    );
}