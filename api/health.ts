/**
 * Health check serverless endpoint
 * Path: /api/health.ts
 */

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  uptime: number;
  masKeyConfigured: boolean;
  endpoint: string;
}

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'KeyId, x-mas-key-id, Content-Type');
  }

  if (req.method === 'OPTIONS') {
    if (res.status) {
      return res.status(200).end();
    }
    return new Response(null, { status: 200 });
  }

  const masKeyConfigured = Boolean(
    process.env.MAS_KEY_ID && process.env.MAS_KEY_ID.trim().length > 0
  );

  const payload: HealthResponse = {
    status: 'ok',
    service: 'mas-sora-serverless-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    masKeyConfigured,
    endpoint: '/api/sora',
  };

  if (res.status && res.json) {
    return res.status(200).json(payload);
  }

  // Web Response fallback for Edge runtimes
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
