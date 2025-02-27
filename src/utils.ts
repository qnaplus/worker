export type LazyInitializer<T> = () => T;

export const lazy = <T>(init: LazyInitializer<T>) => {
	let val: T | null = null;
	return () => {
		if (val === null) {
			val = init();
		}
		return val;
	};
};

export type TryResultSuccess<T> = {
	ok: true;
	result: T;
	error: null;
};

export type TryResultFailure = {
	ok: false;
	result: null;
	error: unknown;
};

export type TryResult<T> = TryResultSuccess<T> | TryResultFailure;

export const trycatch = async <T>(
	promise: Promise<T>,
): Promise<TryResult<T>> => {
	try {
		const result = await promise;
		return {
			ok: true,
			result,
			error: null,
		};
	} catch (e) {
		return {
			ok: false,
			result: null,
			error: e,
		};
	}
};
