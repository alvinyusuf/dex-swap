import { TransactionHashes, TransactionStage } from "@/types/pool-form"

interface TransactionStatusProps {
  hashes: TransactionHashes
  stage: TransactionStage
  isPendingA: boolean
  isPendingB: boolean
  isPendingPair: boolean
  errorA: Error | null
  errorB: Error | null
  errorPair: Error | null
}

export function TransactionStatus({
  hashes,
  stage,
  isPendingA,
  isPendingB,
  isPendingPair,
  errorA,
  errorB,
  errorPair
}: TransactionStatusProps) {
  return (
    <div className="space-y-2">
      {/* Hash displays */}
      {hashes.approveA && (
        <div className="text-sm">Approve A Hash: {hashes.approveA}</div>
      )}
      {hashes.approveB && (
        <div className="text-sm">Approve B Hash: {hashes.approveB}</div>
      )}
      {hashes.addLiquidity && (
        <div className="text-sm">Add Liquidity Hash: {hashes.addLiquidity}</div>
      )}

      {/* Pending status */}
      {(isPendingA || isPendingB || isPendingPair) && (
        <p>Transaction pending: {stage}</p>
      )}

      {/* Error displays */}
      {errorA && <p className="text-red-500">Error A: {errorA.message}</p>}
      {errorB && <p className="text-red-500">Error B: {errorB.message}</p>}
      {errorPair && <p className="text-red-500">Error Pair: {errorPair.message}</p>}

      {/* Success message */}
      {stage === 'completed' && (
        <div className="text-green-500 mt-2">
          Pool creation successful!
          <p>You have successfully created a liquidity pool with the selected tokens.</p>
        </div>
      )}
    </div>
  )
}