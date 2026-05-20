export interface PreTestPayload {
  answers: Record<string, unknown>;
}

export interface PreTestResponse {
  success: boolean;
  entry_password: string;
  message: string;
}

export interface PostTestPayload {
  closing_password: string;
  answers: Record<string, unknown>;
}

export interface PostTestResponse {
  success: boolean;
  message: string;
}

export interface PostTestValidateResponse {
  valid: boolean;
  message: string;
}

function parseApiError(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0] && typeof detail[0] === 'object') {
    const msg = (detail[0] as { msg?: string }).msg;
    if (msg) return msg;
  }
  return fallback;
}

export class ApiService {
  constructor(private readonly baseUrl: string) {}

  async submitPreTest(payload: PreTestPayload): Promise<PreTestResponse> {
    const res = await fetch(`${this.baseUrl}/pretest/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(parseApiError(err, 'Error al enviar el pre-test.'));
    }
    return res.json() as Promise<PreTestResponse>;
  }

  async validatePostTestPassword(closingPassword: string): Promise<PostTestValidateResponse> {
    const res = await fetch(`${this.baseUrl}/posttest/validate-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closing_password: closingPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        parseApiError(err, 'Contraseña de cierre incorrecta. Inténtalo de nuevo.'),
      );
    }
    return res.json() as Promise<PostTestValidateResponse>;
  }

  async submitPostTest(payload: PostTestPayload): Promise<PostTestResponse> {
    const res = await fetch(`${this.baseUrl}/posttest/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(parseApiError(err, 'Error al enviar el post-test.'));
    }
    return res.json() as Promise<PostTestResponse>;
  }
}
