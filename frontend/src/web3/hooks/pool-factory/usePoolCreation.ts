'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { z } from 'zod'
import abiRouter from '@/utils/abi/router.json'
import abiErc20 from '@/utils/abi/erc20.json'
import { createPoolFormSchema } from '@/types/pool-form'

type TransactionStage = 'idle' | 'approveA' | 'approveB' | 'addLiquidity' | 'completed'

type PoolValues = {
  tokenAAddress: string
  tokenBAddress: string
  tokenAAmount: number
  tokenBAmount: number
}

type TransactionHashes = {
  approveA: string
  approveB: string
  addLiquidity: string
}

export function usePoolCreation() {
  const account = useAccount()
  const { writeContract: writeContractAddPair, data: hashPair, isPending: isPendingPair, error: errorPair } = useWriteContract()
  const { writeContract: writeContractAproveA, data: hashA, isPending: isPendingA, error: errorA } = useWriteContract()
  const { writeContract: writeContractAproveB, data: hashB, isPending: isPendingB, error: errorB } = useWriteContract()

  const [values, setValues] = useState<PoolValues>({
    tokenAAddress: '',
    tokenBAddress: '',
    tokenAAmount: 0,
    tokenBAmount: 0,
  })

  const [transactionHashes, setTransactionHashes] = useState<TransactionHashes>({
    approveA: '',
    approveB: '',
    addLiquidity: ''
  })

  const [transactionStage, setTransactionStage] = useState<TransactionStage>('idle')

  const { isSuccess: isApproveASuccess, isError: isApproveAError } = useWaitForTransactionReceipt({
    hash: hashA
  })

  const { isSuccess: isApproveBSuccess, isError: isApproveBError } = useWaitForTransactionReceipt({
    hash: hashB
  })

  const { isSuccess: isAddLiquiditySuccess, isError: isAddLiquidityError } = useWaitForTransactionReceipt({
    hash: hashPair
  })

  useEffect(() => {
    if (isApproveAError || isApproveBError || isAddLiquidityError) {
      setTransactionStage('idle')
    }
  }, [isApproveAError, isApproveBError, isAddLiquidityError])

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
      const timer = setTimeout(() => {
        setTransactionStage('idle')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [transactionStage, isAddLiquiditySuccess])

  useEffect(() => {
    if (hashA) {
      setTransactionHashes(prev => ({ ...prev, approveA: hashA }))
    }
  }, [hashA])

  useEffect(() => {
    if (hashB) {
      setTransactionHashes(prev => ({ ...prev, approveB: hashB }))
    }
  }, [hashB])

  useEffect(() => {
    if (hashPair) {
      setTransactionHashes(prev => ({ ...prev, addLiquidity: hashPair }))
    }
  }, [hashPair])

  const handleSubmit = async (formValues: z.infer<typeof createPoolFormSchema>) => {
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
        console.error("Account address is undefined")
      }
    } catch (error) {
      console.error("Submission error:", error)
      setTransactionStage('idle')
    }
  }

  return {
    handleSubmit,
    isPendingA,
    isPendingB,
    isPendingPair,
    errorA,
    errorB,
    errorPair,
    transactionHashes,
    transactionStage,
  }
}