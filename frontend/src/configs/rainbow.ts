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
        {
            id: 401,
            name: 'Ozone Chain Testnet',
            nativeCurrency: { name: 'Ozone Chain Testnet', symbol: 'OZO', decimals: 18 },
            rpcUrls: {
                default: {
                    http: ['https://node1.testnet.ozonechain.io'],
                },
            },
            blockExplorers: {
                default: {
                    name: 'Ozone Chain Testnet Explorer',
                    url: 'https://testnet.ozonescan.io/',
                },
            },
            testnet: true,
        }
    ],
    ssr: true,
})
