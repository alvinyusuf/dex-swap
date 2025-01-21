import { z } from "zod"

export const createTokenFormSchema = z.object({
  tokenName: z.string().min(2, "Token name must be at least 2 characters").nonempty(),
  symbol: z.string().min(3, "Symbol must be at least 3 characters").nonempty(),
  initialSupply: z.preprocess((value) => parseInt(value as string, 10), z.number({ message: "Initial Supply must be a number" }).positive()),
})

export type FormFieldConfig = {
  name: keyof z.infer<typeof createTokenFormSchema>
  label: string,
}

export const formFields: FormFieldConfig[] = [
  { name: 'tokenName', label: 'Token Name' },
  { name: 'symbol', label: 'Symbol' },
  { name: 'initialSupply', label: 'Initial Supply' }
]

export interface TokenFormProps {
  onSubmit: (values: z.infer<typeof createTokenFormSchema>) => void
  isPending: boolean
  error: Error | null
  isSuccess: boolean
  hash?: string
  tokenCreationResult: {
    success?: boolean
    tokenAddress?: string
    error?: string
  }
}