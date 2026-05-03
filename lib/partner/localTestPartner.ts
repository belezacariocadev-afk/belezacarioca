export const DEFAULT_LOCAL_PARTNER_TEST_EMAIL = 'parceiroteste@belezacarioca.com';
export const DEFAULT_LOCAL_PARTNER_TEST_PASSWORD = '12345678';

type LocalPartnerTestAccount = {
  email: string;
  enabled: boolean;
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isDevelopmentEnvironment() {
  return process.env.NODE_ENV !== 'production';
}

export function getLocalPartnerTestAccount(): LocalPartnerTestAccount {
  return {
    email: normalizeEmail(process.env.PARTNER_LOCAL_TEST_EMAIL ?? DEFAULT_LOCAL_PARTNER_TEST_EMAIL),
    enabled: isDevelopmentEnvironment() && process.env.PARTNER_LOCAL_TEST_DISABLED !== 'true',
    password: process.env.PARTNER_LOCAL_TEST_PASSWORD ?? DEFAULT_LOCAL_PARTNER_TEST_PASSWORD,
  };
}

export function isLocalPartnerTestEmail(email: string) {
  const account = getLocalPartnerTestAccount();

  return account.enabled && normalizeEmail(email) === account.email;
}

export function authenticateLocalPartnerTestAccount(email: string, password: string) {
  const account = getLocalPartnerTestAccount();
  const normalizedEmail = normalizeEmail(email);
  const isTargetEmail = normalizedEmail === account.email;

  if (!account.enabled || !isTargetEmail) {
    return {
      emailMatched: false,
      isAuthenticated: false,
    };
  }

  return {
    emailMatched: true,
    isAuthenticated: password === account.password,
  };
}
