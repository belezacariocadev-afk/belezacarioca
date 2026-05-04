const fs = require('fs');
const path = require('path');

function loadEnvFile(fileName) {
  const envPath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function resolveFetch() {
  if (typeof fetch === 'function') {
    return fetch;
  }

  const nodeFetch = await import('node-fetch');

  return nodeFetch.default;
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const asaasApiKey = process.env.ASAAS_API_KEY;
const asaasEnvironment = process.env.ASAAS_ENVIRONMENT ?? 'production';
const asaasBaseUrl =
  asaasEnvironment === 'sandbox'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://www.asaas.com/api/v3';

async function main() {
  console.log('[Asaas] Verificando variavel ASAAS_API_KEY...');

  if (!asaasApiKey) {
    console.error('[Asaas] Variavel ASAAS_API_KEY ausente.');
    process.exitCode = 1;
    return;
  }

  const fetchClient = await resolveFetch();
  const response = await fetchClient(`${asaasBaseUrl}/customers?limit=1`, {
    method: 'GET',
    headers: {
      access_token: asaasApiKey,
      Accept: 'application/json',
    },
  });

  const text = await response.text();
  let payload = text;

  try {
    payload = JSON.parse(text);
  } catch {
    // Mantem texto puro quando a resposta nao for JSON.
  }

  if (!response.ok) {
    console.error('[Asaas] Chamada falhou:', {
      status: response.status,
      payload,
    });
    process.exitCode = 1;
    return;
  }

  console.log('[Asaas] Chamada funcionou:', payload);
}

main().catch((error) => {
  console.error('[Asaas] Erro inesperado:', error);
  process.exitCode = 1;
});
