import { parseHexColorString, sinFade, startTimer, wait } from "../src/utils";

describe(wait, () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("waits for specified time", async () => {
    const promise = wait(5000);

    await expect(isPending(promise)).toBeTruthy();

    jest.advanceTimersByTime(5000);

    await expect(isSettled(promise)).toBeTruthy();
  });
});

describe(sinFade, () => {
  it("starts at 0", () => {
    expect(sinFade(0, 1)).toBe(0);
  });

  it("peaks at 1", () => {
    expect(sinFade(0.5, 1)).toBe(1);
  });

  it("ends at 0", () => {
    expect(sinFade(1, 1)).toBe(0);
  });

  it("repeats", () => {
    expect(sinFade(1.5, 1)).toBe(1);
  });

  it("scales with frequency", () => {
    expect(sinFade(0.25, 2)).toBe(1);
  });
});

describe(startTimer, () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("time", () => {
    it("returns 0 after start", () => {
      expect(startTimer(10).time()).toBe(0);
    });
  });

  describe("tick", () => {
    it("blocks for frame duration and returns tick time", async () => {
      const timer = startTimer(10);

      const tickPromise = timer.tick();

      jest.advanceTimersByTime(99);
      await expect(isPending(tickPromise)).toBeTruthy();

      jest.advanceTimersByTime(1);
      const tickTime = await tickPromise;

      expect(tickTime).toBe(100);
      expect(tickTime).toBe(timer.time());
    });
  });
});

describe(parseHexColorString, () => {
  it("parses valid string to byte array", () => {
    expect(parseHexColorString("#000000")).toEqual([0, 0, 0]);
    expect(parseHexColorString("#010203")).toEqual([1, 2, 3]);
    expect(parseHexColorString("#ffffff")).toEqual([255, 255, 255]);
    expect(parseHexColorString("#fFfFFF")).toEqual([255, 255, 255]);
  });

  it("throws on invalid string", () => {
    expect(() => parseHexColorString("#12345")).toThrowError();
    expect(() => parseHexColorString("#1234567")).toThrowError();
    expect(() => parseHexColorString("#GGGGGG")).toThrowError();
  });
});

async function isPending<T>(promise: Promise<T>): Promise<boolean> {
  const marker = "pending";
  const result = await Promise.race([promise, Promise.resolve(marker)]);
  return result === marker;
}

async function isSettled<T>(promise: Promise<T>): Promise<boolean> {
  const marker = "not-settled";
  const result = await Promise.race([promise, Promise.resolve(marker)]);
  return result !== marker;
}
