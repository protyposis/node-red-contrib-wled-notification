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

import dgram from "dgram-as-promised";
import { DnrgbPacketHeader, Mode, RgbColor } from "./WledUdpRealtimeProtocol";
import { Effect, EffectConfig } from "./effects/Effect";

/*
 * Notification requirements:
 * - short
 * - highly visible
 * - simple animations?
 * - simple configuration, e.g., color, duration
 * - must not interfere with normal operation mode
 *
 * Issues:
 * - overrides normal WLED mode, but does not override other realtime effects (e.g. Ambilight)
 * - brightness cannot be controlled; if brightness is low, notification might not be visible
 * - transition from/to normal operation not smooth (add blend transition)
 *
 * Ideas:
 * - Builtin notifications
 *   - send short one-time request instead of stream of UDP packets
 *   - similar to Ikea Tradfri bulb effects
 *   - could also be used by WLED itself, e.g., to confirm config changes
 */

export async function notify<C extends EffectConfig>(
  host: string,
  port: number,
  effect: Effect<C>,
  effectConfig: C
) {
  const socket = dgram.createSocket("udp4");

  try {
    // Config packet needs to be sent as "header" with every packet
    const header: DnrgbPacketHeader = [
      Mode.DNRGB,
      1, // seconds timeout (1 is minimum)
      (effectConfig.ledStart >> 8) & 0xff,
      effectConfig.ledStart & 0xff,
    ];

    const colorOut: RgbColor = [0, 0, 0];
    const data = Buffer.alloc(header.length + effectConfig.ledCount * 3);

    data.set(header);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const time of effect.generate(effectConfig, colorOut)) {
      for (let i = 0; i < effectConfig.ledCount; i++) {
        const dataIndex = header.length + i * 3;

        data[dataIndex + 0] = colorOut[0];
        data[dataIndex + 1] = colorOut[1];
        data[dataIndex + 2] = colorOut[2];
      }

      await socket.send(data, port, host);
    }

    // clear colors for timeout duration if effect didn't end at zero brightness
    data.fill(0);
    data.set(header);
    await socket.send(data, port, host);
  } finally {
    await socket.close();
  }
}
