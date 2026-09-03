import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ClothSimulation } from './clothPhysics'

const SEGMENTS = 30
const SNAP_DISTANCE = 0.35

// Pre-allocated reusable objects — eliminates per-frame/per-event GC pressure
const _dragTarget = new THREE.Vector3()
const _planeNormal = new THREE.Vector3(0, 0, 1)

// Fast vertex normal computation using flat array ops (no THREE.Vector3 allocations)
function computeNormalsFast(index, posArr, normalArr) {
  normalArr.fill(0)

  for (let i = 0; i < index.length; i += 3) {
    const a = index[i] * 3
    const b = index[i + 1] * 3
    const c = index[i + 2] * 3

    const abx = posArr[b] - posArr[a]
    const aby = posArr[b + 1] - posArr[a + 1]
    const abz = posArr[b + 2] - posArr[a + 2]
    const acx = posArr[c] - posArr[a]
    const acy = posArr[c + 1] - posArr[a + 1]
    const acz = posArr[c + 2] - posArr[a + 2]

    const nx = aby * acz - abz * acy
    const ny = abz * acx - abx * acz
    const nz = abx * acy - aby * acx

    normalArr[a] += nx; normalArr[a + 1] += ny; normalArr[a + 2] += nz
    normalArr[b] += nx; normalArr[b + 1] += ny; normalArr[b + 2] += nz
    normalArr[c] += nx; normalArr[c + 1] += ny; normalArr[c + 2] += nz
  }

  for (let i = 0; i < normalArr.length; i += 3) {
    const x = normalArr[i], y = normalArr[i + 1], z = normalArr[i + 2]
    const len = Math.sqrt(x * x + y * y + z * z)
    if (len > 0) {
      const inv = 1 / len
      normalArr[i] *= inv
      normalArr[i + 1] *= inv
      normalArr[i + 2] *= inv
    }
  }
}

