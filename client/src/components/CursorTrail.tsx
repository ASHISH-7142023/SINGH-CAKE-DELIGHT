import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export function CursorTrail() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const idCounter = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Spawn a cake particle if moved more than 40px
      if (distance > 40) {
        idCounter.current += 1;
        const newParticle: Particle = {
          id: idCounter.current,
          x: clientX,
          y: clientY,
          size: Math.random() * (24 - 14) + 14, // Random size between 14px and 24px
          rotation: Math.random() * 360,
        };
        setParticles((prev) => [...prev.slice(-25), newParticle]); // keep max 25 particles
        lastPos.current = { x: clientX, y: clientY };
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Spawn a mini burst of 3 particles on click
      const newParticles: Particle[] = Array.from({ length: 3 }).map((_, i) => {
        idCounter.current += 1;
        return {
          id: idCounter.current,
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          size: Math.random() * (26 - 16) + 16,
          rotation: Math.random() * 360,
        };
      });
      setParticles((prev) => [...prev.slice(-25), ...newParticles]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const handleAnimationEnd = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.img
            key={p.id}
            src="/cursor_cake.png"
            alt=""
            initial={{ y: p.y - p.size / 2, opacity: 1, scale: 0.8, rotate: p.rotation }}
            animate={{ 
              y: -p.size, // Animates to the very top (off-screen cleanly)
              opacity: 0, 
              scale: 0.3, 
              rotate: p.rotation + 90 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 3.6, 
              ease: [0.215, 0.610, 0.355, 1.000] // smooth easeOutCubic
            }}
            onAnimationComplete={() => handleAnimationEnd(p.id)}
            className="absolute origin-center"
            style={{
              left: p.x - p.size / 2,
              top: 0,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
