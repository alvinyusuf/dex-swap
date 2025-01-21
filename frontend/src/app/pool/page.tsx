'use client'

import React from 'react'
import PoolForm from './pool-form'
import { usePoolCreation } from '@/web3/hooks/pool-factory/usePoolCreation'

export default function Pool() {

  const {
    handleSubmit,
    isPendingA,
    isPendingB,
    isPendingPair,
    errorA,
    errorB,
    errorPair,
    transactionHashes,
    transactionStage,
  } = usePoolCreation()

  return (
    <div className='w-1/3 flex flex-col items-center gap-y-4'>
      <h1 className='font-bold text-2xl text-primary'>Create your pool</h1>
      <PoolForm
        onSubmit={handleSubmit}
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