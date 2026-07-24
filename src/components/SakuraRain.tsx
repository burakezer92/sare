import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

interface SakuraRainProps {
  celebrate?: boolean;
}

type TargetKind = "surface" | "text" | "page-end";
type PreferredTarget = "surface" | "text";

interface SurfaceTarget {
  id: string;
  element: HTMLElement;
  kind: TargetKind;
}

interface FallingPetal {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  wind: number;
  phase: number;
  phaseSpeed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  preferredTarget: PreferredTarget;
}

interface SettledPetal {
  id: string;
  left: number;
  size: number;
  depth: number;
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

type FallingPetalStyle = CSSProperties & {
  "--fall-size": string;
  "--fall-opacity": number;
};

type SettledPetalStyle = CSSProperties & {
  "--settled-left": string;
  "--settled-size": string;
  "--settled-depth": string;
  "--settled-rotation": string;
  "--settled-opacity": number;
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

const BOX_SELECTOR = [
  "[data-sakura-box]",
  ".status-card",
  ".proposal-card",
  ".proposal-question",
  ".proposal-video-wrapper",
  ".wish-form",
  ".wish-list-container",
  ".wish-card",
  ".bride-message",
].join(", ");

const FALLING_PETAL_COUNT = 38;

function createFallingPetal(index: number): FallingPetal {
  const direction = Math.random() > 0.5 ? 1 : -1;

  return {
    id: `falling-${index}`,
    x: 0,
    y: -100,
    size: 10 + Math.random() * 14,
    speed: 55 + Math.random() * 52,
    sway: 25 + Math.random() * 65,
    wind: -12 + Math.random() * 24,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 1.1 + Math.random() * 1.5,
    rotation: Math.random() * 360,
    rotationSpeed: direction * (45 + Math.random() * 115),
    opacity: 0.5 + Math.random() * 0.48,
    preferredTarget: Math.random() < 0.25 ? "text" : "surface",
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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export default function SakuraRain({ celebrate = false }: SakuraRainProps) {
  const fallingNodesRef = useRef<Array<HTMLSpanElement | null>>([]);
  const targetsRef = useRef<SurfaceTarget[]>([]);

  const targetIdsRef = useRef(new WeakMap<HTMLElement, string>());
  const targetCounterRef = useRef(0);
  const settledCounterRef = useRef(0);

  const [targets, setTargets] = useState<SurfaceTarget[]>([]);
  const [settledPetals, setSettledPetals] = useState<
    Record<string, SettledPetal[]>
  >({});

  const fallingPetals = useMemo(
    () =>
      Array.from({ length: FALLING_PETAL_COUNT }, (_, index) =>
        createFallingPetal(index),
      ),
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

  useEffect(() => {
    function getTargetId(element: HTMLElement) {
      const currentId = targetIdsRef.current.get(element);

      if (currentId) {
        return currentId;
      }

      targetCounterRef.current += 1;

      const newId = `sakura-target-${targetCounterRef.current}`;
      targetIdsRef.current.set(element, newId);

      return newId;
    }

    function updateTargets() {
      const nextTargets: SurfaceTarget[] = [];
      const registeredElements = new Set<HTMLElement>();

      function registerTarget(element: HTMLElement | null, kind: TargetKind) {
        if (!element || registeredElements.has(element)) {
          return;
        }

        registeredElements.add(element);

        nextTargets.push({
          id: getTargetId(element),
          element,
          kind,
        });
      }

      document
        .querySelectorAll<HTMLElement>(BOX_SELECTOR)
        .forEach((element) => registerTarget(element, "surface"));

      document
        .querySelectorAll<HTMLElement>("[data-sakura-text]")
        .forEach((element) => registerTarget(element, "text"));

      registerTarget(document.getElementById("sakura-page-end"), "page-end");

      targetsRef.current = nextTargets;

      setTargets((currentTargets) => {
        const targetsAreSame =
          currentTargets.length === nextTargets.length &&
          currentTargets.every(
            (target, index) =>
              target.id === nextTargets[index]?.id &&
              target.kind === nextTargets[index]?.kind,
          );

        return targetsAreSame ? currentTargets : nextTargets;
      });
    }

    updateTargets();

    const observer = new MutationObserver(updateTargets);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let animationFrameId = 0;
    let previousTime = performance.now();

    function resetPetal(
      petal: FallingPetal,
      initial: boolean,
      viewportWidth: number,
      viewportHeight: number,
    ) {
      petal.x = -30 + Math.random() * (viewportWidth + 60);

      petal.y = initial
        ? -120 + Math.random() * (viewportHeight + 120)
        : -45 - Math.random() * 220;

      petal.speed = 55 + Math.random() * 52;
      petal.sway = 25 + Math.random() * 65;
      petal.wind = -12 + Math.random() * 24;
      petal.phase = Math.random() * Math.PI * 2;
      petal.phaseSpeed = 1.1 + Math.random() * 1.5;

      petal.rotationSpeed =
        (Math.random() > 0.5 ? 1 : -1) * (45 + Math.random() * 115);

      petal.preferredTarget = Math.random() < 0.25 ? "text" : "surface";
    }

    function addSettledPetal(
      target: SurfaceTarget,
      rect: DOMRect,
      centerX: number,
      fallingPetal: FallingPetal,
    ) {
      const left = clamp(
        ((centerX - rect.left) / rect.width) * 100,
        target.kind === "text" ? 8 : 2,
        target.kind === "text" ? 92 : 98,
      );

      const maximumPetals =
        target.kind === "page-end" ? 120 : target.kind === "text" ? 14 : 24;

      const depth =
        target.kind === "page-end"
          ? Math.random() * 27
          : target.kind === "text"
            ? Math.random() * 7
            : Math.random() * 13;

      settledCounterRef.current += 1;

      const newPetal: SettledPetal = {
        id: `settled-${settledCounterRef.current}`,
        left,
        size: fallingPetal.size,
        depth,
        rotation: -170 + Math.random() * 340,
        opacity: fallingPetal.opacity,
      };

      setSettledPetals((currentPetals) => {
        const currentPile = currentPetals[target.id] ?? [];

        if (currentPile.length >= maximumPetals) {
          return currentPetals;
        }

        return {
          ...currentPetals,
          [target.id]: [...currentPile, newPetal],
        };
      });
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    fallingPetals.forEach((petal) => {
      resetPetal(petal, true, viewportWidth, viewportHeight);
    });

    function animate(currentTime: number) {
      const deltaTime = Math.min((currentTime - previousTime) / 1000, 0.035);

      previousTime = currentTime;

      const currentViewportWidth = window.innerWidth;
      const currentViewportHeight = window.innerHeight;

      const measuredTargets = targetsRef.current
        .filter((target) => target.element.isConnected)
        .map((target) => ({
          target,
          rect: target.element.getBoundingClientRect(),
        }))
        .filter(
          ({ rect }) =>
            rect.width > 4 &&
            rect.top >= -8 &&
            rect.top <= currentViewportHeight + 8,
        )
        .sort((first, second) => first.rect.top - second.rect.top);

      fallingPetals.forEach((petal, index) => {
        const previousBottom = petal.y + petal.size * 0.72;

        petal.phase += petal.phaseSpeed * deltaTime;
        petal.x += petal.wind * deltaTime;

        petal.y += (petal.speed + Math.sin(petal.phase * 0.7) * 9) * deltaTime;

        petal.rotation += petal.rotationSpeed * deltaTime;

        if (petal.x < -petal.sway - 80) {
          petal.x = currentViewportWidth + petal.sway;
        }

        if (petal.x > currentViewportWidth + petal.sway + 80) {
          petal.x = -petal.sway;
        }

        let renderedX = petal.x + Math.sin(petal.phase) * petal.sway;

        const centerX = renderedX + petal.size / 2;
        const currentBottom = petal.y + petal.size * 0.72;

        let collision:
          | {
              target: SurfaceTarget;
              rect: DOMRect;
            }
          | undefined;

        for (const measuredTarget of measuredTargets) {
          const { target, rect } = measuredTarget;

          const acceptsPetal =
            target.kind === "page-end" || target.kind === petal.preferredTarget;

          if (!acceptsPetal) {
            continue;
          }

          const insideHorizontally =
            centerX >= rect.left + 2 && centerX <= rect.right - 2;

          const crossedTop =
            previousBottom <= rect.top + 3 && currentBottom >= rect.top - 2;

          if (insideHorizontally && crossedTop) {
            collision = measuredTarget;
            break;
          }
        }

        if (collision) {
          addSettledPetal(collision.target, collision.rect, centerX, petal);

          resetPetal(petal, false, currentViewportWidth, currentViewportHeight);

          renderedX = petal.x + Math.sin(petal.phase) * petal.sway;
        } else if (petal.y > currentViewportHeight + 70) {
          resetPetal(petal, false, currentViewportWidth, currentViewportHeight);

          renderedX = petal.x + Math.sin(petal.phase) * petal.sway;
        }

        const node = fallingNodesRef.current[index];

        if (!node) {
          return;
        }

        const rotateX = Math.sin(petal.phase * 1.65) * 72;
        const rotateY = Math.cos(petal.phase * 1.25) * 48;

        node.style.transform = `
          translate3d(${renderedX}px, ${petal.y}px, 0)
          rotate(${petal.rotation}deg)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
        `;
      });

      animationFrameId = window.requestAnimationFrame(animate);
    }

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [fallingPetals]);

  return (
    <>
      <div className="sakura-rain" aria-hidden="true">
        {fallingPetals.map((petal, index) => {
          const style: FallingPetalStyle = {
            "--fall-size": `${petal.size}px`,
            "--fall-opacity": petal.opacity,
          };

          return (
            <span
              key={petal.id}
              ref={(node) => {
                fallingNodesRef.current[index] = node;
              }}
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

      {targets.map((target) => {
        const petals = settledPetals[target.id] ?? [];

        if (petals.length === 0) {
          return null;
        }

        return createPortal(
          <span
            className={`sakura-pile sakura-pile--${target.kind}`}
            aria-hidden="true"
          >
            {petals.map((petal) => {
              const style: SettledPetalStyle = {
                "--settled-left": `${petal.left}%`,
                "--settled-size": `${petal.size}px`,
                "--settled-depth": `${petal.depth}px`,
                "--settled-rotation": `${petal.rotation}deg`,
                "--settled-opacity": petal.opacity,
              };

              return (
                <span
                  key={petal.id}
                  className="sakura-petal sakura-petal--settled"
                  style={style}
                />
              );
            })}
          </span>,
          target.element,
          target.id,
        );
      })}
    </>
  );
}
