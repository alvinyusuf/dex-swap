import { z } from 'zod'

export const createPoolFormSchema = z.object({
  tokenAAddress: z.string(),
  tokenBAddress: z.string(),
  tokenAAmount: z.preprocess(
    (value) => parseInt(value as string, 10),
    z.number({ message: "Amount of token A be a number" }).positive()
  ),
  tokenBAmount: z.preprocess(
    (value) => parseInt(value as string, 10),
    z.number({ message: "Amount of token B be a number" }).positive()
  ),
})

type FormFieldConfig = {
  name: keyof z.infer<typeof createPoolFormSchema>
  label: string,
  type: 'select' | 'number'
}

export const formFields: FormFieldConfig[] = [
  { name: 'tokenAAddress', label: 'Token A Address', type: 'select' },
  { name: 'tokenBAddress', label: 'Token B Address', type: 'select' },
  { name: 'tokenAAmount', label: 'Token A Amount', type: 'number' },
  { name: 'tokenBAmount', label: 'Token B Amount', type: 'number' }
]

export type TransactionStage = 'idle' | 'approveA' | 'approveB' | 'addLiquidity' | 'completed'

export interface TransactionHashes {
  approveA: string
  approveB: string
  addLiquidity: string
}

export interface PoolFormProps {
  onSubmit: (values: z.infer<typeof createPoolFormSchema>) => void
  isPendingA: boolean
  isPendingB: boolean
  isPendingPair: boolean
  errorA: Error | null
  errorB: Error | null
  errorPair: Error | null
  transactionHashes: TransactionHashes
  transactionStage: TransactionStage
}