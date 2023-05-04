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

import { RgbColor } from "../WledUdpRealtimeProtocol";
import { sinFade, startTimer } from "../utils";
import { Effect, EffectConfig } from "./Effect";

export interface BlinkEffectConfig extends EffectConfig {
  frequency: number;
  cycles: number;
  color: RgbColor;
}

async function* blink(config: BlinkEffectConfig, colorOut: RgbColor) {
  const duration = (1000 / config.frequency) * config.cycles;
  const timer = startTimer(config.fps);

  while (timer.time() < duration) {
    // Maps the sine [-1,1] range to [0,255] and adjusts phase to start at 0
    const intensity = Math.abs(sinFade(timer.time() / 1000, config.frequency));

    colorOut[0] = Math.floor(config.color[0] * intensity);
    colorOut[1] = Math.floor(config.color[1] * intensity);
    colorOut[2] = Math.floor(config.color[2] * intensity);

    yield timer.time();
    await timer.tick();
  }
}

export const blinkEffect: Effect<BlinkEffectConfig> = {
  id: "blink",
  name: "Blink",
  generate: blink,
};
