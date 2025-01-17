import { type Address } from 'viem';
import abiTokenFactory from '../abi/token-factory.json';

export const FactoryTokenContract = {
  address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN as Address,
  abi: abiTokenFactory,
  functions: {
    createToken: {
      name: 'createToken' as const,
      createArgs: (
        ownerAddress: Address,
        initialSupply: bigint,
        tokenName: string,
        symbol: string
      ) => {
        return [ownerAddress, initialSupply, tokenName, symbol] as const
      }
    },
    getAllTokens: {
      name: 'getAllTokens' as const
    },
    getOwnerTokens: {
      name: 'getOwnerTokens' as const,
      createArgs: (ownerAddress: Address) => {
        return [ownerAddress] as const
      }
    },
    getTokenInfo: {
      name: 'getTokenInfo' as const,
      createArgs: (tokenAddress: Address) => {
        return [tokenAddress] as const
      }
    }
  }
}


export type TokenCreatedEvent = {
  args: {
    tokenAddress: Address
    owner: Address
    initialSupply: bigint
  }
}

export type TokenInfo = {
  owner: Address
  initialSupply: bigint
  name: string
  symbol: string
  creationTime: bigint
}