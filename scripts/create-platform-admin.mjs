import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvFile('.env.local');
loadEnvFile('.env');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const adminEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL ?? process.argv[2] ?? 'admin@belezacarioca.com')
  .trim()
  .toLowerCase();
const adminPassword =
  process.env.ADMIN_BOOTSTRAP_PASSWORD ?? process.argv[3] ?? 'BcAdmin!2026#Q7mP';
const salonId = process.env.ADMIN_BOOTSTRAP_SALON_ID ?? process.argv[4] ?? 'salon-beleza-carioca';

async function main() {
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', anonKey);
  requireEnv('SUPABASE_SERVICE_ROLE_KEY', serviceRoleKey);

  const existingUser = await findAuthUserByEmail(adminEmail);
  const user =
    existingUser ??
    (await authAdminRequest('admin/users', {
      body: {
        email: adminEmail,
        email_confirm: true,
        password: adminPassword,
        user_metadata: {
          role_seed: 'platformAdmin',
          source: 'site-bootstrap-script',
        },
      },
      method: 'POST',
    }));

  if (existingUser) {
    await authAdminRequest(`admin/users/${existingUser.id}`, {
      body: {
        email: adminEmail,
        email_confirm: true,
        user_metadata: {
          role_seed: 'platformAdmin',
          source: 'site-bootstrap-script',
        },
        password: adminPassword,
      },
      method: 'PUT',
    });
  }

  const resolvedSalonId = await resolveSalonIdForBootstrap(salonId);
  await ensureAdminRoleBinding({
    email: adminEmail,
    salonId: resolvedSalonId,
    userId: user.id,
  });

  console.log('Conta administrativa pronta.');
  console.log(`Email: ${adminEmail}`);
  console.log(`Senha temporaria: ${adminPassword}`);
  console.log(`Perfil: platformAdmin`);
  console.log(`Salon vinculado: ${resolvedSalonId}`);
}

async function findAuthUserByEmail(email) {
  let page = 1;

  while (page <= 20) {
    const payload = await authAdminRequest(`admin/users?page=${page}&per_page=200`, {
      method: 'GET',
    });
    const users = Array.isArray(payload?.users) ? payload.users : [];
    const matched = users.find((item) => (item.email ?? '').toLowerCase() === email);

    if (matched) {
      return matched;
    }

    if (users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function resolveSalonIdForBootstrap(targetSalonId) {
  let requestedSalon = [];

  try {
    requestedSalon = await restRequest(
      `salons?id=eq.${encodeURIComponent(targetSalonId)}&select=id&limit=1`,
      {
        method: 'GET',
      },
    );
  } catch (error) {
    const invalidUuidError =
      error instanceof Error &&
      error.message.includes('"code":"22P02"') &&
      error.message.includes('invalid input syntax for type uuid');

    if (!invalidUuidError) {
      throw error;
    }
  }

  if (requestedSalon[0]?.id) {
    return requestedSalon[0].id;
  }

  const firstSalon = await restRequest('salons?select=id&order=created_at.asc&limit=1', {
    method: 'GET',
  });

  if (firstSalon[0]?.id) {
    console.warn(
      `Nao encontrei ${targetSalonId}; usando ${firstSalon[0].id} como salao para bootstrap admin.`,
    );
    return firstSalon[0].id;
  }

  throw new Error(
    `Nao encontrei o salao ${targetSalonId} e tambem nao existe nenhum registro em public.salons.`,
  );
}

async function upsertSalonUserPlatformAdmin(input) {
  const rows = await restRequest('salon_users?on_conflict=salon_id,user_id,profile', {
    body: [
      {
        active: true,
        customer_id: null,
        professional_id: null,
        profile: 'platformAdmin',
        salon_id: input.salonId,
        user_id: input.userId,
      },
    ],
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
  });

  if (!rows[0]?.user_id) {
    throw new Error('Falha ao vincular usuario em salon_users com perfil platformAdmin.');
  }
}

async function ensureAdminRoleBinding(input) {
  if (await tableExists('salon_users')) {
    await upsertSalonUserPlatformAdmin({
      salonId: input.salonId,
      userId: input.userId,
    });
    return;
  }

  if (await tableExists('profiles')) {
    await upsertProfilePlatformAdmin(input);
    return;
  }

  throw new Error(
    "Nao encontrei public.salon_users nem public.profiles para vincular o perfil administrativo. Verifique o schema do projeto no Supabase.",
  );
}

async function upsertProfilePlatformAdmin(input) {
  const roleCandidates = ['platformAdmin', 'admin'];
  let lastError = null;

  for (const role of roleCandidates) {
    try {
      const rows = await restRequest('profiles?on_conflict=id', {
        body: [
          {
            email: input.email,
            full_name: 'Admin Plataforma',
            id: input.userId,
            role,
            salon_id: input.salonId,
          },
        ],
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=representation',
      });

      if (rows[0]?.id) {
        if (role !== 'platformAdmin') {
          console.warn(
            `Perfil admin gravado em public.profiles com role=${role}. O login admin aceita esse valor como fallback.`,
          );
        }
        return;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Falha ao vincular usuario em public.profiles com papel administrativo. ${
      lastError instanceof Error ? lastError.message : ''
    }`.trim(),
  );
}

async function tableExists(tableName) {
  try {
    await restRequest(`${tableName}?select=*&limit=1`, {
      method: 'GET',
    });
    return true;
  } catch (error) {
    if (isMissingTableError(error, tableName)) {
      return false;
    }

    throw error;
  }
}

function isMissingTableError(error, tableName) {
  if (!(error instanceof Error)) {
    return false;
  }

  const expectedMessage = `Could not find the table 'public.${tableName}'`;
  return error.message.includes(expectedMessage);
}

async function authAdminRequest(path, input) {
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    body: input.body ? JSON.stringify(input.body) : undefined,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    method: input.method,
  });

  if (!response.ok) {
    throw new Error(`Auth admin request falhou (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

async function restRequest(path, input) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    body: input.body ? JSON.stringify(input.body) : undefined,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(input.prefer ? { Prefer: input.prefer } : {}),
    },
    method: input.method,
  });

  if (!response.ok) {
    throw new Error(`Supabase REST request falhou (${response.status}): ${await response.text()}`);
  }

  if (response.status === 204) {
    return [];
  }

  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Defina ${name} no .env.local antes de executar o script.`);
  }
}

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
