import React, { createContext, useContext, useMemo } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { createAbiHandlersMap } from './create-abi-handlers-map';
import { AbiMap, ContractToHandlersMap } from './types';

export function initUseWagmiContracts<T extends AbiMap>(abiMap: T) {
  const WagmiContractsContext = createContext<ContractToHandlersMap<T> | null>(
    null
  );

  function useContracts() {
    const value = useContext(WagmiContractsContext);
    if (value === null) {
      throw new Error('WagmiContractsProvider not found in React tree');
    }
    return value;
  }

  function WagmiContractsProvider({ children }: { children: React.ReactNode }) {
    const publicClient = usePublicClient();
    const walletClient = useWalletClient();
    const account = useAccount();

    const handlers = useMemo(() => {
      return createAbiHandlersMap(
        {
          publicClient,
          walletClient,
          account,
        },
        abiMap
      );
    }, [account, publicClient, walletClient]);

    return (
      <WagmiContractsContext.Provider value={handlers}>
        {children}
      </WagmiContractsContext.Provider>
    );
  }

  return { WagmiContractsProvider, useContracts };
}
