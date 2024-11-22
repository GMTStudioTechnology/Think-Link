import React from 'react';
import { useSpring, animated } from 'react-spring';

export const BackgroundGradient: React.FC = () => {
  const props = useSpring({
    from: { background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' },
    to: { background: 'linear-gradient(45deg, #4ecdc4, #ff6b6b)' },
    config: { duration: 5000 },
    loop: true,
  });

  return (
    <animated.div
      style={{
        ...props,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.5,
      }}
    />
  );
}; 