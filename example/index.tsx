import React, { useCallback, useEffect, useState } from "react";
import "react-app-polyfill/ie11";
import * as ReactDOM from "react-dom";
import * as typechain from "../demo-contracts/typechain-types";
import { initUseWagmiContracts, processTypechainAbis } from "../src";
import { createConfig, useAccount, WagmiConfig } from "wagmi";

const abiMap = processTypechainAbis(typechain, {
  Todos: "0x0000000000000000000000000000000000000000",
});

const { WagmiContractsProvider, useContracts } = initUseWagmiContracts(abiMap);

const wagmiConfig = createConfig({
  autoConnect: true,
  // Note this config is missing required properties
} as any);

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <WagmiContractsProvider>
        <Demo />
      </WagmiContractsProvider>
    </WagmiConfig>
  );
}

const TEST_ADDRESS = "0x0000000000000000000000000000000000000000";

function useMintTokens() {
  const contracts = useContracts();
  return useCallback(async () => {
    const [hash, result] = await contracts.DemoToken(TEST_ADDRESS).mint();
    console.log(`Success! Tx hash: ${hash}`, result);
  }, [contracts]);
}

function useTestPure() {
  const contracts = useContracts();
  return useCallback(async () => {
    const result = await contracts.DemoToken(TEST_ADDRESS).testPure();
    console.log('Works if it says "pure": ', result);
  }, [contracts]);
}

function Demo() {
  const contracts = useContracts();
  const account = useAccount();

  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);

  useEffect(() => {
    const doFetch = async () => {
      if (!account.address) return;
      const balance = await contracts
        .DemoToken(TEST_ADDRESS)
        .balanceOf(account.address);
      setTokenBalance(balance);
    };

    doFetch();
  }, []);

  const createTodo = useCallback(async (todo: string) => {
    try {
      const hash = await contracts.Todos().create(todo);
      console.log(`Success! Tx hash: ${hash}`);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
      }
    }
  }, []);

  return (
    <div>
      <h1>Use Wagmi Contracts Demo</h1>
      <p>My token balance: {tokenBalance?.toString() ?? "—"}</p>

      <div>
        <button
          onClick={() => {
            createTodo("Do something cool");
          }}
        >
          Make Todo
        </button>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
