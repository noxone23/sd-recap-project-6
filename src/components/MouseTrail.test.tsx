import { fireEvent, render } from "@testing-library/react";

import MouseTrail from "./MouseTrail";

function mockMedia({ hover = true, reduce = false } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reduce : hover,
    }))
  );
}

function mockCanvas() {
  const context = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: "",
    globalAlpha: 1,
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D
  );

  return context;
}

function mockFrames() {
  const callbacks = new Map<number, FrameRequestCallback>();
  let lastId = 0;
  const requestFrame = vi.fn((callback: FrameRequestCallback) => {
    callbacks.set(++lastId, callback);
    return lastId;
  });
  const cancelFrame = vi.fn((id: number) => {
    callbacks.delete(id);
  });
  vi.stubGlobal("requestAnimationFrame", requestFrame);
  vi.stubGlobal("cancelAnimationFrame", cancelFrame);

  return {
    requestFrame,
    cancelFrame,
    pending: () => callbacks.size,
    runFrame(time: number) {
      const due = [...callbacks.values()];
      callbacks.clear();
      due.forEach((callback) => callback(time));
    },
  };
}

function movePointer(x: number, y: number, pointerType?: string) {
  fireEvent(
    window,
    Object.assign(new Event("pointermove"), {
      clientX: x,
      clientY: y,
      pointerType,
    })
  );
}

function setPageSize(width: number, height: number) {
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    configurable: true,
    value: height,
  });
}

function setup() {
  mockMedia();
  const context = mockCanvas();
  const frames = mockFrames();
  const view = render(<MouseTrail />);

  return { context, frames, ...view };
}

