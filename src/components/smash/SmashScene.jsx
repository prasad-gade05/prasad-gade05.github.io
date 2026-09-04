import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  createDebris,
  createShards,
  impactFromSpeed,
  rayFromPoint,
  shardOpacity,
  solveBallisticVelocity,
  stepDebris,
  stepShards,
  steerToRay,
  targetMaxHp,
  translateShards,
} from './shatterPhysics'
import { paintImpact, paintRectHole, paneToCanvas, radiusToCanvas } from './damageCanvas'
import { playGunshot, playSmashSound } from './smashSound'
import { shouldHoldRepeat } from './holdFire'

const BALL_RADIUS = 0.34
const MAX_SHARDS = 260
const MAX_PROJECTILES = 6
const MAX_DEBRIS = 900
const BALL_COOLDOWN_MS = 350
const GUN_COOLDOWN_MS = 130
const CLICK_FIRE_MS = 350
const HIT_Z = 0.2
const BACK_Z = -0.5
const BULLET_SPEED = 40
const BULLET_RADIUS = 0.32
const BULLET_DAMAGE = 12
const BALL_GRAVITY = 6.5
const BALL_SPEEDS = [13, 16, 20, 26]

const rand = (min, max) => min + Math.random() * (max - min)
const _muzzle = new THREE.Vector3()
const _forward = new THREE.Vector3()

/* ------------------------------------------------------------------ */
/* Views — each syncs its own three object per frame so the parent     */
/* never re-renders on animation ticks.                                */
/* ------------------------------------------------------------------ */

const ShardView = ({ shard, texture }) => {
  const meshRef = useRef()
  const matRef = useRef()

  const geometry = useMemo(() => {
    const cx0 = (shard.ax + shard.bx + shard.cx) / 3
    const cy0 = (shard.ay + shard.by + shard.cy) / 3
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [shard.ax - cx0, shard.ay - cy0, 0, shard.bx - cx0, shard.by - cy0, 0, shard.cx - cx0, shard.cy - cy0, 0],
        3,
      ),
    )
    g.setAttribute(
      'uv',
      new THREE.Float32BufferAttribute([shard.u1, shard.v1, shard.u2, shard.v2, shard.u3, shard.v3], 2),
    )
    g.computeVertexNormals()
    return g
  }, [shard])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.position.set(shard.px, shard.py, shard.pz)
    mesh.rotation.set(shard.rx, shard.ry, shard.rz)
    if (matRef.current) matRef.current.opacity = shardOpacity(shard)
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        color="#ffffff"
        side={THREE.DoubleSide}
        transparent
        roughness={0.12}
        metalness={0.15}
      />
    </mesh>
  )
}

const ProjectileView = ({ proj }) => {
  const groupRef = useRef()
  const matRef = useRef()

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    group.position.set(proj.x, proj.y, proj.z)
    if (proj.kind === 'bullet') {
      group.lookAt(proj.x + proj.vx, proj.y + proj.vy, proj.z + proj.vz)
    } else {
      group.rotation.x += proj.spin * 0.016
      group.rotation.z -= proj.spin * 0.011
    }
    if (matRef.current) {
      if (proj.kind === 'bullet') {
        matRef.current.opacity = 1
      } else {
        const fadeStart = proj.spentAt + 0.9
        matRef.current.opacity = proj.life > fadeStart ? Math.max(0, 1 - (proj.life - fadeStart) / 0.7) : 1
      }
    }
  })

  if (proj.kind === 'bullet') {
    return (
      <group ref={groupRef}>
        <mesh>
          <boxGeometry args={[0.07, 0.07, 0.9]} />
          <meshBasicMaterial ref={matRef} color="#ffdf9e" transparent opacity={1} toneMapped={false} />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[BALL_RADIUS, 24, 18]} />
        <meshStandardMaterial
          ref={matRef}
          color="#16161f"
          roughness={0.28}
          metalness={0.2}
          transparent
        />
      </mesh>
      {[
        [0.1, 0.22, 0.24],
        [-0.08, 0.26, 0.2],
        [0.02, 0.12, 0.3],
      ].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color="#000000" roughness={0.9} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

/* One breakable site card: a seamless plane showing its real screenshot */
const TargetView = ({ target }) => {
  const meshRef = useRef()
  const matRef = useRef()

  const geometry = useMemo(() => new THREE.PlaneGeometry(target.w, target.h), [target.w, target.h])
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    if (target.gone) {
      mesh.visible = false
      return
    }
    mesh.visible = true
    mesh.position.set(target.x + target.ox, target.y + target.oy, target.oz || 0)
    mesh.rotation.set(0, 0, target.rot)
    if (matRef.current) {
      matRef.current.opacity = target.fade >= 1 ? Math.max(0, 1 - (target.fade - 1) / 0.5) : 1
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      renderOrder={target.order}
      onPointerDown={target.onDown}
      onPointerUp={target.onUp}
      onPointerMove={target.onMove}
    >
      <meshStandardMaterial
        ref={matRef}
        map={target.face.tex}
        transparent
        roughness={0.25}
        metalness={0.05}
      />
    </mesh>
  )
}

/* Single Points cloud for all debris chips */
const DebrisCloud = ({ debrisRef }) => {
  const pointsRef = useRef()

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_DEBRIS * 3), 3))
    return g
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const points = pointsRef.current
    if (!points) return
    const parts = debrisRef.current
    const attr = geometry.attributes.position
    const n = Math.min(parts.length, MAX_DEBRIS)
    for (let i = 0; i < n; i++) {
      attr.setXYZ(i, parts[i].x, parts[i].y, parts[i].z)
    }
    /* eslint-disable react-hooks/immutability -- three.js buffer upload flags, not React state */
    attr.needsUpdate = true
    geometry.setDrawRange(0, n)
    /* eslint-enable react-hooks/immutability */
    points.visible = n > 0
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color="#cfe6ff"
        size={0.1}
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </points>
  )
}

