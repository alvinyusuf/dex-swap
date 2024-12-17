'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { State, WagmiProvider } from 'wagmi';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { getConfig } from '@/configs/wagmi';

const queryClient = new QueryClient();

export function Providers({ children, initialState }: { children: React.ReactNode, initialState?: State }) {
  const [config] = useState<ReturnType<typeof getConfig>>(() => getConfig())

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          locale='id-ID'
          theme={lightTheme({
            accentColor: '#00ADB5',
            accentColorForeground: '#EEEEEE'
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
