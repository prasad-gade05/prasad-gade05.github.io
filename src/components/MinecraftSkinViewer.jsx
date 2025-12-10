import { useEffect, useRef } from 'react';
import * as skinview3d from 'skinview3d';

const MinecraftSkinViewer = ({ skinUrl, width = 300, height = 400 }) => {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);

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
    viewer.zoom = 0.9;

    // Enable controls for rotation
    viewer.controls.enableRotate = true;
    viewer.controls.enableZoom = true;
    viewer.controls.enablePan = false;

    // Add idle animation
    viewer.animation = new skinview3d.IdleAnimation();
    viewer.animation.speed = 0.5;

    // Auto-rotate when not interacting
    viewer.autoRotate = true;
    viewer.autoRotateSpeed = 0.5;

    viewerRef.current = viewer;

    return () => {
      viewer.dispose();
    };
  }, [skinUrl, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        borderRadius: '8px',
        cursor: 'grab',
      }}
    />
  );
};

export default MinecraftSkinViewer;
