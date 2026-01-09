import { publicProcedure } from '..'

export const list = publicProcedure().handler(async () => {
	return new Promise<string[]>((res) => {
		setTimeout(() => res(['teste', 'teste2']), 2000)
	})
})
