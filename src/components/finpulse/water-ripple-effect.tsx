
'use client';

import * as React from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function WaterRippleEffect() {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const createRipple = (event: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    let x, y;
    if ('touches' in event) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);
  };

  const handlePointerMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      createRipple(event);
    }, 100); // Throttle ripple creation
  };

  const handleAnimationEnd = (id: number) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  };
  
  React.useEffect(() => {
    return () => {
        if(timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden z-10"
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
    >
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
          }}
          onAnimationEnd={() => handleAnimationEnd(ripple.id)}
        />
      ))}
    </div>
  );
}
