interface ApiErrorResponse {
  code?: string
  message?: string
  status?: number
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (typeof options?.headers === 'object' && options.headers !== null) {
    Object.assign(headers, options.headers)
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // 쿠키 자동 포함
    headers,
  })

  const data = (await response.json()) as ApiErrorResponse & T

  if (!response.ok) {
    throw new ApiError(
      data.code || 'UNKNOWN_ERROR',
      response.status,
      data.message || '요청에 실패했습니다',
    )
  }

  return data as T
}

// GET
export function apiGet<T>(url: string): Promise<T> {
  return apiRequest<T>(url, { method: 'GET' })
}

// POST
export function apiPost<T>(url: string, body?: unknown): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

// PUT
export function apiPut<T>(url: string, body?: unknown): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

// DELETE
export function apiDelete<T>(url: string): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE' })
}