/* Pooled expanding shockwave rings */
const ShockRings = ({ wavesRef }) => {
  const meshRefs = useRef([])

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, Math.max(0, dtRaw))
    wavesRef.current.forEach((wave, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      if (!wave.active) {
        mesh.visible = false
        return
      }
      wave.t += dt * 2.4
      if (wave.t >= 1) {
        wave.active = false
        mesh.visible = false
        return
      }
      mesh.visible = true
      mesh.position.set(wave.x, wave.y, 0.4)
      const s = 0.3 + wave.t * 4.4
      mesh.scale.set(s, s, 1)
      mesh.material.opacity = 0.65 * (1 - wave.t)
    })
  })

  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(m) => { meshRefs.current[i] = m }} visible={false} raycast={() => null}>
          <ringGeometry args={[0.85, 1, 40]} />
          <meshBasicMaterial color="#ffd9a0" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Gun + ball cannon — one mount, aimed with lookAt every frame        */
/* ------------------------------------------------------------------ */

const GunMount = ({ mount, aimRef, flashRef, weapon, gunMuzzleRef, cannonMuzzleRef, recoilPing }) => {
  const gunRef = useRef()
  const cannonRef = useRef()
  const flashMeshRef = useRef()
  const recoil = useRef(0)
  const lastPing = useRef(0)

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, Math.max(0, dtRaw))
    const aim = aimRef.current
    if (recoilPing.current !== lastPing.current) {
      lastPing.current = recoilPing.current
      recoil.current = 1
    }
    recoil.current = Math.max(0, recoil.current - dt * 6)
    for (const [ref, isGun] of [[gunRef, true], [cannonRef, false]]) {
      const group = ref.current
      if (!group) continue
      const active = (weapon === 'gun') === isGun
      group.visible = active
      if (!active) continue
      group.lookAt(aim.x, aim.y, aim.z)
      _forward.set(aim.x - mount.x, aim.y - mount.y, aim.z - mount.z).normalize()
      const kick = recoil.current * 0.45
      group.position.set(mount.x - _forward.x * kick, mount.y - _forward.y * kick, mount.z - _forward.z * kick)
    }
    const flash = flashRef.current
    if (flashMeshRef.current) {
      flashMeshRef.current.visible = flash.t > 0
      if (flash.t > 0) {
        const s = 0.6 + flash.t * 0.9
        flashMeshRef.current.scale.set(s, s, s)
      }
    }
  })

  return (
    <group>
      {/* M4-pattern carbine along +Z (muzzle forward for lookAt aiming):
          round ribbed handguard, triangular front sight, birdcage hider,
          curved STANAG mag, waffle stock. No emissives — pure iron. */}
      <group ref={gunRef} position={[mount.x, mount.y, mount.z]}>
        {/* Receiver + flat-top rail */}
        <mesh>
          <boxGeometry args={[0.3, 0.36, 1.1]} />
          <meshStandardMaterial color="#1c1e23" roughness={0.52} metalness={0.88} />
        </mesh>
        <mesh position={[0, 0.2, 0.3]}>
          <boxGeometry args={[0.11, 0.05, 1.7]} />
          <meshStandardMaterial color="#121316" roughness={0.5} metalness={0.88} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={`rail-${i}`} position={[0, 0.245, -0.35 + i * 0.26]}>
            <boxGeometry args={[0.13, 0.04, 0.08]} />
            <meshStandardMaterial color="#191b20" roughness={0.55} metalness={0.82} />
          </mesh>
        ))}
        {/* Flip-up rear sight: base + ears + aperture disc */}
        <mesh position={[0, 0.27, -0.3]}>
          <boxGeometry args={[0.15, 0.06, 0.2]} />
          <meshStandardMaterial color="#14161a" roughness={0.5} metalness={0.85} />
        </mesh>
        {[-0.065, 0.065].map((x) => (
          <mesh key={`rear-${x}`} position={[x, 0.37, -0.3]}>
            <boxGeometry args={[0.035, 0.15, 0.07]} />
            <meshStandardMaterial color="#14161a" roughness={0.5} metalness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.4, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
          <meshStandardMaterial color="#0a0b0e" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Round ribbed handguard + delta ring + front cap */}
        <mesh position={[0, 0, 1.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.95, 20]} />
          <meshStandardMaterial color="#1e2126" roughness={0.8} metalness={0.08} />
        </mesh>
        {[0.68, 0.9, 1.12, 1.34].map((z) => (
          <mesh key={`rib-${z}`} position={[0, 0, z]}>
            <torusGeometry args={[0.152, 0.018, 8, 24]} />
            <meshStandardMaterial color="#16181d" roughness={0.85} metalness={0.05} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.165, 0.165, 0.1, 20]} />
          <meshStandardMaterial color="#14161a" roughness={0.5} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0, 1.48]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.158, 0.158, 0.07, 20]} />
          <meshStandardMaterial color="#14161a" roughness={0.5} metalness={0.85} />
        </mesh>
        {/* Government-profile barrel: thin visible section */}
        <mesh position={[0, 0.01, 1.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.85, 14]} />
          <meshStandardMaterial color="#0f1114" roughness={0.42} metalness={0.9} />
        </mesh>
        {/* Fixed front sight base + triangular wings + post */}
        <mesh position={[0, 0.12, 1.95]}>
          <boxGeometry args={[0.09, 0.24, 0.12]} />
          <meshStandardMaterial color="#16181d" roughness={0.5} metalness={0.85} />
        </mesh>
        <mesh position={[-0.085, 0.32, 1.95]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.045, 0.3, 0.07]} />
          <meshStandardMaterial color="#16181d" roughness={0.5} metalness={0.85} />
        </mesh>
        <mesh position={[0.085, 0.32, 1.95]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.045, 0.3, 0.07]} />
          <meshStandardMaterial color="#16181d" roughness={0.5} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.3, 1.95]}>
          <boxGeometry args={[0.032, 0.2, 0.032]} />
          <meshStandardMaterial color="#0a0b0e" roughness={0.45} metalness={0.8} />
        </mesh>
        {/* A2 birdcage flash hider with slots */}
        <mesh position={[0, 0.01, 2.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.3, 16]} />
          <meshStandardMaterial color="#14161a" roughness={0.48} metalness={0.88} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2
          return (
            <mesh
              key={`slot-${i}`}
              position={[Math.cos(a) * 0.072, 0.01 + Math.sin(a) * 0.072, 2.45]}
              rotation={[0, 0, a]}
            >
              <boxGeometry args={[0.025, 0.05, 0.22]} />
              <meshStandardMaterial color="#060708" roughness={0.6} metalness={0.7} />
            </mesh>
          )
        })}
        <mesh position={[0, 0.01, 2.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.078, 0.078, 0.04, 16]} />
          <meshStandardMaterial color="#0a0b0e" roughness={0.5} metalness={0.85} />
        </mesh>
        {/* Curved 30-round magazine in three segments */}
        <mesh position={[0, -0.42, 0.12]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[0.24, 0.4, 0.32]} />
          <meshStandardMaterial color="#1b1e25" roughness={0.55} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.72, 0.21]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.22, 0.35, 0.3]} />
          <meshStandardMaterial color="#1b1e25" roughness={0.55} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.97, 0.35]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.2, 0.3, 0.28]} />
          <meshStandardMaterial color="#1b1e25" roughness={0.55} metalness={0.8} />
        </mesh>
        <mesh position={[0, -1.12, 0.44]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.24, 0.07, 0.32]} />
          <meshStandardMaterial color="#101216" roughness={0.7} metalness={0.5} />
        </mesh>
        {/* Pistol grip */}
        <mesh position={[0, -0.44, -0.38]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.24, 0.48, 0.28]} />
          <meshStandardMaterial color="#16171b" roughness={0.9} metalness={0.05} />
        </mesh>
        {/* Trigger guard + trigger */}
        <mesh position={[0, -0.3, -0.12]}>
          <boxGeometry args={[0.04, 0.04, 0.42]} />
          <meshStandardMaterial color="#101216" roughness={0.5} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.22, 0.08]}>
          <boxGeometry args={[0.04, 0.17, 0.04]} />
          <meshStandardMaterial color="#101216" roughness={0.5} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.22, -0.32]}>
          <boxGeometry args={[0.04, 0.17, 0.04]} />
          <meshStandardMaterial color="#101216" roughness={0.5} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.25, -0.14]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.04, 0.14, 0.06]} />
          <meshStandardMaterial color="#26292f" roughness={0.4} metalness={0.85} />
        </mesh>
        {/* Ejection port cover (closed) + rod + deflector + assist */}
        <mesh position={[0.155, 0.03, 0.18]}>
          <boxGeometry args={[0.015, 0.11, 0.28]} />
          <meshStandardMaterial color="#101215" roughness={0.55} metalness={0.8} />
        </mesh>
        <mesh position={[0.155, -0.04, 0.18]}>
          <boxGeometry args={[0.02, 0.03, 0.3]} />
          <meshStandardMaterial color="#26292f" roughness={0.4} metalness={0.85} />
        </mesh>
        <mesh position={[0.16, 0.03, -0.05]}>
          <boxGeometry args={[0.03, 0.09, 0.06]} />
          <meshStandardMaterial color="#14161a" roughness={0.5} metalness={0.85} />
        </mesh>
        <mesh position={[0.17, 0.08, -0.28]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.035, 0.045, 0.12, 10]} />
          <meshStandardMaterial color="#16181d" roughness={0.5} metalness={0.85} />
        </mesh>
        {/* Charging handle + ambi selectors + mag release + bolt catch */}
        <mesh position={[0, 0.18, -0.58]}>
          <boxGeometry args={[0.2, 0.06, 0.12]} />
          <meshStandardMaterial color="#14161a" roughness={0.5} metalness={0.85} />
        </mesh>
        {[-0.17, 0.17].map((x) => (
          <mesh key={`sel-${x}`} position={[x, -0.04, -0.28]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.04, 12]} />
            <meshStandardMaterial color="#26292f" roughness={0.4} metalness={0.85} />
          </mesh>
        ))}
        <mesh position={[0.17, -0.12, 0.02]}>
          <boxGeometry args={[0.04, 0.08, 0.1]} />
          <meshStandardMaterial color="#26292f" roughness={0.4} metalness={0.85} />
        </mesh>
        <mesh position={[-0.165, 0.0, -0.05]}>
          <boxGeometry args={[0.02, 0.07, 0.22]} />
          <meshStandardMaterial color="#26292f" roughness={0.4} metalness={0.85} />
        </mesh>
        {/* Collapsible waffle stock + castle nut + buttpad */}
        <mesh position={[0, 0.02, -0.66]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.16, 12]} />
          <meshStandardMaterial color="#14161a" roughness={0.5} metalness={0.85} />
        </mesh>
        <mesh position={[0, -0.03, -1.1]}>
          <boxGeometry args={[0.28, 0.36, 0.7]} />
          <meshStandardMaterial color="#16171b" roughness={0.85} metalness={0.08} />
        </mesh>
        {[-1.28, -1.12, -0.96].map((z) => (
          <mesh key={`waffle-${z}`} position={[0, -0.03, z]}>
            <boxGeometry args={[0.3, 0.38, 0.05]} />
            <meshStandardMaterial color="#101216" roughness={0.9} metalness={0.05} />
          </mesh>
        ))}
        <mesh position={[0, -0.16, -1.02]}>
          <boxGeometry args={[0.2, 0.08, 0.3]} />
          <meshStandardMaterial color="#101216" roughness={0.7} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.03, -1.48]}>
          <boxGeometry args={[0.3, 0.4, 0.09]} />
          <meshStandardMaterial color="#0c0d10" roughness={0.95} metalness={0.0} />
        </mesh>
        {/* Muzzle flash + bullet spawn point */}
        <mesh position={[0, 0.01, 2.74]} ref={flashMeshRef} visible={false}>
          <sphereGeometry args={[0.26, 12, 10]} />
          <meshBasicMaterial color="#ffe9b0" transparent opacity={0.95} toneMapped={false} depthWrite={false} />
        </mesh>
        <object3D ref={gunMuzzleRef} position={[0, 0.01, 2.62]} />
      </group>
      {/* Ball cannon */}
      <group ref={cannonRef} position={[mount.x, mount.y, mount.z]} visible={false}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.55, 0.68, 0.32, 24]} />
          <meshStandardMaterial color="#23232e" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.36, 1.0, 20]} />
          <meshStandardMaterial color="#1c1c26" roughness={0.45} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.14, 20]} />
          <meshStandardMaterial color="#2a2a35" roughness={0.4} metalness={0.6} emissive="#38e1c6" emissiveIntensity={0.5} />
        </mesh>
        <object3D ref={cannonMuzzleRef} position={[0, 0, 1.1]} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = reject
  img.src = src
})

