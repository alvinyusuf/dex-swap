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
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { AlertDialogAction, AlertDialogTitle } from '@radix-ui/react-alert-dialog'

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
		<div className='w-1/3 flex flex-col items-center gap-y-4'>
			<h1 className='font-bold text-2xl text-primary'>Create new token for testing</h1>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='w-full border border-foreground rounded-lg p-4 space-y-4'>
					{formFields.map((formField) => (
						<FormField
							key={formField.name}
							control={form.control}
							name={formField.name}
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-primary font-semibold'>{formField.label}</FormLabel>
									<FormControl>
										<Input {...field} className='border-foreground' />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					))}
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button disabled={isPending} type='submit' className='w-full bg-foreground'>Create Token</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Please waiting for transaction confirmation
								</AlertDialogTitle>
								<AlertDialogDescription>
									{error && <p>Error: {(error as BaseError).shortMessage || error.message}</p>}
									{isPending && <p>Transaction pending</p>}
									{isSuccess && <p>Transaction success</p>}

									{error && <p className="text-red-500">Error: {(error as BaseError).shortMessage || error.message}</p>}
									{hash && <p>Transaction Hash: {hash}</p>}

									{tokenCreationResult.success && (
										<div className="text-green-500">
											Token berhasil dibuat di alamat: {tokenCreationResult.tokenAddress}
											{/* <Text */}
										</div>
									)}

									<div className="w-full max-w-[16rem]">
										<div className="relative">
											<label htmlFor="npm-install-copy-button" className="sr-only">Label</label>
											<input id="npm-install-copy-button" type="text" className="col-span-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value="npm install flowbite" disabled readOnly />
												<button data-copy-to-clipboard-target="npm-install-copy-button" data-tooltip-target="tooltip-copy-npm-install-copy-button" className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 inline-flex items-center justify-center">
													<span id="default-icon">
														<svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
															<path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
														</svg>
													</span>
													<span id="success-icon" className="hidden inline-flex items-center">
														<svg className="w-3.5 h-3.5 text-blue-700 dark:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
															<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
														</svg>
													</span>
												</button>
												<div id="tooltip-copy-npm-install-copy-button" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
													<span id="default-tooltip-message">Copy to clipboard</span>
													<span id="success-tooltip-message" className="hidden">Copied!</span>
													<div className="tooltip-arrow" data-popper-arrow></div>
												</div>
										</div>
									</div>

									{tokenCreationResult.error && (
										<div className="text-red-500">
											Gagal membuat token: {tokenCreationResult.error}
										</div>
									)}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogAction asChild>
									<Button>Finish</Button>
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</form>
			</Form>
		</div>
	)
}
