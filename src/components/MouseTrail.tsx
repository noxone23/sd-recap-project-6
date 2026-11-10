import { useEffect, useRef, useState } from "react";

import {
  addParticle,
  createParticle,
  particleAlpha,
  stepParticles,
} from "../particles";
import type { Particle } from "../particles";

const MIN_DISTANCE = 8;

interface Trail {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  particles: Particle[];
  count: number;
  last: { x: number; y: number } | null;
  frameId: number | null;
  lastTime: number | null;
}

function wantsTrail() {
  const hasMouse =
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
  const reducesMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  return hasMouse && !reducesMotion;
}

function resizeCanvas(trail: Trail) {
  const ratio = window.devicePixelRatio || 1;

  const { clientWidth, clientHeight } = document.documentElement;

  trail.canvas.width = Math.round(clientWidth * ratio);
  trail.canvas.height = Math.round(clientHeight * ratio);
  trail.context?.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawParticles(trail: Trail) {
  const { context } = trail;

  if (!context) {
    return;
  }

  const { clientWidth, clientHeight } = document.documentElement;

  context.clearRect(0, 0, clientWidth, clientHeight);

  for (const particle of trail.particles) {
    context.globalAlpha = particleAlpha(particle);
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
    context.fill();
  }
}

function requestFrame(trail: Trail) {
  trail.frameId = window.requestAnimationFrame((time) => runFrame(trail, time));
}

function runFrame(trail: Trail, time: number) {
  const elapsed = trail.lastTime === null ? 0 : time - trail.lastTime;

  trail.lastTime = time;
  trail.particles = stepParticles(trail.particles, elapsed);
  drawParticles(trail);

  if (trail.particles.length > 0) {
    requestFrame(trail);
  } else {
    trail.frameId = null;
    trail.lastTime = null;
  }
}

function stopFrames(trail: Trail) {
  if (trail.frameId !== null) {
    window.cancelAnimationFrame(trail.frameId);
  }

  trail.frameId = null;
  trail.lastTime = null;
}

function addPointer(trail: Trail, x: number, y: number) {
  const { last } = trail;

  if (last && Math.hypot(x - last.x, y - last.y) < MIN_DISTANCE) {
    return;
  }

  const index = trail.count;

  trail.count += 1;
  trail.last = { x, y };
  trail.particles = addParticle(trail.particles, createParticle(x, y, index));

  if (trail.frameId === null) {
    requestFrame(trail);
  }
}

function startTrail(canvas: HTMLCanvasElement) {
  const trail: Trail = {
    canvas,
    context: canvas.getContext("2d"),
    particles: [],
    count: 0,
    last: null,
    frameId: null,
    lastTime: null,
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") {
      addPointer(trail, event.clientX, event.clientY);
    }
  };
  const handleResize = () => resizeCanvas(trail);
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopFrames(trail);
      trail.particles = [];
      drawParticles(trail);
    }
  };

  resizeCanvas(trail);
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("resize", handleResize);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    stopFrames(trail);
  };
}

function TrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    return canvas ? startTrail(canvas) : undefined;
  }, []);

  return <canvas ref={canvasRef} className="mouse-trail" aria-hidden="true" />;
}

export default function MouseTrail() {
  const [isWanted] = useState(wantsTrail);

  return isWanted ? <TrailCanvas /> : null;
}
