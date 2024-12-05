'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BaseError, useAccount, useTransactionReceipt, useWaitForTransactionReceipt, useWatchContractEvent, useWriteContract } from 'wagmi'
import abiTokenFactory from '@/utils/abi/token-factory.json'
import { keccak256, WaitForTransactionReceiptReturnType } from 'viem'

let hash

const createTokenFormSchema = z.object({
    tokenName: z.string().min(2, "Token name must be at least 2 characters").nonempty(),
    symbol: z.string().min(3, "Symbol must be at least 3 characters").nonempty(),
    initialSupply: z.preprocess((value) => parseInt(value as string, 10), z.number({ message: "Initial Supply must be a number" }).positive()),
})

type FormFieldConfig = {
    name: keyof z.infer<typeof createTokenFormSchema>
    label: string,
}

export default function CreateToken() {
    const [transactionReceipt, setTransactionReceipt] = React.useState<WaitForTransactionReceiptReturnType | null>(null);

    const account = useAccount()
    const { writeContract, data: hash, isPending, error } = useWriteContract()

    const form = useForm<z.infer<typeof createTokenFormSchema>>({
        resolver: zodResolver(createTokenFormSchema),
        defaultValues: {
            tokenName: '',
            symbol: '',
            initialSupply: 0,
        }
    })

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

    async function onSubmit(values: z.infer<typeof createTokenFormSchema>) {
        try {
            writeContract(
                {
                    address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN,
                    abi: abiTokenFactory,
                    functionName: 'createToken',
                    args: [account.address, values.initialSupply, values.tokenName, values.symbol]
                },
            )
        } catch (error) {
            console.error("Submission error:", error);
        }
    }

    // useEffect(() => {
    //     async function fetchTransactionReceipt() {
    //         if (hash) {
    //             try {
    //                 const receipt = await useWaitForTransactionReceipt({ hash })
    //                 console.log('Transaction Receipt:', receipt);
    //                 setTransactionReceipt(receipt);
    //             } catch (error) {
    //                 console.error('Transaction error:', error);
    //             }
    //         }
    //     }
    //     fetchTransactionReceipt();
    // }, [hash]);


    // const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    const { data } = useWaitForTransactionReceipt({
        hash,
    })

    useEffect(() => console.log('Transaction Receipt:', data), [data])

    useWatchContractEvent({
        address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN,
        abi: abiTokenFactory,
        eventName: 'TokenCreated',
        onLogs(logs) {
            console.log('Token Created:', logs)
        }
    })

    // const transactionRecipt: any = useWaitForTransactionReceipt({
    //     hash,
    // })

    // useEffect(() => console.log('Transaction Receipt:', transactionRecipt), [transactionRecipt])

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
                    {hash && <p>Transaction Hash: {hash}</p>}
                    {/* {isConfirming && <p>Wait for confirmation...</p>}
                    {isConfirmed && <p>Transaction confirmed!</p>} */}
                </form>
            </Form>
        </div>
    )
}
