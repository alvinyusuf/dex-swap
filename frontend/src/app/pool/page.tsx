'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
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
  const { writeContract: writeContractAddPair, data: hashPair, isPending: isPendingPair, error: errorPair } = useWriteContract()
  const { writeContract: writeContractAproveA, data: hashA, isPending: isPendingA, error: errorA } = useWriteContract()
  const { writeContract: writeContractAproveB, data: hashB, isPending: isPendingB, error: errorB } = useWriteContract()

  const [values, setValues] = useState({
    tokenAAddress: '',
    tokenBAddress: '',
    tokenAAmount: 0,
    tokenBAmount: 0,
  })

  const [transactionHashes, setTransactionHashes] = useState({
    approveA: '',
    approveB: '',
    addLiquidity: ''
  })

  const [transactionStage, setTransactionStage] = useState<'idle' | 'approveA' | 'approveB' | 'addLiquidity' | 'completed'>('idle')

  const form = useForm<z.infer<typeof createPoolFormSchema>>({
    resolver: zodResolver(createPoolFormSchema),
    defaultValues: {
      tokenAAddress: '',
      tokenBAddress: '',
      tokenAAmount: 0,
      tokenBAmount: 0,
    }
  })

  const { isSuccess: isApproveASuccess, isError: isApproveAError } = useWaitForTransactionReceipt({
    hash: hashA
  })

  const { isSuccess: isApproveBSuccess, isError: isApproveBError } = useWaitForTransactionReceipt({
    hash: hashB
  })

  const { isSuccess: isAddLiquiditySuccess, isError: isAddLiquidityError } = useWaitForTransactionReceipt({
    hash: hashPair
  })

  // Reset mekanisme jika ada error
  useEffect(() => {
    if (isApproveAError || isApproveBError || isAddLiquidityError) {
      setTransactionStage('idle')
    }
  }, [isApproveAError, isApproveBError, isAddLiquidityError])

  // Alur transaksi dengan mekanisme stage yang jelas
  useEffect(() => {
    if (transactionStage === 'approveA' && isApproveASuccess) {
      writeContractAproveB({
        address: values.tokenBAddress as `0x${string}`,
        abi: abiErc20,
        functionName: 'approve',
        args: [process.env.NEXT_PUBLIC_ADDRESS_ROUTER as `0x${string}`, BigInt(values.tokenBAmount * 10 ** 18)],
      })
      setTransactionStage('approveB')
    }
  }, [transactionStage, isApproveASuccess, values])

  useEffect(() => {
    if (transactionStage === 'approveB' && isApproveBSuccess) {
      writeContractAddPair({
        address: process.env.NEXT_PUBLIC_ADDRESS_ROUTER as `0x${string}`,
        abi: abiRouter,
        functionName: 'addLiquidity',
        args: [
          values.tokenAAddress as `0x${string}`,
          values.tokenBAddress as `0x${string}`,
          BigInt(values.tokenAAmount * 10 ** 18),
          BigInt(values.tokenBAmount * 10 ** 18),
        ],
      })
      setTransactionStage('addLiquidity')
    }
  }, [transactionStage, isApproveBSuccess, values])

  useEffect(() => {
    if (transactionStage === 'addLiquidity' && isAddLiquiditySuccess) {
      setTransactionStage('completed')

      // Reset form dan stage setelah beberapa detik
      const timer = setTimeout(() => {
        setTransactionStage('idle')
        form.reset() // Reset form react-hook-form
      }, 3000) // Misalnya tunggu 3 detik sebelum reset

      // Bersihkan timer untuk mencegah memory leak
      return () => clearTimeout(timer)
    }
  }, [transactionStage, isAddLiquiditySuccess, form])

  async function onSubmit(formValues: z.infer<typeof createPoolFormSchema>) {
    try {
      if (account.address) {
        setValues(formValues)
        writeContractAproveA({
          address: formValues.tokenAAddress as `0x${string}`,
          abi: abiErc20,
          functionName: 'approve',
          args: [process.env.NEXT_PUBLIC_ADDRESS_ROUTER as `0x${string}`, BigInt(formValues.tokenAAmount * 10 ** 18)],
        })
        setTransactionStage('approveA')
      } else {
        console.error("Account address is undefined");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setTransactionStage('idle')
    }
  }

  // Tambahkan di useEffect untuk setiap tahap
  useEffect(() => {
    if (hashA) {
      setTransactionHashes(prev => ({
        ...prev,
        approveA: hashA
      }))
    }
  }, [hashA])

  useEffect(() => {
    if (hashB) {
      setTransactionHashes(prev => ({
        ...prev,
        approveB: hashB
      }))
    }
  }, [hashB])

  useEffect(() => {
    if (hashPair) {
      setTransactionHashes(prev => ({
        ...prev,
        addLiquidity: hashPair
      }))
    }
  }, [hashPair])

  return (
    <div className='w-1/3 flex flex-col items-center gap-y-4'>
      <h1 className='font-bold text-2xl text-primary'>Create your pool</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full border border-foreground rounded-lg p-4 space-y-4'>
          {formFields.map((formField) => (
            <FormField
              key={formField.name}
              control={form.control}
              name={formField.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold text-primary'>{formField.label}</FormLabel>
                  <FormControl>
                    <Input {...field} className='border-foreground' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            disabled={transactionStage !== 'idle'}
            type='submit'
            className='w-full bg-foreground'
          >
            Create Pool
          </Button>
          {/* Tampilkan hash transaksi */}
          {transactionHashes.approveA && (
            <div className="text-sm">
              Approve A Hash: {transactionHashes.approveA}
            </div>
          )}
          {transactionHashes.approveB && (
            <div className="text-sm">
              Approve B Hash: {transactionHashes.approveB}
            </div>
          )}
          {transactionHashes.addLiquidity && (
            <div className="text-sm">
              Add Liquidity Hash: {transactionHashes.addLiquidity}
            </div>
          )}

          {(isPendingA || isPendingB || isPendingPair) && <p>Transaction pending: {transactionStage}</p>}

          {/* Error handling */}
          {errorA && <p className="text-red-500">Error A: {errorA.message}</p>}
          {errorB && <p className="text-red-500">Error B: {errorB.message}</p>}
          {errorPair && <p className="text-red-500">Error Pair: {errorPair.message}</p>}

          {transactionStage === 'completed' && (
            <div className="text-green-500 mt-2">
              Pool creation successful!
              <p>You have successfully created a liquidity pool with the selected tokens.</p>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}