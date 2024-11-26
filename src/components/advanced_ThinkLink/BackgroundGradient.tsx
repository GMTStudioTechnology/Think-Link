import React from 'react';

export const BackgroundGradient: React.FC = () => {
  // Replace animated gradient with static gradient
  const gradientStyle = {
    position: 'absolute' as const,
    top: '-50%',
    left: '-50%',
    right: '-50%',
    bottom: '-50%',
    background: 'radial-gradient(circle at 50% 50%, #184e77 0%, #34a0a4 50%, #d9ed92 100%)',
    transform: 'scale(1.5)',
    filter: 'blur(120px)',
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Static gradient layer */}
      <div style={gradientStyle} />

      {/* Static decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-[#184e77]/[0.15] rounded-full filter blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 bg-[#bfd200]/[0.15] rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-1/3 h-1/3 bg-[#168aad]/[0.15] rounded-full filter blur-[120px]" />
      </div>

      {/* Static highlights */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40">
        <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-[#184e77]/[0.1] rounded-full filter blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-1/4 h-1/4 bg-[#168aad]/[0.1] rounded-full filter blur-[100px]" />
      </div>
    </div>
  );
};


