import { useMemo, type CSSProperties } from "react";

interface SakuraRainProps {
  celebrate?: boolean;
}

interface AmbientPetal {
  id: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
  opacity: number;
}

interface SidePetal {
  id: string;
  side: "left" | "right";
  startY: number;
  size: number;
  duration: number;
  delay: number;
  distanceX: number;
  distanceY: number;
  rotation: number;
  opacity: number;
}

type AmbientPetalStyle = CSSProperties & {
  "--petal-left": string;
  "--petal-size": string;
  "--petal-duration": string;
  "--petal-delay": string;
  "--petal-drift": string;
  "--petal-rotation": string;
  "--petal-opacity": number;
};

type SidePetalStyle = CSSProperties & {
  "--side-start-y": string;
  "--side-size": string;
  "--side-duration": string;
  "--side-delay": string;
  "--side-distance-x": string;
  "--side-distance-y": string;
  "--side-rotation": string;
  "--side-opacity": number;
};

function createAmbientPetal(index: number): AmbientPetal {
  return {
    id: `ambient-${index}`,
    left: Math.random() * 100,
    size: 10 + Math.random() * 15,
    duration: 8 + Math.random() * 10,
    delay: Math.random() * -18,
    drift: -100 + Math.random() * 200,
    rotation: 260 + Math.random() * 600,
    opacity: 0.45 + Math.random() * 0.5,
  };
}

function createSidePetal(index: number, side: "left" | "right"): SidePetal {
  return {
    id: `${side}-${index}`,
    side,
    startY: 5 + Math.random() * 86,
    size: 11 + Math.random() * 20,
    duration: 2.8 + Math.random() * 3.2,
    delay: Math.random() * 2.8,
    distanceX: 45 + Math.random() * 60,
    distanceY: -180 + Math.random() * 360,
    rotation: 360 + Math.random() * 900,
    opacity: 0.55 + Math.random() * 0.45,
  };
}

export default function SakuraRain({ celebrate = false }: SakuraRainProps) {
  const ambientPetals = useMemo(
    () => Array.from({ length: 42 }, (_, index) => createAmbientPetal(index)),
    [],
  );

  const sidePetals = useMemo(() => {
    if (!celebrate) {
      return [];
    }

    const leftPetals = Array.from({ length: 45 }, (_, index) =>
      createSidePetal(index, "left"),
    );

    const rightPetals = Array.from({ length: 45 }, (_, index) =>
      createSidePetal(index, "right"),
    );

    return [...leftPetals, ...rightPetals];
  }, [celebrate]);

  return (
    <div className="sakura-rain" aria-hidden="true">
      {ambientPetals.map((petal) => {
        const style: AmbientPetalStyle = {
          "--petal-left": `${petal.left}%`,
          "--petal-size": `${petal.size}px`,
          "--petal-duration": `${petal.duration}s`,
          "--petal-delay": `${petal.delay}s`,
          "--petal-drift": `${petal.drift}px`,
          "--petal-rotation": `${petal.rotation}deg`,
          "--petal-opacity": petal.opacity,
        };

        return (
          <span
            key={petal.id}
            className="sakura-petal sakura-petal--ambient"
            style={style}
          />
        );
      })}

      {sidePetals.map((petal) => {
        const style: SidePetalStyle = {
          "--side-start-y": `${petal.startY}%`,
          "--side-size": `${petal.size}px`,
          "--side-duration": `${petal.duration}s`,
          "--side-delay": `${petal.delay}s`,
          "--side-distance-x": `${petal.distanceX}vw`,
          "--side-distance-y": `${petal.distanceY}px`,
          "--side-rotation": `${petal.rotation}deg`,
          "--side-opacity": petal.opacity,
        };

        return (
          <span
            key={petal.id}
            className={`sakura-petal sakura-petal--side sakura-petal--${petal.side}`}
            style={style}
          />
        );
      })}
    </div>
  );
}
