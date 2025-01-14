import React, { useEffect, useRef } from 'react';

const ElectricityEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouse = { x: 0, y: 0 };
    let sparks = [];

    const createSpark = (x, y) => {
      for (let i = 0; i < 5; i++) {
        sparks.push({
          x,
          y,
          vx: Math.random() * 4 - 2,
          vy: Math.random() * 4 - 2,
          life: Math.random() * 20 + 10
        });
      }
    };

    const animateSparks = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparks.forEach((spark, index) => {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life--;

        if (spark.life <= 0) {
          sparks.splice(index, 1);
          return;
        }

        const gradient = ctx.createRadialGradient(spark.x, spark.y, 0, spark.x, spark.y, 5);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      requestAnimationFrame(animateSparks);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      createSpark(mouse.x, mouse.y);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    animateSparks();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-none" />;
};

export default ElectricityEffect;