afterEach(() => {
  Reflect.deleteProperty(document.documentElement, "clientWidth");
  Reflect.deleteProperty(document.documentElement, "clientHeight");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("MouseTrail", () => {
  it("renders nothing and adds no listener when matchMedia is missing", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");

    const { container } = render(<MouseTrail />);

    expect(container.querySelector("canvas")).toBeNull();
    expect(
      addEventListener.mock.calls.some(([type]) => type === "pointermove")
    ).toBe(false);
  });

  it("renders nothing when the user asks for reduced motion", () => {
    mockMedia({ reduce: true });

    const { container } = render(<MouseTrail />);

    expect(container.querySelector("canvas")).toBeNull();
  });

  it("renders nothing without a mouse", () => {
    mockMedia({ hover: false });

    const { container } = render(<MouseTrail />);

    expect(container.querySelector("canvas")).toBeNull();
  });

  it("renders a canvas that is hidden from screen readers and cannot be focused", () => {
    const { container } = setup();

    const canvas = container.querySelector("canvas");

    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).not.toHaveAttribute("tabindex");
  });

  it("sizes the canvas to the page without the scrollbar and to the pixel ratio, also after a resize", () => {
    vi.stubGlobal("innerWidth", 800);
    vi.stubGlobal("innerHeight", 600);
    vi.stubGlobal("devicePixelRatio", 2);
    setPageSize(780, 590);
    const { container, context } = setup();
    const canvas = container.querySelector("canvas");

    expect(canvas?.width).toBe(1560);
    expect(canvas?.height).toBe(1180);
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);

    setPageSize(1000, 590);
    fireEvent(window, new Event("resize"));

    expect(canvas?.width).toBe(2000);
  });

  it("rounds the canvas size to whole pixels", () => {
    vi.stubGlobal("devicePixelRatio", 1.5);
    setPageSize(801, 601);

    const { container } = setup();
    const canvas = container.querySelector("canvas");

    expect(canvas?.width).toBe(1202);
    expect(canvas?.height).toBe(902);
  });

  it("clears the whole page without the scrollbar", () => {
    setPageSize(780, 590);
    const { context, frames } = setup();

    movePointer(100, 100);
    frames.runFrame(0);

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 780, 590);
  });

  it.each([["touch"], ["pen"]])("draws nothing for %s input", (pointerType) => {
    const { context, frames } = setup();

    movePointer(100, 100, pointerType);

    expect(frames.requestFrame).not.toHaveBeenCalled();
    frames.runFrame(0);
    expect(context.arc).not.toHaveBeenCalled();
  });

  it("draws for mouse input", () => {
    const { context, frames } = setup();

    movePointer(100, 100, "mouse");
    frames.runFrame(0);

    expect(context.arc).toHaveBeenCalledTimes(1);
  });

  it("draws again when the tab is visible again", () => {
    const { context, frames } = setup();
    const hidden = vi.spyOn(document, "hidden", "get");
    movePointer(100, 100);
    hidden.mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));

    movePointer(300, 300);
    frames.runFrame(0);

    expect(context.arc).toHaveBeenCalledWith(
      300,
      300,
      expect.any(Number),
      0,
      Math.PI * 2
    );
  });

  it("draws the first frame with the opacity of the particle", () => {
    const { context, frames } = setup();
    const alphas: number[] = [];
    context.fill.mockImplementation(() => alphas.push(context.globalAlpha));

    movePointer(100, 100);
    frames.runFrame(0);

    expect(alphas[0]).toBeCloseTo(0.7);
  });

  it("draws a circle at the pointer on the next frame", () => {
    const { context, frames } = setup();

    movePointer(100, 100);
    frames.runFrame(0);

    expect(context.arc).toHaveBeenCalledWith(
      100,
      100,
      expect.any(Number),
      0,
      Math.PI * 2
    );
    expect(context.fill).toHaveBeenCalled();
  });

  it("stops drawing after the particle has faded out and requests no more frames", () => {
    const { context, frames } = setup();
    movePointer(100, 100);
    frames.runFrame(0);
    const circlesBefore = context.arc.mock.calls.length;

    frames.runFrame(1000);

    expect(context.arc.mock.calls.length).toBe(circlesBefore);
    expect(context.clearRect).toHaveBeenCalled();
    expect(frames.pending()).toBe(0);
  });

  it("starts the frame loop only once for several moves", () => {
    const { frames } = setup();

    movePointer(100, 100);
    movePointer(200, 200);

    expect(frames.requestFrame).toHaveBeenCalledTimes(1);
  });

  it("makes one particle for moves of less than 8 px", () => {
    const { context, frames } = setup();

    movePointer(100, 100);
    movePointer(103, 104);
    frames.runFrame(0);

    expect(context.arc).toHaveBeenCalledTimes(1);
  });

  it("makes a new particle after a move of 8 px or more", () => {
    const { context, frames } = setup();

    movePointer(100, 100);
    movePointer(120, 100);
    frames.runFrame(0);

    expect(context.arc).toHaveBeenCalledTimes(2);
  });

  it("pauses and removes the particles when the tab is hidden", () => {
    const { context, frames } = setup();
    movePointer(100, 100);
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);

    fireEvent(document, new Event("visibilitychange"));

    expect(frames.cancelFrame).toHaveBeenCalled();
    expect(frames.pending()).toBe(0);
    expect(context.clearRect).toHaveBeenCalled();
    expect(context.arc).not.toHaveBeenCalled();
  });

  it("does not throw when the canvas has no drawing context", () => {
    mockMedia();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const frames = mockFrames();
    render(<MouseTrail />);

    expect(() => {
      movePointer(100, 100);
      frames.runFrame(0);
    }).not.toThrow();
  });

  it("removes its listeners and cancels the frame when it is removed", () => {
    mockMedia();
    mockCanvas();
    const frames = mockFrames();
    const addToWindow = vi.spyOn(window, "addEventListener");
    const removeFromWindow = vi.spyOn(window, "removeEventListener");
    const addToDocument = vi.spyOn(document, "addEventListener");
    const removeFromDocument = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<MouseTrail />);
    movePointer(100, 100);
    const added = (spy: typeof addToWindow, type: string) =>
      spy.mock.calls.find(([name]) => name === type)?.[1];

    unmount();

    expect(removeFromWindow).toHaveBeenCalledWith(
      "pointermove",
      added(addToWindow, "pointermove")
    );
    expect(removeFromWindow).toHaveBeenCalledWith(
      "resize",
      added(addToWindow, "resize")
    );
    expect(removeFromDocument).toHaveBeenCalledWith(
      "visibilitychange",
      added(addToDocument, "visibilitychange")
    );
    expect(added(addToWindow, "pointermove")).toBeDefined();
    expect(frames.cancelFrame).toHaveBeenCalled();
  });
});
