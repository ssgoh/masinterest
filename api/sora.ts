/**
 * MAS Domestic Interest Rates & SORA Serverless Endpoint
 * Path: /api/sora.ts
 *
 * Pulls Daily SORA + compounded 1M/3M/6M averages directly from the MAS API Gateway:
 * https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
 *
 * Authentication header: KeyId: <MAS_KEY_ID>
 */

const MAS_API_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export default async function handler(req: any, res: any) {
  // CORS configuration
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'KeyId, x-mas-key-id, Authorization, Content-Type');
  }

  if (req.method === 'OPTIONS') {
    if (res.status) {
      return res.status(200).end();
    }
    return new Response(null, { status: 200 });
  }

  if (req.method !== 'GET') {
    const errorBody = { error: 'Method Not Allowed', message: 'Only GET requests are supported' };
    if (res.status && res.json) {
      return res.status(405).json(errorBody);
    }
    return new Response(JSON.stringify(errorBody), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Resolve API Key manually without hardcoding:
  // 1. process.env.MAS_KEY_ID
  // 2. Request header: KeyId / x-mas-key-id
  // 3. Query string parameter: keyId / mas_key_id
  const headers = req.headers || {};
  const query = req.query || {};

  const apiKey =
    process.env.MAS_KEY_ID ||
    headers['keyid'] ||
    headers['KeyId'] ||
    headers['x-mas-key-id'] ||
    (typeof query.keyId === 'string' ? query.keyId : undefined) ||
    (typeof query.mas_key_id === 'string' ? query.mas_key_id : undefined);

  if (!apiKey || apiKey.trim().length === 0) {
    const missingKeyResponse = {
      error: 'MAS_KEY_ID is missing',
      message:
        'Please supply your MAS Developer KeyId. You can configure it as the MAS_KEY_ID environment variable, or pass it manually in the request header (KeyId: <YOUR_KEY>) or query parameter (?keyId=<YOUR_KEY>).',
      documentation: 'https://eservices.mas.gov.sg/developer',
      targetEndpoint: MAS_API_ENDPOINT,
    };

    if (res.status && res.json) {
      return res.status(401).json(missingKeyResponse);
    }
    return new Response(JSON.stringify(missingKeyResponse), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    // Construct MAS target URL forwarding any passed query parameters
    const urlObj = new URL(MAS_API_ENDPOINT);

    // Forward valid query parameters (e.g. limit, offset, sort, filters)
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (k !== 'keyId' && k !== 'mas_key_id' && typeof v === 'string') {
          urlObj.searchParams.set(k, v);
        }
      });
    }

    const masResponse = await fetch(urlObj.toString(), {
      method: 'GET',
      headers: {
        KeyId: apiKey.trim(),
        Accept: 'application/json',
        'User-Agent': 'MAS-SORA-Tracker/1.0',
      },
    });

    const responseStatus = masResponse.status;
    const responseContentType = masResponse.headers.get('content-type') || '';

    let data: any;
    if (responseContentType.includes('application/json')) {
      data = await masResponse.json();
    } else {
      const text = await masResponse.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!masResponse.ok) {
      const errorPayload = {
        error: 'MAS Gateway Error',
        status: responseStatus,
        details: data,
        hint: 'Verify that your KeyId is active and subscribed to the domestic interest rates API on MAS Developer Portal.',
      };

      if (res.status && res.json) {
        return res.status(responseStatus).json(errorPayload);
      }
      return new Response(JSON.stringify(errorPayload), {
        status: responseStatus,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (res.status && res.json) {
      return res.status(200).json(data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    const errorBody = {
      error: 'Failed to connect to MAS API Gateway',
      message: error?.message || 'Network communication error',
      targetEndpoint: MAS_API_ENDPOINT,
    };

    if (res.status && res.json) {
      return res.status(502).json(errorBody);
    }

    return new Response(JSON.stringify(errorBody), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
