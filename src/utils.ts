/*
 * Copyright (c) 2023 Mario Guggenberger <mg@protyposis.net>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { RgbColor } from "./WledUdpRealtimeProtocol";

export async function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function sin(timeSeconds: number, frequency: number, phase: number) {
  return Math.sin(2 * Math.PI * frequency * timeSeconds + phase);
}

export function sinFade(timeSeconds: number, frequency: number) {
  return (sin(timeSeconds, frequency, 1.5 * Math.PI) + 1) / 2;
}

export interface Timer {
  /**
   * Returns the time passed between the start and the last tick.
   */
  time(): number;

  /**
   * Progresses the time and blocks until the next tick.
   */
  tick(): Promise<number>;
}

/**
 * Starts a frame rate timer for effects and returns the timer object.
 *
 * This is basically a wrapper around {@link wait} (and thus `setTimeout`) and
 * `Date.now()` to simplify timing logic in effect loops and also simplify
 * mocking of effect loop timing in tests.
 */
export function startTimer(fps: number): Timer {
  const frameTime = 1000 / fps;
  const startTime = Date.now();
  let time = 0;

  return {
    time() {
      return time;
    },

    async tick() {
      // This is a very simple implementation which does consider the processing
      // time used between ticks, so the actual frame rate is going to be a
      // little lower than the desired rate.
      await wait(frameTime);
      time = Date.now() - startTime;
      return time;
    },
  };
}

export function parseHexColorString(hexColor: string): RgbColor {
  if (!/^#[0-9a-fA-F]{6}$/.test(hexColor)) {
    throw new Error(`Invalid hex color format: ${hexColor}`);
  }

  return [...Buffer.from(hexColor.substring(1), "hex")] as RgbColor;
}
