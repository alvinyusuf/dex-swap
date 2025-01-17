import { useAccount, useWriteContract } from 'wagmi';
import abiTokenFactory from '@/web3/abi/token-factory.json';

export function useTokenWrite() {
  const account = useAccount();
  const { writeContract, data: hash, isPending, error, isSuccess } = useWriteContract();

  const createToken = async (tokenName: string, symbol: string, initialSupply: number) => {
    try {
      if (account.address) {
        writeContract({
          address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN as `0x${string}`,
          abi: abiTokenFactory,
          functionName: 'createToken',
          args: [account.address, BigInt(initialSupply), tokenName, symbol],
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return { createToken, hash, isPending, error, isSuccess };
}