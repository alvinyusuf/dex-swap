import { useReadContract } from 'wagmi';
import abi from '@/web3/abi/token-factory.json';

export interface TokenInfo {
  owner: `0x${string}`;
  initialSupply: bigint;
  name: string;
  symbol: string;
  creationTime: bigint;
}

export type TokenAddresses = `0x${string}`[];

const contractConfig = {
  address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN as `0x${string}`,
  abi,
};

export function useAllTokens() {
  return useReadContract({
    ...contractConfig,
    functionName: 'getAllTokens',
  }) as { data: TokenAddresses | undefined; isLoading: boolean; error: Error | null };
}

export function useTokenInfo(tokenAddress: `0x${string}`) {
  const { data, isLoading, error }: { data: string[] | undefined; isLoading: boolean; error: Error | null } = useReadContract({
    ...contractConfig,
    functionName: 'getTokenInfo',
    args: [tokenAddress],
  });

  const tokenInfo = data
    ? {
      owner: data[0] as `0x${string}`,
      initialSupply: BigInt(data[1]),
      name: data[2] as string,
      symbol: data[3] as string,
      creationTime: BigInt(data[4]),
    }
    : undefined;

  return { data: tokenInfo, isLoading, error };
}
