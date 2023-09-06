import { Abi, Address } from "abitype";
import type { Simplify } from "type-fest";
import { WagmiArgs, AbiFunctionTypes, HandlersMap } from "./types";
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";

export function createAbiMethodHandlers<TAbi extends Abi>(
  { publicClient, walletClient, account }: WagmiArgs,
  abi: TAbi,
  address: Address
) {
  const functionDefinitions = abi.filter(
    (item): item is AbiFunctionTypes<TAbi> => item.type === "function"
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (handlers[func.name] as any).useRead = (args: any) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useContractRead({
          abi,
          address,
          functionName: func.name,
          ...args,
        });
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (handlers[func.name] as any).useWrite = (
        args?: Record<string, unknown>
      ) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { config } = usePrepareContractWrite({
          abi: abi,
          address: address,
          functionName: func.name,
          ...args,
        });

        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useContractWrite(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          config
        );
      };
    }
  }

  return handlers as Simplify<HandlersMap<TAbi>>;
}
