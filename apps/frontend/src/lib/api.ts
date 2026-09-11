export interface User {
	id: string;
	email: string;
	name: string;
}

export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
	) {
		super(message);
		this.name = "ApiError";
	}
}

interface ErrorBody {
	message?: string;
}

const BASE_URL = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const response = await fetch(`${BASE_URL}${path}`, {
		credentials: "include",
		headers: { "Content-Type": "application/json", ...options?.headers },
		...options,
	});

	const body = (await response.json().catch(() => null)) as
		| T
		| ErrorBody
		| null;

	if (!response.ok) {
		const message = (body as ErrorBody | null)?.message ?? "Request failed";
		throw new ApiError(message, response.status);
	}

	return body as T;
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, body?: unknown) =>
		request<T>(path, {
			method: "POST",
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
};
