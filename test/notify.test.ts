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

import { notify } from "../src/notify";
import { Effect, EffectConfig } from "../src/effects/Effect";
import { Mode, RgbColor } from "../src/WledUdpRealtimeProtocol";
import dgram, { SocketAsPromised } from "dgram-as-promised";

const mockSocket = {
  send: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
} as unknown as jest.Mocked<SocketAsPromised>;

jest.spyOn(dgram, "createSocket").mockImplementation(() => {
  return mockSocket;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe(notify, () => {
  it("opens socket, sends UDP datagrams, and closes socket", async () => {
    await notify("test-host", 567, mockEffect, {
      fps: 10,
      ledStart: 0,
      ledCount: 1,
    });

    expect(dgram.createSocket).toBeCalledTimes(1);
    expect(mockSocket.send).toBeCalledTimes(2);
    expect(mockSocket.close).toBeCalledTimes(1);
  });

  it("sends to specified host/port", async () => {
    await notify("test-host", 567, mockEffect, {
      fps: 10,
      ledStart: 0,
      ledCount: 1,
    });

    expect(dgram.createSocket).toBeCalledTimes(1);
    expect(mockSocket.send).toBeCalledTimes(2);
    expect(mockSocket.close).toBeCalledTimes(1);
    expect(mockSocket.send).toBeCalledWith(expect.anything(), 567, "test-host");
  });

  it("reject and closes socket on error", async () => {
    mockSocket.send.mockRejectedValue(new Error("test error"));

    const promise = notify("test-host", 567, mockEffect, {
      fps: 10,
      ledStart: 0,
      ledCount: 1,
    });

    await expect(promise).rejects.toThrowError("test error");
    expect(dgram.createSocket).toBeCalledTimes(1);
    expect(mockSocket.send).toBeCalledTimes(1);
    expect(mockSocket.close).toBeCalledTimes(1);
  });

  it("sends datagrams with header and data for all LEDs", async () => {
    const dataBuffers: Buffer[] = [];
    mockSocket.send.mockImplementation(
      async (data: Buffer | string | Uint8Array) => {
        dataBuffers.push(Buffer.from(data));
        return 0;
      }
    );

    await notify("test-host", 567, mockEffect, {
      fps: 10,
      ledStart: 1,
      ledCount: 2,
    });

    // Header + 2 x RGB
    expect(dataBuffers[0]).toEqual(
      Buffer.from([Mode.DNRGB, 1, 0, 1, 123, 124, 125, 123, 124, 125])
    );
  });

  it("sends final datagram which turns off LEDs", async () => {
    const dataBuffers: Buffer[] = [];
    mockSocket.send.mockImplementation(
      async (data: Buffer | string | Uint8Array) => {
        dataBuffers.push(Buffer.from(data));
        return 0;
      }
    );

    await notify("test-host", 567, mockEffect, {
      fps: 10,
      ledStart: 1,
      ledCount: 2,
    });

    // Header + 2 x RGB
    expect(dataBuffers[1]).toEqual(
      Buffer.from([Mode.DNRGB, 1, 0, 1, 0, 0, 0, 0, 0, 0])
    );
  });
});

/**
 * A mock effect which only produces one single frame.
 */
const mockEffect: Effect = {
  id: "mock-effect",
  name: "Mock Effect",
  generate: async function* mockEffect(
    config: EffectConfig,
    colorOut: RgbColor
  ) {
    colorOut[0] = 123;
    colorOut[1] = 124;
    colorOut[2] = 125;
    yield 0;
  },
};
