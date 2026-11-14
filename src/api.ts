const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T = unknown>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const token = sessionStorage.getItem('comerzia.token');
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new ApiError(
      'No pudimos confirmar la respuesta. Comprueba tu conexión; consulta el estado antes de repetir un cobro o registro.',
      0,
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      sessionStorage.removeItem('comerzia.token');
      sessionStorage.removeItem('comerzia.user');
      window.dispatchEvent(new Event('comerzia:expired'));
    }
    throw new ApiError(
      Array.isArray(data?.message)
        ? data.message.join('. ')
        : data?.message || 'No pudimos completar la operación',
      response.status,
    );
  }
  return data as T;
}
