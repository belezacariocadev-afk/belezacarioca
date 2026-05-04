const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

loadEnvFile('.env.local');
loadEnvFile('.env');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  console.log('[Supabase] Verificando variaveis...');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    console.error('[Supabase] Variaveis ausentes:', {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(supabaseUrl),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(supabaseAnonKey),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(supabaseServiceRoleKey),
    });
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('[Supabase] Clientes criados com sucesso.');

  const { data: publicRows, error: publicError } = await supabase
    .from('salons')
    .select('id,name')
    .limit(1);

  if (publicError) {
    console.warn('[Supabase] Leitura com anon key falhou ou foi bloqueada por RLS:', publicError.message);
  } else {
    console.log('[Supabase] Leitura com anon key funcionou:', publicRows);
  }

  const { data: adminRows, error: adminError } = await supabaseAdmin
    .from('salons')
    .select('id,name')
    .limit(1);

  if (adminError) {
    console.error('[Supabase] Leitura com service role falhou:', adminError.message);
    process.exitCode = 1;
    return;
  }

  console.log('[Supabase] Conexao com service role funcionou:', adminRows);
}

main().catch((error) => {
  console.error('[Supabase] Erro inesperado:', error);
  process.exitCode = 1;
});
