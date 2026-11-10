import {
  MAX_PARTICLES,
  PALETTE,
  PARTICLE_LIFE,
  addParticle,
  createParticle,
  particleAlpha,
  stepParticles,
} from "./particles";

describe("createParticle", () => {
  it("puts the particle at the pointer and starts with age 0", () => {
    const particle = createParticle(120, 80, 0);

    expect(particle.x).toBe(120);
    expect(particle.y).toBe(80);
    expect(particle.age).toBe(0);
  });

  it("cycles through the palette by its number", () => {
    const colors = [0, 1, 2, 3, 4, 5].map(
      (index) => createParticle(0, 0, index).color
    );

    expect(colors).toEqual([
      PALETTE[0],
      PALETTE[1],
      PALETTE[2],
      PALETTE[3],
      PALETTE[0],
      PALETTE[1],
    ]);
  });

  it("gives the same particle for the same input", () => {
    expect(createParticle(10, 20, 7)).toEqual(createParticle(10, 20, 7));
  });

  it("gives different directions for different numbers", () => {
    const first = createParticle(0, 0, 0);
    const second = createParticle(0, 0, 1);

    expect([first.vx, first.vy]).not.toEqual([second.vx, second.vy]);
  });

  it("moves away from the pointer", () => {
    const { vx, vy } = createParticle(0, 0, 3);

    expect(Math.hypot(vx, vy)).toBeGreaterThan(0);
  });

  it("lives for the particle life", () => {
    expect(createParticle(0, 0, 0).life).toBe(PARTICLE_LIFE);
  });

  it("is small: between 3 and 6 px", () => {
    for (let index = 0; index < 20; index++) {
      const { size } = createParticle(0, 0, index);

      expect(size).toBeGreaterThanOrEqual(3);
      expect(size).toBeLessThanOrEqual(6);
    }
  });
});

describe("stepParticles", () => {
  it("moves and ages the particles", () => {
    const particle = { ...createParticle(100, 100, 0), vx: 0.1, vy: -0.05 };

    const [moved] = stepParticles([particle], 100);

    expect(moved.x).toBeCloseTo(110);
    expect(moved.y).toBeCloseTo(95);
    expect(moved.age).toBe(100);
  });

  it("removes the particles that reached the end of their life", () => {
    const young = createParticle(0, 0, 0);
    const old = { ...createParticle(0, 0, 1), age: PARTICLE_LIFE - 10 };

    const result = stepParticles([young, old], 10);

    expect(result).toHaveLength(1);
    expect(result[0].color).toBe(young.color);
  });

  it("does not change the list that it gets", () => {
    const particles = [createParticle(5, 5, 0)];
    const copy = structuredClone(particles);

    stepParticles(particles, 50);

    expect(particles).toEqual(copy);
  });

  it("returns an empty list when there is nothing left", () => {
    expect(stepParticles([createParticle(0, 0, 0)], PARTICLE_LIFE)).toEqual([]);
  });
});

describe("addParticle", () => {
  it("adds the particle to a new list", () => {
    const list = [createParticle(0, 0, 0)];

    const result = addParticle(list, createParticle(1, 1, 1));

    expect(result).toHaveLength(2);
    expect(list).toHaveLength(1);
  });

  it("keeps at most the maximum and drops the oldest", () => {
    let list = [] as ReturnType<typeof createParticle>[];
    for (let index = 0; index < MAX_PARTICLES + 5; index++) {
      list = addParticle(list, createParticle(index, 0, index));
    }

    expect(list).toHaveLength(MAX_PARTICLES);
    expect(list[0].x).toBe(5);
    expect(list[list.length - 1].x).toBe(MAX_PARTICLES + 4);
  });
});

describe("particleAlpha", () => {
  it("is 0.7 at the start and 0 at the end", () => {
    const particle = createParticle(0, 0, 0);

    expect(particleAlpha(particle)).toBeCloseTo(0.7);
    expect(particleAlpha({ ...particle, age: PARTICLE_LIFE })).toBe(0);
  });

  it("falls steadily and is never above 0.7", () => {
    const particle = createParticle(0, 0, 0);
    let previous = Infinity;

    for (let age = 0; age <= PARTICLE_LIFE; age += 50) {
      const alpha = particleAlpha({ ...particle, age });

      expect(alpha).toBeLessThanOrEqual(0.7);
      expect(alpha).toBeLessThanOrEqual(previous);
      previous = alpha;
    }
  });
});
