import { h, FunctionComponent } from 'preact';

import AuthPanel from './fragments/auth-panel';

const Auth: FunctionComponent = () => {
  return (
    <AuthPanel
      oauthProviders={['facebook', 'twitter', 'github', 'google', 'microsoft', 'yandex', 'dev']}
      formProviders={['anonymous', 'email']}
    />
  );
};

export default Auth;
