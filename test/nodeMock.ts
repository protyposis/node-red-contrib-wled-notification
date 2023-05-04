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
import { wledNotificationNodeInitializer } from "../src/WledNotificationNode";
import { NodeMessage } from "@node-red/registry";

export interface MockNode extends Node {
  getEventListener(): (msg: NodeMessage) => void;
}

export function createNodeMock(): MockNode {
  const contextStore: Record<string, unknown> = {};
  let eventListener: (msg: NodeMessage) => void;

  return {
    context() {
      return {
        set(key: string, value: unknown) {
          contextStore[key] = value;
        },
        get(key: string): unknown {
          return contextStore[key];
        },
      };
    },
    send(msg?: NodeMessage | Array<NodeMessage | NodeMessage[] | null>) {},
    log(message: string) {},
    error: (logMessage: unknown, msg?: NodeMessage) => {},
    on(event: string, listener: (msg: NodeMessage) => void) {
      eventListener = listener;
    },
    getEventListener() {
      return eventListener;
    },
  } as MockNode;
}

export async function initMockNode(
  nodeInitializer: NodeInitializer
): Promise<MockNode> {
  return new Promise((resolve) => {
    const RED = {
      nodes: {
        createNode: jest.fn((virginNode) => {
          const node = Object.assign(virginNode, createNodeMock());
          resolve(node);
        }),
        registerType: jest
          .fn()
          .mockImplementation(
            (type: string, nodeConstructor: (config: NodeDef) => void) => {
              nodeConstructor.call(nodeConstructor, {} as NodeDef);
            }
          ),
      },
    } as unknown as Parameters<typeof wledNotificationNodeInitializer>[0];

    nodeInitializer(RED);
  });
}