// Glowing board-pin — emissive red sphere with pulsing point light
// `waiting` variant pulses faster/brighter to indicate it's waiting to catch tissue
const BoardPin = ({ position, onClick, waiting = false }) => {
  const lightRef = useRef()

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const speed = waiting ? 5 : 3
      const base = waiting ? 0.8 : 0.6
      const amp = waiting ? 0.4 : 0.3
      lightRef.current.intensity = base + Math.sin(clock.elapsedTime * speed) * amp
    }
  })

  // Stop pointer-down here so tapping a pin never starts a paper drag underneath.
  // Critical on touch where the finger easily covers both pin and paper.
  const stopDown = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onClick()
  }, [onClick])

  return (
    <group position={position}>
      <pointLight ref={lightRef} color="#ff4444" intensity={0.6} distance={1.5} decay={2} />
      {/* Visible pin head */}
      <mesh
        position={[0, 0, 0.08]}
        onClick={handleClick}
        onPointerDown={stopDown}
      >
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial
          color="#e74c3c"
          emissive="#ff2222"
          emissiveIntensity={waiting ? 1.2 : 0.8}
          metalness={0.3}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
      {/* Larger invisible hit area — fat-finger friendly on mobile */}
      <mesh
        position={[0, 0, 0.08]}
        onClick={handleClick}
        onPointerDown={stopDown}
      >
        <sphereGeometry args={[0.28, 8, 6]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <ringGeometry args={[0.1, waiting ? 0.28 : 0.22, 12]} />
        <meshBasicMaterial
          color="#ff4444"
          transparent
          opacity={waiting ? 0.35 : 0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.008, 0.06, 6]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// Invisible background plane that catches clicks in pin mode for canvas pin placement
const CanvasClickPlane = ({ isPinMode, onCanvasClick }) => {
  const { viewport } = useThree()

  const handlePointerDown = useCallback((e) => {
    if (!isPinMode) return
    e.stopPropagation()
    onCanvasClick(e.point)
  }, [isPinMode, onCanvasClick])

  return (
    <mesh position={[0, 0, -0.2]} onPointerDown={handlePointerDown}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

const TissuePaper = ({ textureUrl, isPinMode, onPinUsed, onPinReturned, resetKey }) => {
  const meshRef = useRef()
  const { viewport, camera, gl } = useThree()
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    if (!textureUrl) return
    const img = new Image()
    img.onload = () => {
      const tex = new THREE.Texture(img)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.needsUpdate = true
      setTexture(tex)
    }
    img.src = textureUrl
  }, [textureUrl])

  const initialSize = useRef({ w: viewport.width, h: viewport.height })

  const cloth = useMemo(() => {
    return new ClothSimulation(initialSize.current.w, initialSize.current.h, SEGMENTS, SEGMENTS)
  }, [])

  // Board pins: particle indices pinned directly on the tissue
  const [boardPins, setBoardPins] = useState([])
  // World pins: placed on the canvas, waiting for tissue to come near
  const [worldPins, setWorldPins] = useState([])
  const nextPinId = useRef(0)

  // No initial pin — all 4 start free
  useEffect(() => {
    cloth.reset()
    setBoardPins([])
    setWorldPins([])
    nextPinId.current = 0
  }, [cloth, resetKey])

  const dragState = useRef({
    isDragging: false,
    particleIndex: -1,
    activePointerId: null,
    dragPlane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
  })
  const mouseNDC = useRef(new THREE.Vector2())
  const raycasterRef = useRef(new THREE.Raycaster())
  const boardPinsRef = useRef(new Set())
  const worldPinsRef = useRef([])

  useEffect(() => {
    boardPinsRef.current = new Set(boardPins)
  }, [boardPins])

  useEffect(() => {
    worldPinsRef.current = worldPins
  }, [worldPins])

  // Sync NDC from a client (x, y) pair. Shared by pointerdown + pointermove
  // so touch (which has no prior hover) starts dragging at the finger, not center.
  const updateNDCFromClient = useCallback((clientX, clientY) => {
    if (clientX == null || clientY == null) return false
    const rect = gl.domElement.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return false
    mouseNDC.current.x = ((clientX - rect.left) / rect.width) * 2 - 1
    mouseNDC.current.y = -((clientY - rect.top) / rect.height) * 2 + 1
    return true
  }, [gl])

  const endDrag = useCallback(() => {
    if (dragState.current.isDragging) {
      const idx = dragState.current.particleIndex
      if (idx >= 0 && !boardPinsRef.current.has(idx)) {
        cloth.unpin(idx)
      }
      dragState.current.isDragging = false
      dragState.current.particleIndex = -1
      dragState.current.activePointerId = null
    }
  }, [cloth])

  useEffect(() => {
    const domElement = gl.domElement

    const onPointerMove = (e) => {
      // Multi-touch guard: only the pointer that started the drag drives it
      if (dragState.current.isDragging) {
        const active = dragState.current.activePointerId
        if (active != null && e.pointerId != null && e.pointerId !== active) return
      }
      if (e.clientX == null || e.clientY == null) return
      const rect = domElement.getBoundingClientRect()
      if (!rect || rect.width === 0 || rect.height === 0) return
      mouseNDC.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseNDC.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    const onPointerEnd = (e) => {
      // Ignore other fingers lifting during a multi-touch drag
      if (e && e.pointerId != null && dragState.current.activePointerId != null &&
          e.pointerId !== dragState.current.activePointerId) return
      endDrag()
    }

    domElement.addEventListener('pointermove', onPointerMove)
    // Window-level listeners catch moves/ups outside the canvas and on touch
    // where the browser may retarget events. pointercancel is what fires when
    // the browser steals a touch gesture — without it the particle stays pinned.
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerEnd)
    window.addEventListener('pointercancel', onPointerEnd)

    return () => {
      domElement.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerEnd)
      window.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [gl, endDrag])

  // Tissue mesh click — pin directly on tissue OR start drag
  const onPointerDown = useCallback((e) => {
    e.stopPropagation()

    const intersect = e.intersections?.[0]
    if (!intersect) return

    const point = intersect.point
    const nearestIdx = cloth.findNearest(point.x, point.y, point.z)
    if (nearestIdx < 0) return

    if (isPinMode) {
      cloth.pin(nearestIdx)
      setBoardPins(prev => [...prev, nearestIdx])
      onPinUsed?.()
      return
    }

    if (boardPinsRef.current.has(nearestIdx)) return

    // Touch has no hover: seed NDC from this event or the drag plane raycast
    // in useFrame starts from stale (0,0) and the paper snaps away from the finger.
    const clientX = e.clientX ?? e.nativeEvent?.clientX
    const clientY = e.clientY ?? e.nativeEvent?.clientY
    updateNDCFromClient(clientX, clientY)

    const pointerId = e.pointerId ?? e.nativeEvent?.pointerId ?? null

    dragState.current.isDragging = true
    dragState.current.particleIndex = nearestIdx
    dragState.current.activePointerId = pointerId
    cloth.pin(nearestIdx)

    // Capture this pointer so moves keep flowing even if the finger drifts
    // off the mesh (common on small screens).
    try {
      const captureTarget = e.target?.setPointerCapture ? e.target : gl.domElement
      if (pointerId != null && captureTarget?.setPointerCapture) {
        captureTarget.setPointerCapture(pointerId)
      }
    } catch {
      // setPointerCapture can throw for mouse or in test envs — drag still works
    }

    const normal = _planeNormal
    dragState.current.dragPlane.setFromNormalAndCoplanarPoint(normal, point)
  }, [cloth, isPinMode, onPinUsed, updateNDCFromClient, gl])

  // Canvas click — place a world pin (waiting for tissue)
  const onCanvasClick = useCallback((point) => {
    const id = nextPinId.current++
    setWorldPins(prev => [...prev, { id, position: [point.x, point.y, point.z] }])
    onPinUsed?.()
  }, [onPinUsed])

  // Mesh-level release as a safety net in case window listeners miss the event
  // (e.g. pointer capture retargeting on touch). Matches active pointer only.
  const onPointerUp = useCallback((e) => {
    const pointerId = e?.pointerId ?? e?.nativeEvent?.pointerId
    if (pointerId != null && dragState.current.activePointerId != null &&
        pointerId !== dragState.current.activePointerId) return
    try {
      if (pointerId != null && e?.target?.releasePointerCapture) {
        if (e.target.hasPointerCapture?.(pointerId)) {
          e.target.releasePointerCapture(pointerId)
        }
      }
    } catch {
      // ignore — release is best-effort
    }
    endDrag()
  }, [endDrag])

  const handleRemovePin = useCallback((particleIdx) => {
    cloth.unpin(particleIdx)
    setBoardPins(prev => prev.filter(i => i !== particleIdx))
    onPinReturned?.()
  }, [cloth, onPinReturned])

  const handleRemoveWorldPin = useCallback((pinId) => {
    setWorldPins(prev => prev.filter(wp => wp.id !== pinId))
    onPinReturned?.()
  }, [onPinReturned])

  useFrame(() => {
    if (!meshRef.current) return

    if (dragState.current.isDragging && dragState.current.particleIndex >= 0) {
      raycasterRef.current.setFromCamera(mouseNDC.current, camera)
      const hit = raycasterRef.current.ray.intersectPlane(dragState.current.dragPlane, _dragTarget)
      if (hit) {
        cloth.setPosition(dragState.current.particleIndex, _dragTarget.x, _dragTarget.y, _dragTarget.z)
      }
    }

    cloth.update()

    // World pin proximity — snap tissue particles to waiting pins
    const currentWorldPins = worldPinsRef.current
    if (currentWorldPins.length > 0) {
      const caughtIds = []
      const newBoardPins = []

      for (const wp of currentWorldPins) {
        const nearIdx = cloth.findNearest(wp.position[0], wp.position[1], wp.position[2])
        if (nearIdx < 0 || cloth.pinned[nearIdx]) continue

        const pi = nearIdx * 3
        const dx = cloth.positions[pi] - wp.position[0]
        const dy = cloth.positions[pi + 1] - wp.position[1]
        const dz = cloth.positions[pi + 2] - wp.position[2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < SNAP_DISTANCE) {
          // Snap particle to pin position, zero velocity, pin it
          /* eslint-disable react-hooks/immutability -- Physics engine requires direct mutation of typed arrays */
          cloth.positions[pi] = wp.position[0]
          cloth.positions[pi + 1] = wp.position[1]
          cloth.positions[pi + 2] = wp.position[2]
          cloth.prevPositions[pi] = wp.position[0]
          cloth.prevPositions[pi + 1] = wp.position[1]
          cloth.prevPositions[pi + 2] = wp.position[2]
          /* eslint-enable react-hooks/immutability */
          cloth.pin(nearIdx)

          caughtIds.push(wp.id)
          newBoardPins.push(nearIdx)
          // Immediately update ref to prevent race with pointerUp
          boardPinsRef.current.add(nearIdx)
        }
      }

      if (caughtIds.length > 0) {
        setWorldPins(prev => prev.filter(wp => !caughtIds.includes(wp.id)))
        setBoardPins(prev => [...prev, ...newBoardPins])
      }
    }

    const geo = meshRef.current.geometry
    const posAttr = geo.attributes.position
    posAttr.array.set(cloth.positions)
    posAttr.needsUpdate = true

    computeNormalsFast(geo.index.array, posAttr.array, geo.attributes.normal.array)
    geo.attributes.normal.needsUpdate = true
  })

  const getPinPos = (pIdx) => {
    const idx = pIdx * 3
    return [cloth.positions[idx], cloth.positions[idx + 1], cloth.positions[idx + 2]]
  }

  if (!texture) return null

  return (
    <group>
      <CanvasClickPlane isPinMode={isPinMode} onCanvasClick={onCanvasClick} />

      <mesh
        ref={meshRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <planeGeometry args={[initialSize.current.w, initialSize.current.h, SEGMENTS, SEGMENTS]} />
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          roughness={0.7}
          metalness={0}
        />
      </mesh>

      {/* Board pins on tissue */}
      {boardPins.map((pIdx) => (
        <BoardPin
          key={`bp-${pIdx}`}
          position={getPinPos(pIdx)}
          onClick={() => handleRemovePin(pIdx)}
        />
      ))}

      {/* World pins on canvas (waiting for tissue) */}
      {worldPins.map((wp) => (
        <BoardPin
          key={`wp-${wp.id}`}
          position={wp.position}
          onClick={() => handleRemoveWorldPin(wp.id)}
          waiting
        />
      ))}
    </group>
  )
}

export default TissuePaper
