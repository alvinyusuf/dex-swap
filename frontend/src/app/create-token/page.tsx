'use client'

import React, { useEffect, useState } from 'react'
import { useAccount, useWatchAsset, useWatchContractEvent, useWriteContract } from 'wagmi'
import abiTokenFactory from '@/utils/abi/token-factory.json'
import TokenForm from './token-form'
import { z } from 'zod'
import type { createTokenFormSchema } from './token-form'

const abi = abiTokenFactory

export default function CreateToken() {
	const [tokenCreationResult, setTokenCreationResult] = useState<{
		success?: boolean
		tokenAddress?: string
		error?: string
	}>({})

	const account = useAccount()
	const { writeContract, data: hash, isPending, error, isSuccess } = useWriteContract()
	const { watchAsset } = useWatchAsset()

	useWatchContractEvent({
		address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN as `0x${string}`,
		abi,
		eventName: 'TokenCreated',
		enabled: isSuccess,
		onLogs(logs) {
			const tokenCreatedEvent = logs[0] as unknown as { args: { tokenAddress: string, symbol: string } }
			setTokenCreationResult({
				success: true,
				tokenAddress: tokenCreatedEvent.args.tokenAddress,
			})

			watchAsset({
				type: 'ERC20',
				options: {
					address: tokenCreatedEvent.args.tokenAddress,
					symbol: tokenCreatedEvent.args.symbol,
					decimals: 18,
				}
			})
		},
		onError(error) {
			setTokenCreationResult({
				success: false,
				error: error.message
			})
		},
	})

	useEffect(() => {
		if (isPending) {
			setTokenCreationResult({})
		}
	}, [isPending])

	async function onSubmit(values: z.infer<typeof createTokenFormSchema>) {
		try {
			if (account.address) {
				writeContract({
					address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN as `0x${string}`,
					abi,
					functionName: 'createToken',
					args: [account.address, BigInt(values.initialSupply), values.tokenName, values.symbol],
				})
			} else {
				console.error("Account address is undefined");
			}
		} catch (error) {
			console.error("Submission error:", error);
		}
	}

	return (
		<div className='w-1/3 flex flex-col items-center gap-y-4'>
			<h1 className='font-bold text-2xl text-primary'>Create new token for testing</h1>
			<TokenForm
				onSubmit={onSubmit}
				isPending={isPending}
				error={error}
				isSuccess={isSuccess}
				hash={hash}
				tokenCreationResult={tokenCreationResult}
			/>
		</div>
	)
}