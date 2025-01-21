'use client';

import React from 'react';
import TokenForm from './token-form'
import { z } from 'zod';
import { useTokenFactory } from '@/web3/hooks/token-factory/useTokenFactory';
import { createTokenFormSchema } from '@/types/token-form';

export default function CreateToken() {
	const {
		createToken,
		isPending,
		error,
		isSuccess,
		hash,
		tokenCreationResult,
	} = useTokenFactory();

	async function onSubmit(values: z.infer<typeof createTokenFormSchema>) {
		await createToken(values.tokenName, values.symbol, values.initialSupply);
	}

	return (
		<div className='w-1/3 flex flex-col items-center gap-y-4'>
			<h1 className='font-bold text-2xl text-primary'>Create new token for testing</h1>
			<TokenForm
				onSubmit={onSubmit}
				isPending={isPending}
				error={error}
				isSuccess={isSuccess}
				hash={hash}
				tokenCreationResult={tokenCreationResult}
			/>
		</div>
	);
}