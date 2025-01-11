import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { AlertDialogAction, AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/ui/button'
import { BaseError } from 'wagmi'
import { CopyToClipboard } from '@/components/common/copy-to-clipboard'

interface TransactionAlertProps {
  isPending: boolean
  error: Error | null
  isSuccess: boolean
  hash?: string
  tokenCreationResult: {
    success?: boolean
    tokenAddress?: string
    error?: string
  }
  children: React.ReactNode
}

export default function TransactionAlert({
  isPending,
  error,
  isSuccess,
  hash,
  tokenCreationResult,
  children
}: TransactionAlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Please waiting for transaction confirmation
          </AlertDialogTitle>
          <AlertDialogDescription>
            {error && <span>Error: {(error as BaseError).shortMessage || error.message}</span>}
          </AlertDialogDescription>
          <AlertDialogDescription>
            {isPending && <span>Transaction pending</span>}
          </AlertDialogDescription>
          <AlertDialogDescription>
            {isSuccess && <span>Transaction success</span>}
          </AlertDialogDescription>
          <AlertDialogDescription>
            {hash && <span>Transaction Hash: <CopyToClipboard text={hash} /></span>}
          </AlertDialogDescription>
          <AlertDialogDescription>
            {tokenCreationResult.success && (
              <span className="text-green-500">
                Token berhasil dibuat di alamat: <CopyToClipboard text={tokenCreationResult.tokenAddress} />
              </span>
            )}
          </AlertDialogDescription>
          <AlertDialogDescription>
            {tokenCreationResult.error && (
              <span className="text-red-500">
                Gagal membuat token: {tokenCreationResult.error}
              </span>
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
  )
}