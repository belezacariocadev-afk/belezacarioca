import { parsePlatformSession, platformSessionCookieName } from '@/lib/platform/auth/session';

export function readPlatformSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookieValue = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${platformSessionCookieName}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  return parsePlatformSession(cookieValue);
}