const SmashScene = ({ scene, weapon, resetKey, onProgress }) => {
  const { viewport } = useThree()
  const [ready, setReady] = useState(false)
  const [targetsVersion, setTargetsVersion] = useState(0)
  const [projVersion, setProjVersion] = useState(0)
  const [shardVersion, setShardVersion] = useState(0)

  const groupRef = useRef()
  const flashRef = useRef()
  const gunFlashRef = useRef({ t: 0 })
  const gunMuzzleRef = useRef(null)
  const cannonMuzzleRef = useRef(null)
  const recoilPing = useRef(0)
  const targetsRef = useRef([])
  const wallRef = useRef(null) // { canvas, ctx, cw, ch, tex }
  const shardsRef = useRef([])
  const projsRef = useRef([])
  const debrisRef = useRef([])
  const wavesRef = useRef([
    { active: false, x: 0, y: 0, t: 0 },
    { active: false, x: 0, y: 0, t: 0 },
    { active: false, x: 0, y: 0, t: 0 },
    { active: false, x: 0, y: 0, t: 0 },
  ])
  const weaponRef = useRef(weapon)
  const aimRef = useRef({ x: 0, y: 0.5, z: 0 })
  const mountRef = useRef({ x: 0, y: -3, z: 2.6 })
  const paneSizeRef = useRef({ w: 0, h: 0 })
  const clickRef = useRef(null)
  const holdRef = useRef(null) // press timestamp while the pointer is held down
  const shakeRef = useRef(0)
  const flashState = useRef({ t: 0, x: 0, y: 0 })
  const lastBallRef = useRef(0)
  const lastGunRef = useRef(0)
  const nextProjId = useRef(0)
  const statsRef = useRef({ hits: 0, shots: 0 })
  const progressRef = useRef({ onProgress })

  useEffect(() => {
    weaponRef.current = weapon
  }, [weapon])

  useEffect(() => {
    progressRef.current = { onProgress }
  }, [onProgress])

  const report = () => {
    const targets = targetsRef.current
    const total = targets.length
    const left = targets.filter((t) => !t.detached).length
    const maxHp = targets.reduce((sum, t) => sum + t.maxHp, 0)
    const hp = targets.reduce((sum, t) => sum + Math.max(0, t.hp), 0)
    progressRef.current.onProgress?.({
      integrity: maxHp > 0 ? Math.round((hp / maxHp) * 1000) / 10 : 100,
      hits: statsRef.current.hits,
      shots: statsRef.current.shots,
      left,
      total,
    })
  }

  const updateAim = (point) => {
    aimRef.current.x = point.x
    aimRef.current.y = point.y
    aimRef.current.z = 0
  }

  /* Hold-to-fire bookkeeping: a press starts the hold clock, any release
   * (even off-canvas) stops it so the gun can never stick on. */
  const beginHold = () => {
    holdRef.current = performance.now()
  }
  const endHold = () => {
    holdRef.current = null
  }

  useEffect(() => {
    window.addEventListener('pointerup', endHold)
    window.addEventListener('pointercancel', endHold)
    return () => {
      window.removeEventListener('pointerup', endHold)
      window.removeEventListener('pointercancel', endHold)
    }
  }, [])

  /* Build the room from real captures: backdrop wall + seamless card planes */
  useEffect(() => {
    let cancelled = false
    const w = viewport.width
    const h = viewport.height
    paneSizeRef.current = { w, h }
    mountRef.current = { x: 0, y: -h / 2 + 0.95, z: 2.6 }
    const vw = window.innerWidth
    const vh = window.innerHeight
    const sx = w / vw
    const sy = h / vh

    const disposeRoom = () => {
      wallRef.current?.tex?.dispose()
      wallRef.current = null
      for (const t of targetsRef.current) {
        t.face.tex.dispose()
        t.face.pristineTex.dispose()
      }
      targetsRef.current = []
    }

    const build = async () => {
      disposeRoom()
      if (!scene?.backdrop) {
        if (!cancelled) {
          setReady(true)
          report()
        }
        return
      }

      // Backdrop wall (full-viewport cover of the page screenshot)
      const wallImg = await loadImage(scene.backdrop)
      if (cancelled) return
      const cw = 1024
      const ch = Math.max(2, Math.round((cw * h) / Math.max(w, 0.01)))
      const wallCanvas = document.createElement('canvas')
      wallCanvas.width = cw
      wallCanvas.height = ch
      const wallCtx = wallCanvas.getContext('2d')
      wallCtx.drawImage(wallImg, 0, 0, cw, ch)
      const wallTex = new THREE.CanvasTexture(wallCanvas)
      wallTex.colorSpace = THREE.SRGBColorSpace
      wallTex.minFilter = THREE.LinearFilter
      wallTex.magFilter = THREE.LinearFilter
      wallRef.current = { canvas: wallCanvas, ctx: wallCtx, cw, ch, tex: wallTex }

      // One breakable plane per captured card, exactly over its backdrop pixels
      const targets = []
      let order = 10
      for (const [index, item] of (scene.items || []).entries()) {
        try {
          const img = await loadImage(item.image)
          if (cancelled) return
          const { rect } = item
          const tw = Math.max(0.2, rect.w * sx)
          const th = Math.max(0.2, rect.h * sy)
          const cx = (rect.x + rect.w / 2 - vw / 2) * sx
          const cy = (vh / 2 - (rect.y + rect.h / 2)) * sy

          const canvas = document.createElement('canvas')
          canvas.width = Math.max(2, img.naturalWidth || img.width)
          canvas.height = Math.max(2, img.naturalHeight || img.height)
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const pristine = document.createElement('canvas')
          pristine.width = canvas.width
          pristine.height = canvas.height
          pristine.getContext('2d').drawImage(canvas, 0, 0)

          const tex = new THREE.CanvasTexture(canvas)
          tex.colorSpace = THREE.SRGBColorSpace
          tex.minFilter = THREE.LinearFilter
          tex.magFilter = THREE.LinearFilter
          const pristineTex = new THREE.CanvasTexture(pristine)
          pristineTex.colorSpace = THREE.SRGBColorSpace
          pristineTex.minFilter = THREE.LinearFilter
          pristineTex.magFilter = THREE.LinearFilter

          const maxHp = targetMaxHp({ w: tw, h: th })
          const target = {
            id: item.id || `target-${index}`,
            order: order++,
            x: cx, y: cy, w: tw, h: th,
            maxHp, hp: maxHp,
            face: { canvas, ctx, pristine, cw: canvas.width, ch: canvas.height, tex, pristineTex },
            ox: 0, oy: 0, oz: 0, vx: 0, vy: 0, vz: 0,
            rot: 0, vr: 0,
            detached: false,
            gone: false,
            fade: 0,
            onDown: null,
            onUp: null,
            onMove: null,
          }
          target.onDown = (e) => {
            e.stopPropagation()
            updateAim(e.point)
            clickRef.current = { t: performance.now() }
            if (weaponRef.current === 'gun') {
              // Instant first shot, then automatic while held (see useFrame)
              beginHold()
              fireWeapon(e.point)
            }
          }
          target.onUp = (e) => {
            const down = clickRef.current
            clickRef.current = null
            endHold()
            // Gun already fired on press; balls stay click-to-lob
            if (weaponRef.current !== 'gun' && down && performance.now() - down.t < CLICK_FIRE_MS) {
              fireWeapon(e.point)
            }
          }
          target.onMove = (e) => {
            updateAim(e.point)
          }
          targets.push(target)
        } catch {
          // skip this card — the backdrop still shows it
        }
      }
      if (cancelled) {
        for (const t of targets) {
          t.face.tex.dispose()
          t.face.pristineTex.dispose()
        }
        wallTex.dispose()
        return
      }
      targetsRef.current = targets
      shardsRef.current = []
      projsRef.current = []
      debrisRef.current = []
      statsRef.current = { hits: 0, shots: 0 }
      setShardVersion((v) => v + 1)
      setProjVersion((v) => v + 1)
      setTargetsVersion((v) => v + 1)
      setReady(true)
      report()
    }

    build().catch(() => {
      if (!cancelled) {
        setReady(true)
        report()
      }
    })

    return () => {
      cancelled = true
      disposeRoom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  /* Rebuild — repaint pristine pixels, full HP, clear all debris */
  useEffect(() => {
    if (resetKey === 0 || !ready) return
    for (const t of targetsRef.current) {
      t.hp = t.maxHp
      t.ox = 0; t.oy = 0; t.oz = 0
      t.vx = 0; t.vy = 0; t.vz = 0
      t.rot = 0; t.vr = 0
      t.detached = false
      t.gone = false
      t.fade = 0
      t.face.ctx.save()
      t.face.ctx.globalCompositeOperation = 'source-over'
      t.face.ctx.globalAlpha = 1
      t.face.ctx.drawImage(t.face.pristine, 0, 0)
      t.face.ctx.restore()
      t.face.tex.needsUpdate = true
    }
    if (wallRef.current && scene?.backdrop) {
      loadImage(scene.backdrop).then((wallImg) => {
        const wall = wallRef.current
        if (!wall) return
        wall.ctx.save()
        wall.ctx.globalCompositeOperation = 'source-over'
        wall.ctx.globalAlpha = 1
        wall.ctx.drawImage(wallImg, 0, 0, wall.cw, wall.ch)
        wall.ctx.restore()
        wall.tex.needsUpdate = true
      }).catch(() => {})
    }
    shardsRef.current = []
    projsRef.current = []
    debrisRef.current = []
    statsRef.current = { hits: 0, shots: 0 }
    setShardVersion((v) => v + 1)
    setProjVersion((v) => v + 1)
    setTargetsVersion((v) => v + 1)
    report()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const fireWave = (x, y) => {
    const waves = wavesRef.current
    const wave = waves.find((wv) => !wv.active) || waves[0]
    wave.active = true
    wave.x = x
    wave.y = y
    wave.t = 0
  }

  const paintBackdropHole = (x, y, radius) => {
    const wall = wallRef.current
    const { w, h } = paneSizeRef.current
    if (!wall?.ctx || w <= 0) return
    const { px, py } = paneToCanvas(x, y, w, h, wall.cw, wall.ch)
    paintImpact(wall.ctx, px, py, radiusToCanvas(radius, w, wall.cw), 'glass')
    wall.tex.needsUpdate = true
  }

  const burst = ({ x, y, speed, target, detach = false, bullet = false }) => {
    const { power } = impactFromSpeed(speed)
    const boost = detach ? 1.5 : 1
    const baseCount = bullet ? 12 : 26

    const fresh = createShards({
      x: 0, y: 0,
      count: Math.round(baseCount * boost),
      material: 'glass',
      power: (bullet ? 0.55 : power) * boost,
      paneW: target ? target.w : 2,
      paneH: target ? target.h : 2,
    })
    translateShards(fresh, x, y)
    for (const s of fresh) {
      s.tex = target?.face?.pristineTex || null
    }
    shardsRef.current = [...shardsRef.current, ...fresh].slice(-MAX_SHARDS)
    setShardVersion((v) => v + 1)

    debrisRef.current = [
      ...debrisRef.current,
      ...createDebris({ x, y, count: Math.round(((bullet ? 10 : 18 + speed)) * boost), power: (bullet ? 0.6 : power) * boost }),
    ].slice(-MAX_DEBRIS)

    fireWave(x, y)
    // Small, fast-decaying kick — big shakes scatter rapid follow-up shots
    shakeRef.current = Math.min(0.4, (bullet ? 0.05 : 0.16) + speed * (bullet ? 0.002 : 0.01))
    flashState.current = { t: 1, x, y }
    if (!bullet) playSmashSound('glass', Math.min(1, speed / 15))
  }

  const pushProj = (proj) => {
    projsRef.current.push(proj)
    if (projsRef.current.length > MAX_PROJECTILES) projsRef.current.shift()
    statsRef.current.shots += 1
    setProjVersion((v) => v + 1)
    report()
  }

  const muzzleWorld = (kind) => {
    const holder = kind === 'gun' ? gunMuzzleRef : cannonMuzzleRef
    if (holder.current) {
      holder.current.getWorldPosition(_muzzle)
      return _muzzle.clone()
    }
    return new THREE.Vector3(mountRef.current.x, mountRef.current.y, mountRef.current.z)
  }

  const fireBullet = (point) => {
    const now = performance.now()
    if (now - lastGunRef.current < GUN_COOLDOWN_MS) return false
    lastGunRef.current = now
    const origin = muzzleWorld('gun')
    const dir = new THREE.Vector3(point.x - origin.x, point.y - origin.y, point.z - origin.z).normalize()
    pushProj({
      id: nextProjId.current++,
      kind: 'bullet',
      ...rayFromPoint(point),
      x: origin.x, y: origin.y, z: origin.z,
      vx: dir.x * BULLET_SPEED, vy: dir.y * BULLET_SPEED, vz: dir.z * BULLET_SPEED,
      life: 0,
      spent: false,
    })
    playGunshot(0.8)
    gunFlashRef.current.t = 1
    recoilPing.current += 1
    return true
  }

  const fireBall = (point) => {
    const now = performance.now()
    if (now - lastBallRef.current < BALL_COOLDOWN_MS) return false
    lastBallRef.current = now
    const origin = muzzleWorld('ball')
    const aim = { x: point.x, y: point.y, z: 0 }
    // Ballistic solve so the ball lands exactly on the cursor, even for
    // high targets — escalate speed until the shot is within range.
    let vel = null
    for (const speed of BALL_SPEEDS) {
      vel = solveBallisticVelocity(origin, aim, speed, BALL_GRAVITY)
      if (vel) break
    }
    if (!vel) {
      // Beyond range — hurl it flat and fast straight at the point
      const dir = new THREE.Vector3(point.x - origin.x, point.y - origin.y, point.z - origin.z).normalize()
      vel = { x: dir.x * 26, y: dir.y * 26, z: dir.z * 26 }
    }
    pushProj({
      id: nextProjId.current++,
      kind: 'ball',
      ...rayFromPoint({ x: point.x, y: point.y, z: 0 }),
      x: origin.x, y: origin.y, z: origin.z,
      vx: vel.x, vy: vel.y, vz: vel.z,
      spin: rand(6, 12),
      life: 0,
      spent: false,
      spentAt: Infinity,
    })
    return true
  }

  const fireWeapon = (point) => {
    updateAim(point)
    if (weaponRef.current === 'gun') fireBullet(point)
    else fireBall(point)
  }

  const damageTarget = (target, x, y, proj) => {
    const speed = Math.hypot(proj.vx, proj.vy, proj.vz)
    const isBullet = proj.kind === 'bullet'
    const radius = isBullet ? BULLET_RADIUS : impactFromSpeed(speed).radius
    const cx = target.x + target.ox
    const cy = target.y + target.oy
    // Hole in the card itself…
    const u = (x - cx) / target.w + 0.5
    const v = (y - cy) / target.h + 0.5
    paintImpact(
      target.face.ctx,
      u * target.face.cw,
      (1 - v) * target.face.ch,
      radiusToCanvas(radius, target.w, target.face.cw),
      'glass',
    )
    target.face.tex.needsUpdate = true
    // …and the matching hole in the wall behind, so chunks read as missing
    paintBackdropHole(x, y, radius)

    const dmg = isBullet ? BULLET_DAMAGE : Math.min(30, Math.max(12, 8 + speed * 1.1))
    target.hp -= dmg

    target.vx += proj.vx * (isBullet ? 0.004 : 0.045)
    target.vy += proj.vy * (isBullet ? 0.004 : 0.045) + (isBullet ? 0.05 : 0.5)
    target.vr += (x - cx) * (isBullet ? 0.3 : 1.6)

    statsRef.current.hits += 1
    if (target.hp <= 0 && !target.detached) {
      target.detached = true
      target.vy += 1.2
      target.vz = 2.2
      target.vr += rand(-4, 4)
      // Clear the card's whole silhouette off the wall — no ghost pixels.
      // Backdrop pixels never move, so clear at the REST position even
      // though the knocked card mesh is currently wobbled elsewhere.
      const wall = wallRef.current
      const { w, h } = paneSizeRef.current
      if (wall?.ctx && w > 0) {
        const topLeft = paneToCanvas(target.x - target.w / 2, target.y + target.h / 2, w, h, wall.cw, wall.ch)
        paintRectHole(
          wall.ctx,
          topLeft.px,
          topLeft.py,
          (target.w / w) * wall.cw,
          (target.h / h) * wall.ch,
        )
        wall.tex.needsUpdate = true
      }
      burst({ x, y, speed: speed + 4, target, detach: true, bullet: isBullet })
    } else {
      burst({ x, y, speed, target, bullet: isBullet })
      if (isBullet) playSmashSound('glass', 0.45)
    }
    report()
  }

  const findTargetAt = (x, y) => {
    const targets = targetsRef.current
    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i]
      if (t.detached || t.gone) continue
      const cx = t.x + t.ox
      const cy = t.y + t.oy
      if (Math.abs(x - cx) <= t.w / 2 + 0.08 && Math.abs(y - cy) <= t.h / 2 + 0.08) return t
    }
    return null
  }

  const onWallDown = (e) => {
    e.stopPropagation()
    updateAim(e.point)
    clickRef.current = { t: performance.now() }
    if (weaponRef.current === 'gun') {
      beginHold()
      fireWeapon(e.point)
    }
  }
  const onWallUp = (e) => {
    const down = clickRef.current
    clickRef.current = null
    endHold()
    if (weaponRef.current !== 'gun' && down && performance.now() - down.t < CLICK_FIRE_MS) {
      fireWeapon(e.point)
    }
  }
  const onWallMove = (e) => {
    updateAim(e.point)
  }

  useFrame((state, dtRaw) => {
    const dt = Math.min(0.05, Math.max(0, dtRaw))
    const { w, h } = paneSizeRef.current
    if (!ready || w === 0) return

    /* Hold-to-fire: past the tap delay the gun keeps spraying at the
     * live aim point. fireBullet's cooldown still rate-limits the stream. */
    if (shouldHoldRepeat(holdRef.current, performance.now(), weaponRef.current)) {
      fireWeapon(aimRef.current)
    }

    /* Projectiles */
    let projsChanged = false
    const kept = []
    for (const p of projsRef.current) {
      p.life += dt
      const isBullet = p.kind === 'bullet'
      if (!p.spent) {
        // Beam-ride the locked cursor ray: gentle arc entry for balls with
        // a terminal snap, full snap for bullets — impacts stay on-pixel.
        steerToRay(p, isBullet ? 100 : p.z < 1.2 ? 80 : 8, dt)
        p.vy -= (isBullet ? 0 : BALL_GRAVITY) * dt
        const prevX = p.x
        const prevY = p.y
        const prevZ = p.z
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.z += p.vz * dt
        if (prevZ > HIT_Z && p.z <= HIT_Z) {
          // Exact plane crossing — no up-to-a-frame of slop
          const alpha = (prevZ - HIT_Z) / (prevZ - p.z)
          const hx = prevX + (p.x - prevX) * alpha
          const hy = prevY + (p.y - prevY) * alpha
          const target = findTargetAt(hx, hy)
          if (target) {
            p.x = hx
            p.y = hy
            p.z = HIT_Z
            const cx = target.x + target.ox
            const cy = target.y + target.oy
            const clampedX = Math.max(cx - target.w / 2, Math.min(cx + target.w / 2, hx))
            const clampedY = Math.max(cy - target.h / 2, Math.min(cy + target.h / 2, hy))
            p.x = clampedX
            p.y = clampedY
            p.spent = true
            damageTarget(target, clampedX, clampedY, p)
            if (!isBullet) {
              p.spentAt = p.life
              p.vz *= -0.22
              p.vx *= 0.5
              p.vy = Math.abs(p.vy) * 0.3 + 1
            } else {
              projsChanged = true
              continue
            }
          }
          // Clean miss on blank backdrop — no paint, no sound, no count.
          // The projectile just keeps flying through like the earlier build.
        } else if (p.z < -4 || p.y < -h || p.life > 2.5) {
          if (isBullet) {
            projsChanged = true
            continue
          }
          p.spent = true
          p.spentAt = Math.min(p.spentAt, p.life)
        }
      } else {
        p.vy -= 9.5 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.z += p.vz * dt
      }
      if (isBullet) {
        kept.push(p)
      } else if (p.life - p.spentAt < 1.6 && p.y > -h - 4) {
        kept.push(p)
      } else {
        projsChanged = true
      }
    }
    if (kept.length !== projsRef.current.length) projsChanged = true
    if (projsChanged) {
      projsRef.current = kept
      setProjVersion((v) => v + 1)
    }

    /* Target wobble springs + detach falls */
    for (const t of targetsRef.current) {
      if (t.gone) continue
      if (t.detached) {
        t.vy -= 12 * dt
        t.ox += t.vx * dt
        t.oy += t.vy * dt
        t.oz += (t.vz || 0) * dt
        t.vz = (t.vz || 0) * (1 - 1.6 * dt)
        t.rot += t.vr * dt
        t.vr *= 1 - 0.4 * dt
        t.fade += dt
        if (t.fade > 1.5 || t.oy < -h) {
          t.gone = true
          setTargetsVersion((v) => v + 1)
        }
        continue
      }
      // Snappy spring back to rest (seamless with the wall when still)
      t.vx += (-90 * t.ox - 10 * t.vx) * dt
      t.vy += (-90 * t.oy - 10 * t.vy) * dt
      t.ox += t.vx * dt
      t.oy += t.vy * dt
      const off = Math.hypot(t.ox, t.oy)
      if (off > 0.6) {
        t.ox *= 0.6 / off
        t.oy *= 0.6 / off
      }
      t.vr += (-60 * t.rot - 8 * t.vr) * dt
      t.rot += t.vr * dt
      t.rot = Math.max(-0.35, Math.min(0.35, t.rot))
    }

    /* Shards + debris */
    const beforeShards = shardsRef.current.length
    shardsRef.current = stepShards(shardsRef.current, dt, { floorY: -h / 2 - 0.6 })
    if (shardsRef.current.length !== beforeShards) setShardVersion((v) => v + 1)
    debrisRef.current = stepDebris(debrisRef.current, dt, { floorY: -h / 2 - 0.4 })

    /* Impact flash */
    const flash = flashState.current
    if (flash.t > 0) {
      flash.t = Math.max(0, flash.t - dt * 3)
      if (flashRef.current) {
        flashRef.current.position.set(flash.x, flash.y, 0.8)
        flashRef.current.intensity = flash.t * 22
      }
    } else if (flashRef.current && flashRef.current.intensity !== 0) {
      flashRef.current.intensity = 0
    }

    /* Muzzle flash decay */
    if (gunFlashRef.current.t > 0) {
      gunFlashRef.current.t = Math.max(0, gunFlashRef.current.t - dt * 9)
    }

    /* Camera shake on the whole scene group */
    if (shakeRef.current > 0) {
      shakeRef.current = Math.max(0, shakeRef.current - dt * 1.8)
      const a = shakeRef.current * 0.45
      groupRef.current?.position.set(rand(-1, 1) * a, rand(-1, 1) * a, 0)
    } else {
      groupRef.current?.position.set(0, 0, 0)
    }

    void state
  })

  if (!ready) return null

  const { w, h } = paneSizeRef.current
  // Read versions so React re-renders when sets change
  void targetsVersion
  void projVersion
  void shardVersion

  return (
    <group ref={groupRef}>
      {/* Backdrop wall — the page itself */}
      {wallRef.current?.tex && (
        <mesh
          position={[0, 0, BACK_Z]}
          onPointerDown={onWallDown}
          onPointerUp={onWallUp}
          onPointerMove={onWallMove}
        >
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={wallRef.current.tex} />
        </mesh>
      )}

      {/* Breakable site cards */}
      {targetsRef.current.filter((t) => !t.gone).map((t) => (
        <TargetView key={t.id} target={t} />
      ))}

      {/* Fractured pieces (card pixels ride on s.tex when present) */}
      {shardsRef.current.map((s) => (
        <ShardView
          key={s.id}
          shard={s}
          texture={s.tex || targetsRef.current[0]?.face?.pristineTex}
        />
      ))}

      <DebrisCloud debrisRef={debrisRef} />
      <ShockRings wavesRef={wavesRef} />

      {/* Flying projectiles */}
      {projsRef.current.map((p) => (
        <ProjectileView key={p.id} proj={p} />
      ))}

      <GunMount
        mount={mountRef.current}
        aimRef={aimRef}
        flashRef={gunFlashRef}
        weapon={weapon}
        gunMuzzleRef={gunMuzzleRef}
        cannonMuzzleRef={cannonMuzzleRef}
        recoilPing={recoilPing}
      />

      <pointLight ref={flashRef} color="#fff2cc" intensity={0} distance={9} decay={2} />
    </group>
  )
}

export default SmashScene
