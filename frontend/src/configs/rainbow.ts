'use client'

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { arbitrum, base, mainnet, optimism, polygon, sepolia, liskSepolia, anvil } from "viem/chains"

export const rainbowConfig = getDefaultConfig({
    appName: 'Swap App',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
    chains: [
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia, liskSepolia, anvil] : []),
    ],
    ssr: true,
})
