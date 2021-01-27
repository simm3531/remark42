import { MessageDescriptor } from 'react-intl';

import { isJwtExpired } from 'utils/jwt';
import { StaticStore } from 'common/static-store';
import type { FormProvider, OAuthProvider } from 'common/types';

import messages from './auth.messsages';
import { OAUTH_PROVIDERS } from './auth.const';

export function getProviders(): [OAuthProvider[], FormProvider[]] {
  const oauthProviders: OAuthProvider[] = [];
  const formProviders: FormProvider[] = [];

  StaticStore.config.auth_providers.forEach((p) => {
    OAUTH_PROVIDERS.includes(p) ? oauthProviders.push(p as OAuthProvider) : formProviders.push(p as FormProvider);
  });

  return [oauthProviders, formProviders];
}

const MIN_LENGTH = 3;
const EMAIL_REGEXP = /[^@]+@[^.]+\..+/;
const USERNAME_REGEXP = /^[\p{L}\d_ ]+$/u;

export function getUsernameInvalidReason(username: string): MessageDescriptor | null {
  if (username.length < MIN_LENGTH) {
    return messages.lengthLimit;
  }

  if (!USERNAME_REGEXP.test(username.trim())) {
    return messages.symbolLimit;
  }

  return null;
}

export function getEmailInvalidReason(email: string): MessageDescriptor | null {
  if (!EMAIL_REGEXP.test(email)) {
    return messages.invalidEmail;
  }

  return null;
}

export function getTokenInvalidReason(token: string): MessageDescriptor | null {
  if (token.length === 0) {
    return messages.emptyToken;
  }

  try {
    if (isJwtExpired(token)) {
      return messages.expiredToken;
    }
  } catch (e) {
    return messages.invalidToken;
  }

  return null;
}
