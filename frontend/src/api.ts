import type { Category, DailyPoint, CategoryPoint, Page, ParseResult, Transaction, TransactionInput } from './types';

export const BASE: string = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...init,
      headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    });
  } catch {
    throw new Error("Can't reach the server. Is the backend running?");
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error?.message ?? `Request failed (${res.status})`, res.status);
  return body as T;
}

export const api = {
  categories: () => request<Category[]>('/categories'),
  parse: (text: string, source: 'sms' | 'text') =>
    request<ParseResult>('/parse', { method: 'POST', body: JSON.stringify({ text, source }) }),
  parseFile: (file: Blob, name: string) => {
    const fd = new FormData();
    fd.append('file', file, name);
    return request<ParseResult>('/parse/file', { method: 'POST', body: fd });
  },
  list: (q: Record<string, string>) => request<Page<Transaction>>(`/entries?${new URLSearchParams(q)}`),
  get: (id: string) => request<Transaction>(`/entries/${id}`),
  create: (t: TransactionInput) => request<Transaction>('/entries', { method: 'POST', body: JSON.stringify(t) }),
  update: (id: string, t: TransactionInput) =>
    request<Transaction>(`/entries/${id}`, { method: 'PUT', body: JSON.stringify(t) }),
  remove: (id: string) => request<void>(`/entries/${id}`, { method: 'DELETE' }),
  daily: (from: string, to: string) => request<DailyPoint[]>(`/analytics/daily?from=${from}&to=${to}`),
  byCategory: (from: string, to: string) =>
    request<CategoryPoint[]>(`/analytics/categories?from=${from}&to=${to}`),
};
