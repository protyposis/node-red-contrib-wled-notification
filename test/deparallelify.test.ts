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

import { deparallelify } from "../src/deparallelify";
import { createNodeMock } from "./nodeMock";

describe(deparallelify, () => {
  it("executes first call", async () => {
    const node = createNodeMock();

    const result = await deparallelify(node, async () => {
      return "test";
    });

    expect(result).toBe("test");
  });

  it("discards second call", async () => {
    const node = createNodeMock();
    let executionCount = 0;

    deparallelify(node, async () => {
      executionCount++;
      // Keep function pending
      await new Promise<void>(() => {});
    });

    await deparallelify(node, async () => {
      executionCount++;
    });

    expect(executionCount).toBe(1);
  });
});
