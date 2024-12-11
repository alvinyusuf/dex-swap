'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BaseError, useAccount, useWatchAsset, useWatchContractEvent, useWriteContract } from 'wagmi'
import abiTokenFactory from '@/utils/abi/token-factory.json'

const createTokenFormSchema = z.object({
	tokenName: z.string().min(2, "Token name must be at least 2 characters").nonempty(),
	symbol: z.string().min(3, "Symbol must be at least 3 characters").nonempty(),
	initialSupply: z.preprocess((value) => parseInt(value as string, 10), z.number({ message: "Initial Supply must be a number" }).positive()),
})

type FormFieldConfig = {
	name: keyof z.infer<typeof createTokenFormSchema>
	label: string,
}

const formFields: FormFieldConfig[] = [
	{
		name: 'tokenName', label: 'Token Name'
	},
	{
		name: 'symbol', label: 'Symbol'
	},
	{
		name: 'initialSupply', label: 'Initial Supply'
	}
]

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

	const form = useForm<z.infer<typeof createTokenFormSchema>>({
		resolver: zodResolver(createTokenFormSchema),
		defaultValues: {
			tokenName: '',
			symbol: '',
			initialSupply: 0,
		}
	})

	useWatchContractEvent({
		address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN as `0x${string}`,
		abi,
		eventName: 'TokenCreated',
		enabled: isSuccess,
		onLogs(logs) {
			const tokenCreatedEvent = logs[0]
			setTokenCreationResult({
				success: true,
				tokenAddress: tokenCreatedEvent.args.tokenAddress,
			})

			watchAsset({
				type: 'ERC20',
				options: {
					address: tokenCreatedEvent.args.tokenAddress,
					symbol: form.getValues('symbol'),
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

	// Optional: Reset result ketika form baru di-submit
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
				},
				)
			} else {
				console.error("Account address is undefined");
			}
		} catch (error) {
			console.error("Submission error:", error);
		}
	}

	return (
		<div className='w-1/3 border rounded-sm p-4 space-y-4'>
			<h1>Create your token for testing</h1>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
					{formFields.map((formField) => (
						<FormField
							key={formField.name}
							control={form.control}
							name={formField.name}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{formField.label}</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					))}
					<Button disabled={isPending} type='submit' className='w-full'>Create Token</Button>
					{error && <p>Error: {(error as BaseError).shortMessage || error.message}</p>}
					{isPending && <p>Transaction pending</p>}
					{isSuccess && <p>Transaction success</p>}

					{error && <p className="text-red-500">Error: {(error as BaseError).shortMessage || error.message}</p>}
					{hash && <p>Transaction Hash: {hash}</p>}

					{tokenCreationResult.success && (
						<div className="text-green-500">
							Token berhasil dibuat di alamat: {tokenCreationResult.tokenAddress}
						</div>
					)}

					{tokenCreationResult.error && (
						<div className="text-red-500">
							Gagal membuat token: {tokenCreationResult.error}
						</div>
					)}
				</form>
			</Form>
		</div>
	)
}
