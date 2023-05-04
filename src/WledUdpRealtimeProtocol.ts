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

/**
 * https://kno.wled.ge/interfaces/udp-realtime/
 */
export enum Mode {
  /**
   * WLED Audio-Reactive-Led-Strip mode. Addresses LEDs individually by index. Uses RGB color channels.
   */
  WARLS = 1,
  /**
   * Addresses LEDs sequentially from the beginning. Uses RGB color channels.
   */
  DRGB = 2,
  /**
   * Same as {@link Mode.DRGB} with additional white channel.
   */
  DRGBW = 3,
  /**
   * Like {@link Mode.DRGB}, but with a start index.
   */
  DNRGB = 4,
}

export type PacketHeader = [mode: Mode, timeout: number];
export type DnrgbPacketHeader = [
  ...header: PacketHeader,
  indexHigh: number,
  indexLow: number
];

export type RgbColor = [red: number, green: number, blue: number];
export type RgbwColor = [...rgb: RgbColor, white: number];

export type WarlsEntry = [index: number, ...color: RgbColor];
export type DrgbEntry = RgbColor;
export type DrgbwEntry = RgbwColor;
export type DnrgbEntry = RgbColor;

// TS does not yet allow to define flattened arrays of tuples, thus packet types cannot be nicely defined either.
// e.g. `type DrgbList = [...first: DrgbEntry, ...more: DrgbList]`

export type WarlsPacket = [...PacketHeader, ...number[]];
export type DrgbPacket = [...PacketHeader, ...number[]];
export type DrgbwPacket = [...PacketHeader, ...number[]];
export type DnrgbPacket = [...DnrgbPacketHeader, ...number[]];
