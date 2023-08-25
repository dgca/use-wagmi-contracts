import { Address } from 'abitype';
import { Simplify } from 'type-fest';
import { createAbiMethodHandlers } from './create-abi-method-handlers';
import { AbiMap, ContractToHandlersMap, WagmiArgs } from './types';

export function createAbiHandlersMap<TAbi extends AbiMap>(
  wagmiArgs: WagmiArgs,
  abiMap: TAbi
) {
  type BuiltContractToHandlersMap = ContractToHandlersMap<TAbi>;

  const result: {
    [key: string]: unknown;
  } = {};

  for (const [contractName, { abi, defaultAddress }] of Object.entries(
    abiMap
  )) {
    if (defaultAddress) {
      result[contractName] = (address?: Address) => {
        return createAbiMethodHandlers(
          wagmiArgs,
          abi,
          address ?? (defaultAddress as Address)
        );
      };
    } else {
      result[contractName] = (address: Address) => {
        return createAbiMethodHandlers(wagmiArgs, abi, address);
      };
    }
  }

  return result as Simplify<BuiltContractToHandlersMap>;
}
