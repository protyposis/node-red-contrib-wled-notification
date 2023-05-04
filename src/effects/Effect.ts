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

import { DrgbEntry } from "../WledUdpRealtimeProtocol";

export interface EffectConfig {
  fps: number;
  ledStart: number;
  ledCount: number;
}

export interface Effect<C extends EffectConfig = EffectConfig> {
  id: string;
  name: string;
  generate: (config: C, colorOut: DrgbEntry) => AsyncGenerator<number, void>;
}
