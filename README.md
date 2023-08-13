# `use-wagmi-contracts`

## Description

This project includes a set of tools to transform Solidity contract ABIs into structured objects containing all contract methods. All methods are strongly typed, and both read and write methods are included.

It also includes a React hook to automatically provide the required `wagmi` arguments to the contract methods, and a way to provide a default contract address for each of your contracts.

Finally, it includes a utility for those using TypeChain to make processing your contract ABIs even easier.

## Requirements

- React 18+
- Viem 0.x
- Wagmi 1.x
  - Note this library does not work with previous verisons of `wagmi` that used `ethers`.
  - If you are using older versions of `wagmi` + `ethers`, check out [`use-typechain-contracts`](https://www.npmjs.com/package/use-typechain-contracts).

## Installation

```
yarn add @type_of/use-wagmi-contracts
# or
npm install @type_of/use-wagmi-contracts
```

## Recommended Usage

The recommended way to use this library is to use the `WagmiContractsProvider` component to wrap your app. This will give you a convenient `useContracts()` hook that you can use to access your contracts, and all contract methods will have the appropriate `wagmi` arguments bound to them already.

### Setup

To keep things organized, create a new file to initialize the library. In this example, we'll refer to this as `/path/to/WagmiContractsProvider`.

Initialize the library using `initUseWagmiContracts`. It expects an `AbiMap`, which is an object with the following shape below.

```tsx
const abiMap = {
  ContractName: {
    abi: ContractAbi,
    defaultAddress: "0x1234...", // Optional
  },
  OtherContract: {
    abi: OtherAbi,
  },
  ...
}
```

---

#### <span style="color:red">Note to TypeChain users:</span>

If you are using the TypeChain library to generate your contract ABIs, you can use the `processTypechainAbis` function to generate the `AbiMap` for you. See the "Using TypeChain" section.

---

The keys of the `AbiMap` are the names that you'll use later to refer to your contracts. `defaultAddress` is optional, and can be used to provide a default address for your contract. If you don't provide a default address, you'll need to provide one when you call the contract methods.

Once you have your `AbiMap`, you can initialize the library by calling `initUseWagmiContracts` with your `AbiMap`.

This returns an object with two properties: `WagmiContractsProvider` and `useContracts`. Export these for later consumption.

```tsx
// /path/to/WagmiContractsProvider.tsx
import { initUseWagmiContracts } from "@type_of/use-wagmi-contracts";

const abiMap = {...};

const { WagmiContractsProvider, useContracts } = initUseWagmiContracts(abiMap);

export { WagmiContractsProvider, useContracts };
```

### Using TypeChain

If you use TypeChain to generate your contract ABIs, you can use the `processTypechainAbis` function to generate the `AbiMap` for you. Assuming you have a `typechain-types` directory in your project, you can do the following:

```tsx
// /path/to/WagmiContractsProvider.tsx
import { initUseWagmiContracts,  } from "@type_of/use-wagmi-contracts";
import * as typechain from '/path/to/typechain-types';

const abiMap = processTypechainAbis(typechain, {
  ContractName: {
    defaultAddress: "0x1234...",
  },
});

const { WagmiContractsProvider, useContracts } = initUseWagmiContracts(abiMap);

export { WagmiContractsProvider, useContracts };
```

The second argument to `processTypechainAbis` is an object that allows you to provide default addresses for your contracts. If you don't provide a default address, you'll need to provide one when you call the contract methods.

### Wrapping your app with `WagmiContractsProvider`

Next, wrap your app with the `WagmiContractsProvider` component you created. Note that this must go inside the `<WagmiConfig>` component since calls `wagmi` hooks.

```tsx
import { WagmiContractsProvider } from "/path/to/WagmiContractsProvider";

export function App({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <WagmiContractsProvider>
        {children}
      </WagmiContractsProvider>
    </WagmiConfig>
  )
}
```

That's it! You can now use the `useContracts` hook to access your contracts and call their methods.

### Communicating with contracts

To communicate with your your contracts, use the `useContracts` hook. This hook returns a map of your contracts, with each contract containing a map of its methods.

Say we have a very simple contract that looks like this:

```js
contract ValueStore {
  bool public value = false;

  function getValue() external view returns(bool) {
    return value;
  }

  function setValue(bool _nextValue) external returns(bool) {
    value = _nextValue;
    return value;
  }
}
```

Assume we named this contract "ValueStore" in the `AbiMap`, and we provided a default address. If we want to get the value, we can do the following:

(Note that this is a very bare bones approach to data fetching, and I would recommend using something like `@tanstack/react-query` to handle caching and data invalidation.)

```tsx
import { useContracts } from "/path/to/WagmiContractsProvider";

function GetValueDemo() {
  const contracts = useContracts();
  const [value, setValue] = useState<boolean | null>(null);

  useEffect(() => {
    const getValue = async () => {
      /**
       * Note that we don't need to provide an address to `ValueStore()` since we
       * provided a default address in * the AbiMap.
       *
       * Also note that getValue takes no arguments because the contract method also
       * takes no arguments. We'll see an example that takes arguments below.
       */
      const value = await contracts.ValueStore().getValue();
      setValue(value);
    }

    getValue();
  }, [contracts]);

  if (value === null) return null;

  return (
    <p>The value is: {value ? 'TRUE' : 'FALSE'}</p>
  );
}
```

That's a very simple example of a read method. Now, let's look at a write method.

```tsx
import { useContracts } from "/path/to/WagmiContractsProvider";

function SetValueDemo() {
  const contracts = useContracts();
  const [lastWrittenValue, setLastWrittenValue] = useState<boolean | null>(null);

  const handleWrite = useCallback(async () => {
    try {
      /**
       * The function signature for `setValue` will be typed based on the contract ABI.
       *
       * Unlike read methods, write methods return a tuple of `[hash, result]``. The hash
       * is the transaction hash, and the result is the return value of the method. If the
       * method doesn't return anything, the result will be `undefined`.
       */
      const [hash, result] = await contracts.ValueStore().setValue(Math.random() > 0.5);
      setLastWrittenValue(result);
      console.log('Success!');
    } catch (err) {
      console.error(err);
    }
  }, [contracts]);

  return (
    <div>
      <p>
        The last written value was: {lastWrittenValue === null
          ? 'null'
          : lastWrittenValue ? 'TRUE' : 'FALSE'}
      </p>
      <button onClick={handleWrite}>
        Set Random Value
      </button>
    </div>
  );
}
```
