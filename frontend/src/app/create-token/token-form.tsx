'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TransactionAlert from './transaction-alert'
import { createTokenFormSchema, formFields, TokenFormProps } from '@/types/token-form'

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