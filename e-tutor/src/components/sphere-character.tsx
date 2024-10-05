// SphereCharacter.tsx
import React, { useState, useEffect } from 'react';

interface SphereCharacterProps {
  size?: number;
  frequencies: Float32Array;
}

const SphereCharacter: React.FC<SphereCharacterProps> = ({
  size = 100,
  frequencies,
}) => {
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

  // Pupil sizes
  const pupilRadius = 10 * scale;

  // Mouth positions and sizes
  const mouthOffsetY = 40 * scale;
  const mouthWidth = 30 * scale;
  const minMouthHeight = 0.1; // Adjusted for more sensitivity
  const maxMouthHeight = 25 * scale; // Adjusted for more sensitivity

  // Calculate the maximum amplitude from frequencies
  const maxAmplitude =
    frequencies.length > 0
      ? frequencies.reduce((max, val) => Math.max(max, val), -Infinity)
      : 0;

  const normalizedAmplitude = Math.min(maxAmplitude / 1, 1);

  // Apply a smoothing factor to make the mouth movement more natural
  const smoothingFactor = 0.3; // Adjust between 0 (no smoothing) and 1 (max smoothing)
  const [smoothedAmplitude, setSmoothedAmplitude] = useState(0);

  useEffect(() => {
    setSmoothedAmplitude(
      (prev) =>
        prev * smoothingFactor + normalizedAmplitude * (1 - smoothingFactor)
    );
  }, [normalizedAmplitude]);

  // Calculate mouth height based on smoothed amplitude
  const mouthHeight =
    minMouthHeight + (maxMouthHeight - minMouthHeight) * smoothedAmplitude;

  return (
    <div className="w-fit h-fit flex justify-center items-center">
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
        <circle cx={leftEye.x} cy={leftEye.y} r={pupilRadius} fill="#000000" />
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
          cx={rightEye.x}
          cy={rightEye.y}
          r={pupilRadius}
          fill="#000000"
        />
        {/* Mouth */}
        <ellipse
          cx={headCenter.x}
          cy={headCenter.y + mouthOffsetY}
          rx={mouthWidth}
          ry={mouthHeight}
          fill="#000"
          stroke="#000"
          strokeWidth={1 * scale}
        />
      </svg>
    </div>
  );
};

export default SphereCharacter;
