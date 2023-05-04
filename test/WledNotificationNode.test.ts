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

import {
  processInput,
  WledNotificationNodeDef,
  wledNotificationNodeInitializer,
  WledNotificationNodeMessage,
} from "../src/WledNotificationNode";
import * as WledNotificationNode from "../src/WledNotificationNode";
import { notify } from "../src/notify";
import { blinkEffect } from "../src/effects/blink";
import { createNodeMock, initMockNode } from "./nodeMock";

jest.mock("../src/notify");
const mockNotify = notify as jest.Mocked<typeof notify>;

const mockConfig: WledNotificationNodeDef = {
  name: "test name",
  type: "test type",
  id: "test id",
  z: "test z",
  host: "test-host",
  port: "567",
  fps: 10,
  ledStart: 0,
  ledCount: 1,
  effect: "blink",
  effectFrequency: 1,
  effectCycles: 1,
  effectColor: "#010203",
};

describe(processInput, () => {
  it("calls notify function with valid arguments", async () => {
    const node = createNodeMock();
    await processInput(node, mockConfig, {});

    expect(mockNotify).toBeCalledWith(
      mockConfig.host,
      parseInt(mockConfig.port),
      blinkEffect,
      {
        ledStart: 0,
        ledCount: 1,
        fps: 10,
        frequency: 1,
        cycles: 1,
        color: [1, 2, 3],
      }
    );
  });

  it("allows message to overwrite config", async () => {
    const node = createNodeMock();
    await processInput(node, mockConfig, { ledCount: 789, fps: 22 });

    expect(mockNotify).toBeCalledWith(
      mockConfig.host,
      parseInt(mockConfig.port),
      blinkEffect,
      {
        ledStart: 0,
        ledCount: 789,
        fps: 22,
        frequency: 1,
        cycles: 1,
        color: [1, 2, 3],
      }
    );
  });
});

describe(wledNotificationNodeInitializer, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls processInput with message", async () => {
    const node = await initMockNode(wledNotificationNodeInitializer);
    const inputHandler = node.getEventListener();
    const msg: WledNotificationNodeMessage = {};
    jest.spyOn(WledNotificationNode, "processInput").mockResolvedValue(msg);

    await inputHandler(msg);

    expect(processInput).toBeCalledTimes(1);
    expect(processInput).toBeCalledWith(node, expect.anything(), msg);
  });

  it("prevents multiple parallel invocation", async () => {
    const node = await initMockNode(wledNotificationNodeInitializer);
    const inputHandler = node.getEventListener();
    jest
      .spyOn(WledNotificationNode, "processInput")
      .mockImplementation(async (node, config, msg) => {
        return msg;
      });

    const promise = inputHandler({ payload: "first" });
    await inputHandler({ payload: "second" });
    await promise;

    expect(processInput).toBeCalledTimes(1);
    expect(processInput).toBeCalledWith(node, expect.anything(), {
      payload: "first",
    });
  });

  it("outputs the input message", async () => {
    const node = await initMockNode(wledNotificationNodeInitializer);
    jest.spyOn(node, "send");
    const inputHandler = node.getEventListener();
    const msg = { payload: "test message" };
    jest
      .spyOn(WledNotificationNode, "processInput")
      .mockImplementation(async (node, config, msg) => msg);

    await inputHandler(msg);

    expect(node.send).toBeCalledWith(msg);
  });

  it("catches and emits error objects", async () => {
    const node = await initMockNode(wledNotificationNodeInitializer);
    jest.spyOn(node, "error");
    const inputHandler = node.getEventListener();
    jest
      .spyOn(WledNotificationNode, "processInput")
      .mockRejectedValue(new Error("error object"));
    const msg = { payload: "error test message" };

    await inputHandler(msg);

    expect(node.error).toBeCalledWith("error object", msg);
  });

  it("catches and emits generic throws", async () => {
    const node = await initMockNode(wledNotificationNodeInitializer);
    jest.spyOn(node, "error");
    const inputHandler = node.getEventListener();
    jest
      .spyOn(WledNotificationNode, "processInput")
      .mockRejectedValue("string throw");
    const msg = { payload: "error test message" };

    await inputHandler(msg);

    expect(node.error).toBeCalledWith("Unknown error: string throw", msg);
  });
});
