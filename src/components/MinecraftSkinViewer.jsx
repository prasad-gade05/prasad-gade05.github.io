import { useEffect, useRef } from 'react';
import * as skinview3d from 'skinview3d';

const MinecraftSkinViewer = ({ skinUrl, width = 300, height = 400 }) => {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const jumpStateRef = useRef({ active: false, startTime: null });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create the skin viewer
    const viewer = new skinview3d.SkinViewer({
      canvas: canvasRef.current,
      width: width,
      height: height,
      skin: skinUrl,
    });

    // Set initial camera position for full body view
    viewer.camera.position.set(0, 0, 50);
    viewer.fov = 70;
    viewer.zoom = 0.6;

    // Enable controls for rotation
    viewer.controls.enableRotate = true;
    viewer.controls.enableZoom = true;
    viewer.controls.enablePan = false;

    // Base idle animation for breathing/slight movement
    const idle = new skinview3d.IdleAnimation();
    
    // Custom animation sequence
    const customAnimation = new skinview3d.FunctionAnimation((player, time, delta) => {
      // Update idle animation first for background movement
      idle.update(player, delta);
      
      // Handle Jump
      if (jumpStateRef.current.active) {
        if (jumpStateRef.current.startTime === null) {
          jumpStateRef.current.startTime = time;
        }
        
        const jumpDuration = 1.0;
        const jumpTime = time - jumpStateRef.current.startTime;
        
        if (jumpTime < jumpDuration) {
          // Jump animation
          const jumpProgress = jumpTime / jumpDuration;
          
          // Parabolic jump height
          player.position.y = Math.sin(jumpProgress * Math.PI) * 10;
          
          // Leg movement for jump - outwards (jumping jack style)
          player.skin.leftLeg.rotation.z = Math.sin(jumpProgress * Math.PI) * 0.5;
          player.skin.rightLeg.rotation.z = -Math.sin(jumpProgress * Math.PI) * 0.5;
          
          // Arm movement for jump - outwards (jumping jack style)
          player.skin.leftArm.rotation.z = Math.sin(jumpProgress * Math.PI) * 2.0;
          player.skin.rightArm.rotation.z = -Math.sin(jumpProgress * Math.PI) * 2.0;
          
          return; // Skip wave animation while jumping
        } else {
          // Reset after jump
          jumpStateRef.current.active = false;
          jumpStateRef.current.startTime = null;
          player.position.y = 0;
        }
      }
      
      // Wave Animation based on rotation (wave when facing viewer)
      if (player.parent) {
        const rotY = player.parent.rotation.y;
        let normalizedRot = rotY % (2 * Math.PI);
        // Normalize to 0..2PI
        if (normalizedRot < 0) normalizedRot += 2 * Math.PI;
        // Shift to -PI..PI (0 is front)
        if (normalizedRot > Math.PI) normalizedRot -= 2 * Math.PI;
        
        // Define wave window (radians) - approx +/- 30 degrees
        const waveWindow = 0.5; 
        
        if (Math.abs(normalizedRot) < waveWindow) {
            // Map rotation to progress 0..1
            // Rotation increases: -0.5 -> 0 -> 0.5
            const progress = (normalizedRot + waveWindow) / (2 * waveWindow);
            
            let armZ = 0;
            let armX = 0;
            
            if (progress < 0.2) {
                // Raising arm
                const p = progress / 0.2;
                armZ = -Math.PI * 0.7 * p; 
            } else if (progress < 0.8) {
                // Waving hand
                const p = (progress - 0.2) / 0.6;
                armZ = -Math.PI * 0.7 + Math.sin(p * Math.PI * 4) * 0.2; 
                armX = Math.sin(p * Math.PI * 4) * 0.1;
            } else {
                // Lowering arm
                const p = (progress - 0.8) / 0.2;
                armZ = -Math.PI * 0.7 * (1 - p);
            }
            
            player.skin.rightArm.rotation.z = armZ;
            player.skin.rightArm.rotation.x = armX;
        } else {
            player.skin.rightArm.rotation.z = 0;
            player.skin.rightArm.rotation.x = 0;
        }
      }
    });
    
    viewer.animation = customAnimation;

    // Auto-rotate when not interacting
    viewer.autoRotate = true;
    viewer.autoRotateSpeed = 0.5;

    viewerRef.current = viewer;

    return () => {
      viewer.dispose();
    };
  }, [skinUrl, width, height]);

  const handleJump = () => {
    if (jumpStateRef.current && !jumpStateRef.current.active) {
      jumpStateRef.current.active = true;
      jumpStateRef.current.startTime = null;
    }
  };

  return (
    <div style={{ position: 'relative', width: width, height: height }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          borderRadius: '8px',
          cursor: 'grab',
        }}
      />
      <button
        onClick={handleJump}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s',
          zIndex: 10,
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
      >
        Jump!
      </button>
    </div>
  );
};

export default MinecraftSkinViewer;
