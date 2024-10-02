// SphereCharacter.tsx
import React, { useState, useRef, useEffect } from 'react';

interface SphereCharacterProps {
  size?: number;
}

const SphereCharacter: React.FC<SphereCharacterProps> = ({ size = 100 }) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [divPos, setDivPos] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const updateDivPos = () => {
      if (divRef.current) {
        const rect = divRef.current.getBoundingClientRect();
        setDivPos({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Update position on mount and when the window is resized
    updateDivPos();
    window.addEventListener('resize', updateDivPos);

    return () => {
      window.removeEventListener('resize', updateDivPos);
    };
  }, []);

  const adjustedMouseX = mousePos.x - divPos.x;
  const adjustedMouseY = mousePos.y - divPos.y;

  // Scaling factors based on size
  const scale = size / 200; // 200 is the default size
  const headRadius = 80 * scale;
  const headCenter = { x: size / 2, y: size / 2 };

  // Eyes positions and sizes
  const eyeOffsetX = 30 * scale;
  const eyeOffsetY = 20 * scale;
  const eyeRadius = 20 * scale;

  const leftEye = {
    x: headCenter.x - eyeOffsetX,
    y: headCenter.y - eyeOffsetY,
  };
  const rightEye = {
    x: headCenter.x + eyeOffsetX,
    y: headCenter.y - eyeOffsetY,
  };

  // Pupil sizes and movement radius
  const pupilRadius = 10 * scale;
  const pupilMoveRadius = 8 * scale;

  const leftPupil = calculatePupilPosition(
    leftEye.x,
    leftEye.y,
    adjustedMouseX,
    adjustedMouseY,
    pupilMoveRadius
  );
  const rightPupil = calculatePupilPosition(
    rightEye.x,
    rightEye.y,
    adjustedMouseX,
    adjustedMouseY,
    pupilMoveRadius
  );

  return (
    <div className="w-fit h-fit flex justify-center items-center" ref={divRef}>
      <svg width={size} height={size}>
        {/* Head */}
        <circle
          cx={headCenter.x}
          cy={headCenter.y}
          r={headRadius}
          fill="#FDD835"
          stroke="#000"
          strokeWidth={2 * scale}
        />
        {/* Left Eye */}
        <circle
          cx={leftEye.x}
          cy={leftEye.y}
          r={eyeRadius}
          fill="#FFFFFF"
          stroke="#000"
          strokeWidth={1 * scale}
        />
        {/* Left Pupil */}
        <circle
          cx={leftPupil.x}
          cy={leftPupil.y}
          r={pupilRadius}
          fill="#000000"
        />
        {/* Right Eye */}
        <circle
          cx={rightEye.x}
          cy={rightEye.y}
          r={eyeRadius}
          fill="#FFFFFF"
          stroke="#000"
          strokeWidth={1 * scale}
        />
        {/* Right Pupil */}
        <circle
          cx={rightPupil.x}
          cy={rightPupil.y}
          r={pupilRadius}
          fill="#000000"
        />
      </svg>
    </div>
  );
};

const calculatePupilPosition = (
  eyeX: number,
  eyeY: number,
  mouseX: number,
  mouseY: number,
  pupilMoveRadius: number
): { x: number; y: number } => {
  const dx = mouseX - eyeX;
  const dy = mouseY - eyeY;
  const angle = Math.atan2(dy, dx);

  const distance = Math.min(pupilMoveRadius, Math.hypot(dx, dy));

  const pupilX = eyeX + distance * Math.cos(angle);
  const pupilY = eyeY + distance * Math.sin(angle);

  return { x: pupilX, y: pupilY };
};

export default SphereCharacter;
