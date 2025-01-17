import { useTokenWrite } from './useTokenWrite';
import { useTokenEvent } from './useTokenEvent';
import { useEffect } from 'react';

export function useTokenFactory() {
  const { createToken, hash, isPending, error, isSuccess } = useTokenWrite();
  const { tokenCreationResult, resetTokenCreationResult } = useTokenEvent(isSuccess);

  useEffect(() => {
    if (isPending) {
      resetTokenCreationResult();
    }
  }, [isPending, resetTokenCreationResult]);

  return {
    createToken,
    hash,
    isPending,
    error,
    isSuccess,
    tokenCreationResult,
  };
}