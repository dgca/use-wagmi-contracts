import {
  Abi,
  AbiParameter,
  AbiParameterKind,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctions,
} from "abitype";
import { PublicClient, usePublicClient, useWalletClient } from "wagmi";
import { GetAccountResult } from "@wagmi/core";
import {
  ReadContractReturnType,
  SimulateContractReturnType,
  WriteContractReturnType,
} from "viem";

export type WagmiArgs = {
  publicClient: ReturnType<typeof usePublicClient>;
  walletClient: ReturnType<typeof useWalletClient>;
  account: GetAccountResult<PublicClient>;
};

export type AbiFunctionTypes<T extends Abi> = ExtractAbiFunctions<T>;
export type AbiFunctionMap<T extends Abi> = {
  [K in AbiFunctionTypes<T>["name"]]: Extract<AbiFunctionTypes<T>, { name: K }>;
};
export type HandlersMap<T extends Abi> = {
  [K in AbiFunctionTypes<T>["name"]]: (
    ...args: AbiParamsToPrimitivesTuple<
      ExtractAbiFunction<T, K>["inputs"],
      "inputs"
    >
  ) => AbiFunctionMap<T>[K]["stateMutability"] extends "view" | "pure"
    ? Promise<ReadContractReturnType<T, K>>
    : Promise<
        [WriteContractReturnType, SimulateContractReturnType<T, K>["result"]]
      >;
};

/**
 * Wraps AbiParametersToPrimitiveTypes for better tuple inference.
 */
export type AbiParamsToPrimitivesTuple<
  TAbiParameters extends readonly AbiParameter[],
  TAbiParameterKind extends AbiParameterKind = AbiParameterKind
> = AbiParametersToPrimitiveTypes<
  TAbiParameters,
  TAbiParameterKind
> extends Readonly<Array<unknown>>
  ? AbiParametersToPrimitiveTypes<TAbiParameters, TAbiParameterKind>
  : Array<unknown>;

export type AbiMapValue = {
  abi: Abi;
  defaultAddress?: string;
};

export type AbiMap = {
  [key: string]: AbiMapValue;
};

export type TypeChainFactory = {
  abi: Abi;
};

export type TypeChainObj = {
  [K: `${string}__factory`]: TypeChainFactory;
};

export type ContractToHandlersMap<T extends AbiMap> = {
  [K in keyof T]: T[K]["defaultAddress"] extends string
    ? (address?: string) => HandlersMap<T[K]["abi"]>
    : (address: string) => HandlersMap<T[K]["abi"]>;
};
