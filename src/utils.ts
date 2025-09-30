export type TryResultSuccess<T> = [null, T];
export type TryResultFailure = [Error, null];
export type TryResult<T> = TryResultSuccess<T> | TryResultFailure;

export const trycatch = async <T>(
	promise: () => Promise<T>,
): Promise<TryResult<T>> => {
	try {
		const result = await promise();
		return [null, result]
	} catch (e) {
		return [e as Error, null]
	}
};

export const errorString = (error: Error) => {
	return `${error.name} ${error.message} ${error.stack}`
}

export type Nullish = null | undefined;

export const isEmptyOrNullish = (input: string | undefined | null): input is Nullish => input === null || input === undefined || input?.trim() === "";
