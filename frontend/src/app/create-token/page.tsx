'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAccount, useTransactionReceipt, useWriteContract } from 'wagmi'
import abiTokenFactory from '@/utils/abi/token-factory.json'
import { type UseWriteContractReturnType } from 'wagmi'
import { WriteContractVariables } from 'wagmi/query'

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
    const { writeContract, data } = useWriteContract()

    const account = useAccount()

    // useEffect(() => {
    const result = useTransactionReceipt({
        hash: data
    })
    console.log("result:", result)
    // }, [data])

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
            let addressTx: any;

            writeContract(
                {
                    address: process.env.NEXT_PUBLIC_ADDRESS_FACTORY_TOKEN || '0x0',
                    abi: abiTokenFactory,
                    functionName: 'createToken',
                    args: [account.address, values.initialSupply, values.tokenName, values.symbol]
                },
                // {
                //     onSuccess: (data: WriteContractVariables) => {
                //         addressTx = data;
                //         console.log(addressTx);

                //     },
                //     onError: (error: any) => {
                //         console.log(error)
                //     }
                // }
            )
            // const tokenAddress = useTransactionReceipt({
            //     hash: 
            // })
            // console.log("hehehe", addressTx)

            console.log(values);
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
                    <Button type='submit' className='w-full'>Create Token</Button>
                </form>
            </Form>
        </div>
    )
}
