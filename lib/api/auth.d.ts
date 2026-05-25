export type ApiResult<T = unknown> = {
  data?: T;
  code?: number;
  success?: boolean;
  msg?: string;
  message?: string;
};

export function isApiSuccess(result: unknown): boolean;

export function getNonce(
  address: string,
): Promise<ApiResult<{ nonce?: string }>>;

export function walletLogin(params: {
  walletAddress: string;
  nonce: string;
  signature: string;
}): Promise<
  ApiResult<{ accessToken?: string; user?: Record<string, unknown> } | null>
>;

export function refreshAccessToken(
  accessToken?: string | null,
): Promise<ApiResult<{ accessToken?: string }>>;

export function logout(accessToken?: string | null): Promise<ApiResult<unknown>>;

export function register(params: {
  walletAddress: string;
  nonce: string;
  signature: string;
  inviteCode: string;
}): Promise<
  ApiResult<{ accessToken?: string; user?: Record<string, unknown> }>
>;
