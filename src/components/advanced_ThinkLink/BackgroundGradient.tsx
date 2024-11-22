import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';

export const BackgroundGradient: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Base gradient animation with original colors
  const gradientProps = useSpring({
    from: {
      background: 'radial-gradient(circle at 50% 50%, #184e77 0%, #34a0a4 50%, #d9ed92 100%)',
      transform: 'scale(1.5) rotate(0deg)',
    },
    to: {
      background: 'radial-gradient(circle at 50% 50%, #184e77 0%, #34a0a4 50%, #d9ed92 100%)',
      transform: 'scale(1.5) rotate(360deg)',
    },
    config: {
      duration: 100000,
    },
    loop: false,
  });

  // Interactive blob
  const blobProps = useSpring({
    transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px) scale(1.1)`,
    config: {
      mass: 1,
      tension: 120,
      friction: 14,
    },
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient layer */}
      <animated.div
        style={{
          ...gradientProps,
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          right: '-50%',
          bottom: '-50%',
          filter: 'blur(120px)',
        }}
      />

      {/* Interactive blob layer */}
      <animated.div
        style={{
          ...blobProps,
          position: 'absolute',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle at center, rgba(255, 107, 107, 0.15), rgba(78, 205, 196, 0.12), transparent)',
          borderRadius: '50%',
          filter: 'blur(90px)',
          transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)`,
        }}
      />

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-[#184e77]/[0.15] rounded-full filter blur-[120px] animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 bg-[#bfd200]/[0.15] rounded-full filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-1/3 h-1/3 bg-[#168aad]/[0.15] rounded-full filter blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* Subtle highlights */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40">
        <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-[#184e77]/[0.1] rounded-full filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-1/4 h-1/4 bg-[#168aad]/[0.1] rounded-full filter blur-[100px] animate-pulse delay-1000" />
      </div>
    </div>
  );
};


