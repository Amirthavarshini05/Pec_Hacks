// src/GameScene.js
import React, { useRef, useEffect, useMemo, Suspense, forwardRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useSpring, animated, useSpringRef } from "@react-spring/three";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// -------------------------------------------------------
// Constants
// -------------------------------------------------------
const GROUND_RADIUS = 3.2;
const CAT_SCALE = 0.05;
const BALL_SCALE = 0.22;
const HOOP_SCALE = 0.1;

const CAT_FACE_LEFT_Y = Math.PI;
const HOOP_FACE_RIGHT_Y = 0;

const BALL_IN_PAW_OFFSET = [-0.3, 0.5, 0];

// -------------------------------------------------------
// GLTF Models
// -------------------------------------------------------
const CatModel = forwardRef((props, ref) => {
  const { scene } = useGLTF("/module/cat.glb");
  return <primitive object={scene.clone()} ref={ref} {...props} />;
});
useGLTF.preload("/module/cat.glb");

const BasketballModel = forwardRef((props, ref) => {
  const { scene } = useGLTF("/module/basketball.glb");
  const object = scene.children[0] ? scene.children[0].clone() : scene.clone();
  return <primitive object={object} ref={ref} {...props} />;
});
useGLTF.preload("/module/basketball.glb");

const BasketModel = forwardRef((props, ref) => {
  const { scene } = useGLTF("/module/basketball_hoop.glb");
  const object = scene.children[0] ? scene.children[0].clone() : scene.clone();
  return <primitive object={object} ref={ref} {...props} />;
});
useGLTF.preload("/module/basketball_hoop.glb");

// Tree model (optional)
const TreeModel = forwardRef((props, ref) => {
  const { scene } = useGLTF("/module/tree3.glb");
  const object = scene.children[0] ? scene.children[0].clone() : scene.clone();
  return <primitive object={object} ref={ref} {...props} />;
});
useGLTF.preload("/module/tree3.glb");

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function degToRad(d) {
  return (d * Math.PI) / 180;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function quadBezierPoint(t, p0, p1, p2) {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    u * u * p0[2] + 2 * u * t * p1[2] + t * t * p2[2],
  ];
}

// -------------------------------------------------------
// Main Game Scene
// -------------------------------------------------------
const GameScene = ({ answeredCount, totalQuestions, showResults, onShotCompleted }) => {
  const catRef = useRef();
  const hoopRef = useRef();
  const ballHoldRef = useRef();

  // Initial and final positions of the cat and hoop
  const catStartPos = [2.5, 0.5, 0];
  const hoopPos = [-2.5, 0.5, 0];

  const clampedTotal = Math.max(1, totalQuestions || 1);
  const rawProgress = Math.min(answeredCount || 0, clampedTotal);
  const progress = Math.min(1, Math.max(0, rawProgress / clampedTotal));

  // Cat's animated position
  const catSpring = useSpring({
    position: [
      lerp(catStartPos[0], hoopPos[0] + 1.5, progress),
      catStartPos[1],
      catStartPos[2],
    ],
    rotationY: CAT_FACE_LEFT_Y,
    config: { mass: 1, tension: 220, friction: 26 },
  });

  const shotSpringRef = useSpringRef();
  const [{ t }, api] = useSpring(() => ({
    ref: shotSpringRef,
    from: { t: 0 },
    to: { t: 0 },
    config: { tension: 180, friction: 18 },
    onRest: (r) => {
      if (r.value.t === 1 && typeof onShotCompleted === "function") onShotCompleted();
    },
  }));

  const shotPointsRef = useRef({ p0: [0, 0, 0], p1: [0, 0, 0], p2: [0, 0, 0] });

  useEffect(() => {
    if (!showResults) return;
    const p0 = new THREE.Vector3();
    if (ballHoldRef.current) ballHoldRef.current.getWorldPosition(p0);
    const p2 = new THREE.Vector3(...hoopPos);
    p2.y += 0.4;
    const mid = new THREE.Vector3((p0.x + p2.x) / 2, (p0.y + p2.y) / 2, (p0.z + p2.z) / 2);
    const p1 = mid.clone();
    p1.y += 0.9;
    shotPointsRef.current = { p0: [p0.x, p0.y, p0.z], p1: [p1.x, p1.y, p1.z], p2: [p2.x, p2.y, p2.z] };
    api.start({ from: { t: 0 }, to: { t: 1 } });
  }, [showResults, hoopPos, api, catSpring.position]);

  const showHeldBall = !showResults;
  const showFlyingBall = showResults;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 4, 6], fov: 60 }}
      style={{ background: "#e0e7f0", width: "100%", height: "100vh" }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

      {/* Ground */}
      <mesh position={[0, 0, -0.2]} receiveShadow>
        <circleGeometry args={[10, 96]} />
        <meshStandardMaterial color="#387c2b" roughness={0.85} />
      </mesh>

      <Suspense fallback={null}>
        {/* Hoop */}
        <group position={hoopPos}>
          <BasketModel ref={hoopRef} scale={[HOOP_SCALE, HOOP_SCALE, HOOP_SCALE]} rotation={[0, HOOP_FACE_RIGHT_Y, 0]} castShadow receiveShadow />
        </group>

        {/* Cat */}
        <animated.group position={catSpring.position} rotation-y={catSpring.rotationY}>
          <CatModel ref={catRef} scale={[CAT_SCALE, CAT_SCALE, CAT_SCALE]} castShadow receiveShadow />
          {showHeldBall && (
            <group ref={ballHoldRef} position={BALL_IN_PAW_OFFSET}>
              <BasketballModel scale={[BALL_SCALE, BALL_SCALE, BALL_SCALE]} castShadow receiveShadow />
            </group>
          )}
        </animated.group>

        {/* Flying ball */}
        {showFlyingBall && (
          <animated.group position={t.to((tt) => {
            const { p0, p1, p2 } = shotPointsRef.current;
            return quadBezierPoint(tt, p0, p1, p2);
          })}>
            <BasketballModel scale={[BALL_SCALE, BALL_SCALE, BALL_SCALE]} castShadow receiveShadow />
          </animated.group>
        )}
      </Suspense>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        target={[0, 1.5, 0]}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  );
};

export default GameScene;