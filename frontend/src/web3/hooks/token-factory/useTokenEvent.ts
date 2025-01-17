import { useCallback, useState } from 'react';
import { useWatchAsset, useWatchContractEvent } from 'wagmi';
import abiTokenFactory from '@/web3/abi/token-factory.json';

export interface TokenCreationResult {
  success?: boolean;
  tokenAddress?: string;
  symbol?: string;
  error?: string;
}

export function useTokenEvent(isSuccess: boolean) {
  const [tokenCreationResult, setTokenCreationResult] = useState<TokenCreationResult>({});
  const { watchAsset } = useWatchAsset();

  const resetTokenCreationResult = useCallback(() => {
    setTokenCreationResult({});
  }, []);

  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN as `0x${string}`,
    abi: abiTokenFactory,
    eventName: 'TokenCreated',
    enabled: isSuccess,
    onLogs(logs) {
      const tokenCreatedEvent = logs[0] as unknown as {
        args: { tokenAddress: string; symbol: string }
      };
      setTokenCreationResult({
        success: true,
        tokenAddress: tokenCreatedEvent.args.tokenAddress,
        symbol: tokenCreatedEvent.args.symbol,
      });

      try {
        try {
          watchAsset({
            type: 'ERC20',
            options: {
              address: tokenCreatedEvent.args.tokenAddress,
              symbol: tokenCreatedEvent.args.symbol,
              decimals: 18,
            }
          });
        } catch (error) {
          console.error('Failed to add token to wallet:', error);
        }
      } catch (error) {
        console.error('Error watching asset:', error);
      }
    },
    onError(error) {
      setTokenCreationResult({
        success: false,
        error: error.message,
      });
    },
  });

  return { tokenCreationResult, resetTokenCreationResult };
}