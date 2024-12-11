'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { BaseError, useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { z } from 'zod'
import abiRouter from '@/utils/abi/router.json'
import abiErc20 from '@/utils/abi/erc20.json'

const createPoolFormSchema = z.object({
  tokenAAddress: z.string(),
  tokenBAddress: z.string(),
  tokenAAmount: z.preprocess((value) => parseInt(value as string, 10), z.number({ message: "Amount of token A be a number" }).positive()),
  tokenBAmount: z.preprocess((value) => parseInt(value as string, 10), z.number({ message: "Amount of token B be a number" }).positive()),
})

type FormFieldConfig = {
  name: keyof z.infer<typeof createPoolFormSchema>
  label: string,
}

const formFields: FormFieldConfig[] = [
  { name: 'tokenAAddress', label: 'Token A Address' },
  { name: 'tokenBAddress', label: 'Token B Address' },
  { name: 'tokenAAmount', label: 'Token A Amount' },
  { name: 'tokenBAmount', label: 'Token B Amount' }
]

export default function Pool() {
  const account = useAccount()
  const { writeContract: writeContractAproveA, data: hashA, isPending: isPendingA, error: errorA, isSuccess: isSuccessA } = useWriteContract()
  const { writeContract: writeContractAproveB, data: hashB, isPending: isPendingB, error: errorB, isSuccess: isSuccessB } = useWriteContract()
  const { writeContract, data: hash, isPending, error, isSuccess } = useWriteContract()
  const [values, setValues] = useState({
    tokenAAddress: '',
    tokenBAddress: '',
    tokenAAmount: 0,
    tokenBAmount: 0,
  })

  const { data: receiptA } = useWaitForTransactionReceipt({ hash: hashA })

  const form = useForm<z.infer<typeof createPoolFormSchema>>({
    resolver: zodResolver(createPoolFormSchema),
    defaultValues: {
      tokenAAddress: '',
      tokenBAddress: '',
      tokenAAmount: 0,
      tokenBAmount: 0,
    }
  })

  const result = useWaitForTransactionReceipt({
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
  })

  async function onSubmit(valuesForm: z.infer<typeof createPoolFormSchema>) {
    try {
      if (account.address) {
        setValues(valuesForm)
        writeContractAproveA({
          address: values.tokenAAddress as `0x${string}`,
          abi: abiErc20,
          functionName: 'approve',
          args: [process.env.NEXT_PUBLIC_ADDRESS_ROUTER as `0x${string}`, BigInt(values.tokenAAmount * 10 ** 18)],
        })
      } else {
        console.error("Account address is undefined");
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  }

  // useEffect(() => {
  //   writeContractAproveA({
  //     address: values.tokenAAddress as `0x${string}`,
  //     abi: abiErc20,
  //     functionName: 'approve',
  //     args: [process.env.NEXT_PUBLIC_ADDRESS_ROUTER as `0x${string}`, BigInt(values.tokenAAmount * 10 ** 18)],
  //   })
  // }, [values])

  useEffect(() => {
    writeContractAproveB({
      address: values.tokenBAddress as `0x${string}`,
      abi: abiErc20,
      functionName: 'approve',
      args: [process.env.NEXT_PUBLIC_ADDRESS_ROUTER as `0x${string}`, BigInt(values.tokenBAmount * 10 ** 18)],
    })
  }, [isSuccessA === true, receiptA])

  useEffect(() => {
    writeContract({
      address: process.env.NEXT_PUBLIC_ADDRESS_ROUTER as `0x${string}`,
      abi: abiRouter,
      functionName: 'addLiquidity',
      args: [values.tokenAAddress, values.tokenBAddress, BigInt(values.tokenAAmount * 10 ** 18), BigInt(values.tokenBAmount * 10 ** 18)],
    })
  }, [isSuccessB === true, isPendingA === false, isPendingB === false])

  return (
    <div className='w-1/3 border rounded-sm p-4 space-y-4'>
      <h1>Create your pool</h1>
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
          <Button disabled={isPendingA || isPendingB || isPendingB} type='submit' className='w-full'>Create Pool</Button>
          {error && <p>Error: {(error as BaseError).shortMessage || error.message}</p>}
          {isPending && <p>Transaction pending</p>}
          {isSuccess && <p>Transaction success</p>}

          {error && <p className="text-red-500">Error: {(error as BaseError).shortMessage || error.message}</p>}
          {hash && <p>Transaction Hash: {hash}</p>}
        </form>
      </Form>
    </div>
  )
}
