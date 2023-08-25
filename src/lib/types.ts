import {
  Abi,
  AbiParameter,
  AbiParameterKind,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
  ExtractAbiFunctions,
} from "abitype";
import {
  PublicClient,
  UseContractReadConfig,
  UsePrepareContractWriteConfig,
  useContractWrite,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import {
  GetAccountResult,
  ReadContractResult,
  WriteContractMode,
} from "@wagmi/core";
import {
  ReadContractReturnType,
  SimulateContractReturnType,
  WriteContractReturnType,
} from "viem";
import { UseQueryResult } from "@tanstack/react-query";
import { Simplify } from "type-fest";

export type WagmiArgs = {
  publicClient: ReturnType<typeof usePublicClient>;
  walletClient: ReturnType<typeof useWalletClient>;
  account: GetAccountResult<PublicClient>;
};

export type AbiFunctionTypes<T extends Abi> = ExtractAbiFunctions<T>;
export type AbiFunctionMap<T extends Abi> = {
  [K in AbiFunctionTypes<T>["name"]]: Extract<AbiFunctionTypes<T>, { name: K }>;
};

export type ReadFn<
  TAbi extends Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi>
> = {
  (
    ...args: AbiParamsToPrimitivesTuple<
      ExtractAbiFunction<TAbi, TFunctionName>["inputs"],
      "inputs"
    >
  ): Promise<ReadContractReturnType<TAbi, TFunctionName>>;
  useRead: (
    useReadConfig?: Omit<
      UseContractReadConfig<
        TAbi,
        TFunctionName,
        ReadContractResult<TAbi, TFunctionName>
      >,
      "abi" | "address" | "functionName"
    >
  ) => UseQueryResult<ReadContractResult<TAbi, TFunctionName>, Error>;
};

type UseContractWriteReturn<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined
> = ReturnType<typeof useContractWrite<TAbi, TFunctionName, TMode>>;

export type WriteFn<
  TAbi extends Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi>
> = {
  (
    ...args: AbiParamsToPrimitivesTuple<
      ExtractAbiFunction<TAbi, TFunctionName>["inputs"],
      "inputs"
    >
  ): Promise<
    [
      WriteContractReturnType,
      SimulateContractReturnType<TAbi, TFunctionName>["result"]
    ]
  >;
  useWrite: (
    useWriteConfig?: Simplify<
      Omit<
        UsePrepareContractWriteConfig<TAbi, TFunctionName>,
        "abi" | "address" | "functionName"
      >
    >
  ) => UseContractWriteReturn<TAbi, TFunctionName, "prepared">;
};

export type HandlersMap<TAbi extends Abi> = {
  [KFunctionName in AbiFunctionTypes<TAbi>["name"]]: AbiFunctionMap<TAbi>[KFunctionName]["stateMutability"] extends
    | "view"
    | "pure"
    ? ReadFn<TAbi, KFunctionName>
    : WriteFn<TAbi, KFunctionName>;
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
