import { blinkEffect, BlinkEffectConfig } from "../../src/effects/blink";
import { RgbColor } from "../../src/WledUdpRealtimeProtocol";
import * as utils from "../../src/utils";

jest.spyOn(utils, "startTimer").mockImplementation((fps: number) => {
  const tickTime = 1000 / fps;
  let time = 0;

  return {
    time() {
      return time;
    },
    // Mock tick does not block to speed up tests
    async tick() {
      time += tickTime;
      return time;
    },
  };
});

it("has ID and name", async () => {
  expect(blinkEffect.id).toBeDefined();
  expect(blinkEffect.name).toBeDefined();
});

const config: BlinkEffectConfig = {
  fps: 10,
  ledStart: 0,
  ledCount: 1,
  cycles: 1,
  frequency: 1,
  color: [255, 200, 150],
};

it("starts black at 0, ramps up to the input color, and produces 10 frames at 10 fps and 1 Hz", async () => {
  const colorOut: RgbColor = [1, 1, 1];
  const frames: { time: number; colorOut: RgbColor }[] = [];

  for await (const time of blinkEffect.generate(config, colorOut)) {
    frames.push({ time, colorOut: [...colorOut] });
  }

  expect(frames.length).toBe(10);
  expect(frames.map((entry) => entry.time)).toEqual([
    0, 100, 200, 300, 400, 500, 600, 700, 800, 900,
  ]);
  expect(frames[0].colorOut).toEqual([0, 0, 0]);
  expect(frames[5].colorOut).toEqual([255, 200, 150]);
});

it("considers the frequency", async () => {
  const colorOut: RgbColor = [1, 1, 1];
  let frameCount = 0;

  for await (const time of blinkEffect.generate(
    { ...config, frequency: 2 },
    colorOut
  )) {
    frameCount++;
  }

  expect(frameCount).toBe(5);
});

it("considers the cycles", async () => {
  const colorOut: RgbColor = [1, 1, 1];
  let frameCount = 0;

  for await (const time of blinkEffect.generate(
    { ...config, cycles: 2 },
    colorOut
  )) {
    frameCount++;
  }

  expect(frameCount).toBe(20);
});
