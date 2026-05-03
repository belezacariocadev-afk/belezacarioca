import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvFile('.env.local');
loadEnvFile('.env');

const appUrl = process.env.PLATFORM_DEV_APP_URL ?? 'http://127.0.0.1:3000';
const password = process.env.SUPABASE_DEV_PASSWORD ?? 'Beleza123!';
const marker = `smoke-${Date.now()}`;

const accounts = {
  admin: {
    email: process.env.SUPABASE_DEV_ADMIN_EMAIL ?? 'contato@belezacarioca.com',
    nextPath: '/admin',
    profileId: 'salonAdmin',
  },
  professional: {
    email: process.env.SUPABASE_DEV_PROFESSIONAL_EMAIL ?? 'camila@belezacarioca.com',
    nextPath: '/profissional',
    profileId: 'professional',
  },
  client: {
    email: process.env.SUPABASE_DEV_CLIENT_EMAIL ?? 'marina@cliente.com',
    nextPath: '/cliente',
    profileId: 'client',
  },
};

async function main() {
  requireEnv('NEXT_PUBLIC_PLATFORM_DATA_SOURCE', 'supabase');
  requireEnv('PLATFORM_AUTH_PROVIDER', 'supabase');
  requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  const admin = await login(accounts.admin);
  const snapshot = await loadSnapshot(admin.cookie);

  assert(snapshot.clients.length > 0, 'clientes carregados');
  assert(snapshot.professionals.length > 0, 'profissionais carregados');
  assert(snapshot.services.length > 0, 'servicos carregados');
  assert(snapshot.appointments.length > 0, 'agendamentos carregados');
  assert(snapshot.charges.length > 0, 'cobrancas carregadas');

  const createdSnapshot = await createAndEditAppointment(admin.cookie, snapshot);
  assert(
    createdSnapshot.appointments.some((appointment) => appointment.notes?.includes(`${marker}-editado`)),
    'agendamento criado e editado pelo adapter Supabase',
  );
  assert(
    createdSnapshot.charges.some((charge) => {
      const appointment = createdSnapshot.appointments.find((item) => item.id === charge.appointmentId);
      return appointment?.notes?.includes(`${marker}-editado`);
    }),
    'cobranca criada junto com o agendamento',
  );

  await login(accounts.professional);
  await login(accounts.client);

  console.log('Smoke Supabase dev concluido com sucesso.');
}

async function login(account) {
  const response = await fetch(`${appUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: account.email,
      nextPath: account.nextPath,
      password,
      profileId: account.profileId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha no login ${account.profileId}: ${await response.text()}`);
  }

  const cookie = response.headers.get('set-cookie')?.split(';')[0];

  if (!cookie) {
    throw new Error(`Login ${account.profileId} nao retornou cookie de sessao.`);
  }

  return {
    cookie,
    payload: await response.json(),
  };
}

async function loadSnapshot(cookie) {
  const response = await fetch(`${appUrl}/api/platform/snapshot`, {
    headers: {
      cookie,
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar snapshot Supabase: ${await response.text()}`);
  }

  const payload = await response.json();

  return payload.snapshot;
}

async function runAction(cookie, body) {
  const response = await fetch(`${appUrl}/api/platform/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Falha ao executar ${body.action}: ${await response.text()}`);
  }

  const payload = await response.json();

  return payload.snapshot;
}

async function createAndEditAppointment(cookie, snapshot) {
  const service =
    snapshot.services.find((item) => item.active && item.professionalIds.length > 0) ??
    snapshot.services.find((item) => item.active);
  const professional =
    snapshot.professionals.find((item) => item.active && service?.professionalIds.includes(item.id)) ??
    snapshot.professionals.find((item) => item.active);
  const client = snapshot.clients[0];

  if (!client || !professional || !service) {
    throw new Error('Seed insuficiente para criar agendamento.');
  }

  const startsAt = nextSmokeDate().toISOString();
  const created = await runAction(cookie, {
    action: 'createAppointment',
    payload: {
      clientId: client.id,
      professionalId: professional.id,
      serviceId: service.id,
      startsAt,
      status: 'scheduled',
      notes: marker,
    },
  });
  const appointment = created.appointments.find((item) => item.notes === marker);

  if (!appointment) {
    throw new Error('Agendamento de smoke nao foi encontrado apos criacao.');
  }

  return runAction(cookie, {
    action: 'updateAppointment',
    payload: {
      appointmentId: appointment.id,
      input: {
        clientId: client.id,
        professionalId: professional.id,
        serviceId: service.id,
        startsAt,
        status: 'confirmed',
        notes: `${marker}-editado`,
      },
    },
  });
}

function nextSmokeDate() {
  const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + (Date.now() % 1_000_000_000));
  date.setSeconds(0, 0);
  return date;
}

function assert(condition, label) {
  if (!condition) {
    throw new Error(`Validacao falhou: ${label}.`);
  }

  console.log(`OK - ${label}`);
}

function requireEnv(name, expectedValue) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Defina ${name} antes de rodar este smoke test.`);
  }

  if (expectedValue && value !== expectedValue) {
    throw new Error(`Defina ${name}=${expectedValue} antes de rodar este smoke test.`);
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
