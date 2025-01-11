'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TransactionAlert from './transaction-alert'

const createTokenFormSchema = z.object({
  tokenName: z.string().min(2, "Token name must be at least 2 characters").nonempty(),
  symbol: z.string().min(3, "Symbol must be at least 3 characters").nonempty(),
  initialSupply: z.preprocess((value) => parseInt(value as string, 10), z.number({ message: "Initial Supply must be a number" }).positive()),
})

type FormFieldConfig = {
  name: keyof z.infer<typeof createTokenFormSchema>
  label: string,
}

const formFields: FormFieldConfig[] = [
  { name: 'tokenName', label: 'Token Name' },
  { name: 'symbol', label: 'Symbol' },
  { name: 'initialSupply', label: 'Initial Supply' }
]

interface TokenFormProps {
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

export type { createTokenFormSchema }

export default function TokenForm({
  onSubmit,
  isPending,
  error,
  isSuccess,
  hash,
  tokenCreationResult
}: TokenFormProps) {
  const form = useForm<z.infer<typeof createTokenFormSchema>>({
    resolver: zodResolver(createTokenFormSchema),
    defaultValues: {
      tokenName: '',
      symbol: '',
      initialSupply: 0,
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full border border-foreground rounded-lg p-4 space-y-4'>
        {formFields.map((formField) => (
          <FormField
            key={formField.name}
            control={form.control}
            name={formField.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-primary font-semibold'>{formField.label}</FormLabel>
                <FormControl>
                  <Input {...field} className='border-foreground' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <TransactionAlert
          isPending={isPending}
          error={error}
          isSuccess={isSuccess}
          hash={hash}
          tokenCreationResult={tokenCreationResult}
        >
          <Button disabled={isPending} type='submit' className='w-full bg-foreground'>
            Create Token
          </Button>
        </TransactionAlert>
      </form>
    </Form>
  )
}