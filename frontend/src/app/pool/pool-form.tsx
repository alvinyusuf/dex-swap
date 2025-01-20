import { SelectTokens } from '@/components/tokens/select-tokens'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { TransactionStatus } from './transaction-status'
import { createPoolFormSchema, formFields, PoolFormProps } from '@/types/pool-form'

export default function PoolForm({
  onSubmit,
  isPendingA,
  isPendingB,
  isPendingPair,
  errorA,
  errorB,
  errorPair,
  transactionHashes,
  transactionStage
}: PoolFormProps) {

  const form = useForm<z.infer<typeof createPoolFormSchema>>({
    resolver: zodResolver(createPoolFormSchema),
    defaultValues: {
      tokenAAddress: '',
      tokenBAddress: '',
      tokenAAmount: 0,
      tokenBAmount: 0,
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
                <FormLabel className='font-semibold text-primary'>{formField.label}</FormLabel>
                <FormControl>
                  {formField.type === 'number' ? (
                    <Input {...field} type='number' className='border-foreground' />
                  ) : (
                    <SelectTokens />
                  )}
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
        <TransactionStatus
          errorA={errorA}
          errorB={errorB}
          errorPair={errorPair}
          isPendingA={isPendingA}
          isPendingB={isPendingB}
          isPendingPair={isPendingPair}
          hashes={transactionHashes}
          stage={transactionStage}
        />
      </form>
    </Form>
  )
}
