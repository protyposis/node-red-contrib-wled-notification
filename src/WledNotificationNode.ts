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

import { Node, NodeDef, NodeInitializer } from "node-red";
import { NodeMessage } from "@node-red/registry";
import { getEffectById } from "./effects/effects";
import { notify } from "./notify";
import { deparallelify } from "./deparallelify";
import { parseHexColorString } from "./utils";

export interface WledNotificationNodeDef extends NodeDef {
  host: string;
  port: string;
  fps: number;
  ledStart: number;
  ledCount: number;
  effect: string;
  effectFrequency: number;
  effectCycles: number;
  effectColor: string;
}

export interface WledNotificationNodeMessage
  extends NodeMessage,
    Partial<WledNotificationNodeDef> {}

export const processInput = async function processInput(
  node: Node,
  staticConfig: WledNotificationNodeDef,
  msg: WledNotificationNodeMessage
) {
  // Overwrite config properties from message
  const config = {
    ...staticConfig,
    ...msg,
  };

  const effect = getEffectById(config.effect);
  const effectColor = parseHexColorString(config.effectColor);

  await notify(config.host, parseInt(config.port), effect, {
    ledStart: config.ledStart,
    ledCount: config.ledCount,
    fps: config.fps,
    frequency: config.effectFrequency,
    cycles: config.effectCycles,
    color: effectColor,
  });

  return msg;
};

export const wledNotificationNodeInitializer: NodeInitializer = function (RED) {
  function WledNotificationNode(this: Node, config: WledNotificationNodeDef) {
    RED.nodes.createNode(this, config);

    this.on("input", async (msg: NodeMessage) => {
      try {
        const output = await deparallelify(
          this,
          async () => await processInput(this, config, msg)
        );
        this.send(output);
      } catch (e) {
        if (e instanceof Error) {
          this.error(e.message, msg);
        } else {
          this.error(`Unknown error: ${e}`, msg);
        }
      }
    });
  }

  RED.nodes.registerType("wled-notification", WledNotificationNode);
};
