import type { User } from 'common/types';

import fetcher from 'common/fetcher';
import { getUser } from 'common/api';
import { siteId } from 'common/settings';

export function stringifyUrl(url: string, params: Record<string, string>) {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${url}?${queryString}`;
}

export function anonymousSignin(username: string): Promise<User> {
  const url = stringifyUrl('/auth/anonymous/login', {
    from: `${window.location.origin}${window.location.pathname}?selfClose`,
    user: username,
    aud: siteId,
  });

  return fetcher.get(url, { overriddenApiBase: '' });
}

const EMAIL_SIGNIN_ENDPOINT = '/auth/email/login';

export function emailSignin(email: string, username: string): Promise<unknown> {
  const url = stringifyUrl(EMAIL_SIGNIN_ENDPOINT, { address: email, user: username });

  return fetcher.get(url, { overriddenApiBase: '' });
}

export function verifyEmailSignin(token: string): Promise<User> {
  const url = stringifyUrl(EMAIL_SIGNIN_ENDPOINT, { token });

  return fetcher.get(url, { overriddenApiBase: '' });
}

const REVALIDATION_TIMEOUT = 60 * 1000; // 1min
let lastAttemptTime = Date.now();

export function userUpdater() {
  let currentRequest: Promise<User | null> | null = null;

  async function handleVisibilityChange() {
    if (!window.navigator.onLine) {
      console.log('offline');
      return;
    }
    if (document.hidden) {
      console.log('hidden');
      return;
    }
    if (currentRequest) {
      console.log('request in progress');
    }
    if (Date.now() - lastAttemptTime < REVALIDATION_TIMEOUT) {
      console.log(Date.now() - lastAttemptTime - REVALIDATION_TIMEOUT);
      return;
    }

    const resetOnEnd = () => {
      currentRequest = null;
    };

    console.log('Try to revalidate user');
    currentRequest = getUser();
    currentRequest.then(resetOnEnd).catch(resetOnEnd);
    lastAttemptTime = Date.now();
  }

  handleVisibilityChange();

  window.addEventListener('visibilitychange', handleVisibilityChange);
}

export function oauthSignin(url: string) {
  lastAttemptTime = 0;
  window.open(url);
  lastAttemptTime = Date.now() - REVALIDATION_TIMEOUT;
}
