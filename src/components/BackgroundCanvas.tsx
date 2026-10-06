import React, { useEffect, useRef } from 'react';

interface Starlight {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  alphaSpeed: number;
}

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle drifting starlight micro-particles
    const count = 38;
    const stars: Starlight[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size: Math.random() * 1.4 + 0.6,
        alpha: Math.random() * 0.35 + 0.1,
        alphaSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render micro starlight
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        s.alpha += s.alphaSpeed;

        if (s.alpha > 0.45) { s.alpha = 0.45; s.alphaSpeed *= -1; }
        if (s.alpha < 0.08) { s.alpha = 0.08; s.alphaSpeed *= -1; }

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#070709] select-none">
      {/* 1. Exact 50px Grid pattern with Gaussian Vignette Mask matching pacomepertant */}
      <svg
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        viewBox="0 0 1920 1200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g clipPath="url(#clip0_grid)">
          <rect width="1920" height="1200" fill="url(#pattern_grid_50)" fillOpacity="0.14" />
          <g filter="url(#filter_vignette)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2442 1526H-522V-326H2442V1526ZM960 14C453 14 42 276.5 42 600.5C42 924.5 453 1187 960 1187C1467 1187 1878 924.5 1878 600.5C1878 276.5 1467 14 960 14Z"
              fill="#070709"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter_vignette"
            x="-1022"
            y="-826"
            width="3964"
            height="2852"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="240" />
          </filter>
          <clipPath id="clip0_grid">
            <rect width="1920" height="1200" fill="white" />
          </clipPath>
          <pattern
            id="pattern_grid_50"
            patternUnits="userSpaceOnUse"
            patternTransform="matrix(50 0 0 50 934.75 574.75)"
            preserveAspectRatio="none"
            viewBox="-0.5 -0.5 100 100"
            width="1"
            height="1"
          >
            <rect width="100" height="100" stroke="white" strokeWidth="0.8" fill="none" opacity="0.75" />
          </pattern>
        </defs>
      </svg>

      {/* 2. Atmospheric multi-point breathing radial auras */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[450px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 3. Kinetic micro starlight particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />
    </div>
  );
};
