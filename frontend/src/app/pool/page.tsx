'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { z } from 'zod'
import abiRouter from '@/utils/abi/router.json'
import abiErc20 from '@/utils/abi/erc20.json'
import PoolForm from './pool-form'
import { createPoolFormSchema } from '@/types/pool-form'

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
      }, 3000) // Misalnya tunggu 3 detik sebelum reset

      // Bersihkan timer untuk mencegah memory leak
      return () => clearTimeout(timer)
    }
  }, [transactionStage, isAddLiquiditySuccess])

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
      <PoolForm
        onSubmit={onSubmit}
        isPendingA={isPendingA}
        isPendingB={isPendingB}
        isPendingPair={isPendingPair}
        errorA={errorA}
        errorB={errorB}
        errorPair={errorPair}
        transactionHashes={transactionHashes}
        transactionStage={transactionStage}
      />
    </div>
  )
}