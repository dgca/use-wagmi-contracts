import { Abi, Address } from "abitype";
import type { Simplify } from "type-fest";
import { WagmiArgs, AbiFunctionTypes, HandlersMap } from "./types";

export function createAbiMethodHandlers<T extends Abi>(
  { publicClient, walletClient, account }: WagmiArgs,
  abi: T,
  address: Address
) {
  const functionDefinitions = abi.filter(
    (item): item is AbiFunctionTypes<T> => item.type === "function"
  );

  const handlers: {
    [key: string]: unknown;
  } = {};

  for (const func of functionDefinitions) {
    const isReadOnlyFunction =
      func.stateMutability === "view" || func.stateMutability === "pure";

    if (isReadOnlyFunction) {
      handlers[func.name] = async (...args: unknown[]) => {
        return publicClient.readContract({
          address,
          abi,
          functionName: func.name,
          args,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      };
    }

    if (!isReadOnlyFunction) {
      handlers[func.name] = async (...args: unknown[]) => {
        const { request, result } = await publicClient.simulateContract({
          abi,
          address,
          functionName: func.name,
          account: account.address,
          args,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const hash = await walletClient.data?.writeContract(request);
        return [hash, result];
      };
    }
  }

  return handlers as Simplify<HandlersMap<T>>;
}
