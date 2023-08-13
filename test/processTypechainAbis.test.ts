import { describe, it, expect } from "vitest";
import * as typechain from "../demo-contracts/typechain-types";
import { processTypechainAbis } from "../src";

const abis = processTypechainAbis(typechain, {
  Todos: "0x0000000000000000000000000000000000000000",
});

describe("processTypechainAbis", () => {
  it("creates typechain abi map", () => {
    expect(abis).toHaveProperty("Todos");
    expect(abis).toHaveProperty("DemoToken");
  });
});
