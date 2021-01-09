import { StaticStore } from 'common/static-store';
import { h, FunctionComponent } from 'preact';

import type { FormProvider, OAuthProvider } from 'common/types';

import AuthPanel from './fragments/auth-panel';

const OATH_PROVIDERS = ['facebook', 'twitter', 'google', 'yandex', 'github', 'microsoft', 'dev'];

function getProviders(): [OAuthProvider[], FormProvider[]] {
  const oauthProviders: OAuthProvider[] = [];
  const formProviders: FormProvider[] = [];

  StaticStore.config.auth_providers.forEach((p) => {
    OATH_PROVIDERS.includes(p) ? oauthProviders.push(p as OAuthProvider) : formProviders.push(p as FormProvider);
  });

  return [oauthProviders, formProviders];
}

const Auth: FunctionComponent = () => {
  const [oauthProviders, formProviders] = getProviders();

  return <AuthPanel oauthProviders={oauthProviders} formProviders={formProviders} />;
};

export default Auth;
