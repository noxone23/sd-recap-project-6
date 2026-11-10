export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  color: string;
}

export const MAX_PARTICLES = 80;
export const PARTICLE_LIFE = 900;
export const PALETTE = ["#4f8ff0", "#2fc4b2", "#b66ae8", "#f06aa0"];

const GOLDEN_ANGLE = 2.399963;
const MAX_ALPHA = 0.7;

export function createParticle(x: number, y: number, index: number): Particle {
  const angle = index * GOLDEN_ANGLE;
  const speed = 0.02 + (index % 5) * 0.008;

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    age: 0,
    life: PARTICLE_LIFE,
    size: 3 + (index % 4),
    color: PALETTE[index % PALETTE.length],
  };
}

export function addParticle(
  particles: Particle[],
  particle: Particle
): Particle[] {
  return [...particles, particle].slice(-MAX_PARTICLES);
}

export function stepParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * dt,
      y: particle.y + particle.vy * dt,
      age: particle.age + dt,
    }))
    .filter((particle) => particle.age < particle.life);
}

export function particleAlpha(particle: Particle): number {
  const remaining = Math.max(0, 1 - particle.age / particle.life);

  return MAX_ALPHA * remaining ** 2;
}
