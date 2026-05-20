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
      throw new Error((err as { detail?: string }).detail ?? 'Error al enviar el pre-test.');
    }
    return res.json() as Promise<PreTestResponse>;
  }

  async submitPostTest(payload: PostTestPayload): Promise<PostTestResponse> {
    const res = await fetch(`${this.baseUrl}/posttest/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail ?? 'Error al enviar el post-test.');
    }
    return res.json() as Promise<PostTestResponse>;
  }
}
