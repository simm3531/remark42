import { h, Fragment, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { MessageDescriptor, useIntl } from 'react-intl';
import classnames from 'classnames';

import type { FormProvider, OAuthProvider, Provider, User } from 'common/types';
import capitalizeFirstLetter from 'utils/capitalize-first-letter';

import Button from 'components/button';
import InputField from '../components/input-field';

import { getEmailInvalidReason, getUsernameInvalidReason, getTokenInvalidReason } from './utils';
import styles from './form.module.css';
import messages from './messsages';
import OAuthButton from '../components/oauth-button';
import { siteId } from 'common/settings';
import fetcher from 'common/fetcher';
import { getUser } from 'common/api';

function stringifyUrl(url: string, params: Record<string, string>) {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${url}?${queryString}`;
}

function anonymousSignin(username: string): Promise<User> {
  const url = stringifyUrl('/auth/anonymous/login', {
    from: `${window.location.origin}${window.location.pathname}?selfClose`,
    user: username,
    aud: siteId,
  });

  return fetcher.get({ url, overriddenApiBase: '' });
}

const EMAIL_SIGNIN_ENDPOINT = '/auth/email/login';

function emailSignin(email: string, username: string): Promise<unknown> {
  const url = stringifyUrl(EMAIL_SIGNIN_ENDPOINT, { address: email, user: username });

  return fetcher.get({ url, overriddenApiBase: '' });
}

function verifyEmailSignin(token: string): Promise<User> {
  const url = stringifyUrl(EMAIL_SIGNIN_ENDPOINT, { token });

  return fetcher.get({ url, overriddenApiBase: '' });
}

let authWindow: Window | null = null;
let authChecker: Promise<User> | null = null;
const CHECK_DELAY = 500; // 0.5 second
const MAX_WAITING_TIME = 30 * 1000; // 30 seconds

function oauthSignin(provider: Provider): Promise<User> {
  if (authWindow !== null && authChecker !== null) {
    authWindow.focus();

    return authChecker;
  }

  const url = stringifyUrl(`/auth/${provider}`, {
    from: `${window.location.origin}${window.location.pathname}?selfClose`,
    site: siteId,
  });

  let timePassed = 0; // in ms

  authWindow = window.open(url);
  authChecker = new Promise((resolve, reject) => {
    (function checkStatus() {
      setTimeout(async () => {
        if (!authWindow?.closed && timePassed < MAX_WAITING_TIME) {
          checkStatus();
          return;
        }

        try {
          const user = await getUser();

          if (user === null) {
            reject();
          } else {
            resolve(user);
          }
        } catch (e) {
          reject(e);
        }

        authChecker = null;
        authWindow = null;
      }, CHECK_DELAY);
    })();
  });

  return authChecker;
}

export type FormProps = {
  oauthProviders: OAuthProvider[];
  formProviders: FormProvider[];
  onSubmit(provider: 'email', username: string, email: string, token?: string): void;
  onSubmit(provider: 'anonymous', username: string): void;
};

const Form: FunctionComponent<FormProps> = ({ oauthProviders, formProviders, onSubmit }) => {
  const intl = useIntl();
  // State of UI
  const [isLoading, setLoading] = useState(false);
  const [showTokenStep, setShowTokenStep] = useState(false);
  const [active, setActive] = useState(formProviders[0]);
  // Field values
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  // Errors
  const [invalidReason, setInvalidReason] = useState<MessageDescriptor | null>(null);
  const [emailInvalidReason, setEmailInvalidReason] = useState<MessageDescriptor | null>(null);
  const [tokenInvalidReason, setTokenInvalidReason] = useState<MessageDescriptor | null>(null);
  const [usernameInvalidReason, setUsernameInvalidReason] = useState<MessageDescriptor | null>(null);

  const handleOauthClick = async (evt: Event) => {
    const { name } = evt.currentTarget as HTMLButtonElement;

    evt.preventDefault();
    await oauthSignin(name as OAuthProvider);
  };

  const handleProviderChange = (evt: Event) => {
    const { value } = evt.currentTarget as HTMLInputElement;

    setInvalidReason(null);
    setUsernameInvalidReason(null);
    setEmailInvalidReason(null);
    setActive(value as FormProvider);
  };

  const handleUsernameChange = (evt: Event) => {
    const { value } = evt.currentTarget as HTMLInputElement;

    setInvalidReason(null);
    setUsernameInvalidReason(null);
    setUsername(value);
  };

  const handleEmailChange = (evt: Event) => {
    const { value } = evt.currentTarget as HTMLInputElement;

    setInvalidReason(null);
    setEmailInvalidReason(null);
    setEmail(value);
  };

  const handleTokenChange = (evt: Event) => {
    const { value } = evt.currentTarget as HTMLInputElement;

    setInvalidReason(null);
    setTokenInvalidReason(null);
    setToken(value);
  };

  const handleSubmit = async (evt: Event) => {
    evt.preventDefault();

    let errors = false;

    if (showTokenStep) {
      const tokenInvalidReason = getTokenInvalidReason(token);

      if (tokenInvalidReason) {
        setTokenInvalidReason(tokenInvalidReason);
        errors = true;
      }
    }

    if (active === 'email') {
      const emailInvalidReason = getEmailInvalidReason(email);

      if (emailInvalidReason) {
        setEmailInvalidReason(emailInvalidReason);
        errors = true;
      }
    }

    const usernameInvalidReason = getUsernameInvalidReason(username);

    if (usernameInvalidReason) {
      setUsernameInvalidReason(usernameInvalidReason);
      errors = true;
    }

    if (errors) {
      return;
    }

    setLoading(true);
    try {
      let usr: User | null = null;

      if (showTokenStep) {
        usr = await verifyEmailSignin(token);
      }
      if (active === 'email') {
        await emailSignin(email, username);
        setShowTokenStep(true);
      } else {
        usr = await anonymousSignin(username);
      }

      console.log(usr);
    } catch (e) {
      setInvalidReason(messages.unexpectedError);
    }
    setLoading(false);
  };

  const handleShowLoginStep = (evt: Event) => {
    evt.preventDefault();

    setToken('');
    setShowTokenStep(false);
  };

  const buttonLabel = showTokenStep ? 'Verify' : 'Submit';

  return (
    <form className={classnames('signin-form', styles.root)} onSubmit={handleSubmit}>
      {showTokenStep ? (
        <>
          <Button onClick={handleShowLoginStep}>Back</Button>
          <InputField
            type="textarea"
            name="token"
            value={token}
            onInput={handleTokenChange}
            placeholder={intl.formatMessage(messages.token)}
            errorMessage={tokenInvalidReason !== null && intl.formatMessage(tokenInvalidReason)}
            disabled={isLoading}
          />
        </>
      ) : (
        <>
          <div className={styles.title}>Sign in</div>
          {oauthProviders.length > 0 && (
            <ul className={classnames(styles.oauth)}>
              {oauthProviders.map((p) => (
                <li className={classnames(styles.oauthItem)}>
                  <OAuthButton provider={p} onClick={handleOauthClick} />
                </li>
              ))}
            </ul>
          )}
          {formProviders.length === 1 ? (
            <div className={styles.provider}>{capitalizeFirstLetter(formProviders[0])}</div>
          ) : (
            <div className={styles.tabs}>
              {formProviders.map((p) => (
                <label key={p} className={styles.provider}>
                  <input
                    className={styles.radio}
                    type="radio"
                    name="form-provider"
                    value={p}
                    onChange={handleProviderChange}
                    checked={p === active}
                  />
                  <span className={styles.providerName}>{capitalizeFirstLetter(p)}</span>
                </label>
              ))}
            </div>
          )}
          <InputField
            name="username"
            value={username}
            onInput={handleUsernameChange}
            placeholder={intl.formatMessage(messages.username)}
            errorMessage={usernameInvalidReason !== null && intl.formatMessage(usernameInvalidReason)}
            disabled={isLoading}
          />
          {active === 'email' && (
            <InputField
              name="email"
              value={email}
              onInput={handleEmailChange}
              placeholder={intl.formatMessage(messages.emailAddress)}
              errorMessage={emailInvalidReason !== null && intl.formatMessage(emailInvalidReason)}
              disabled={isLoading}
            />
          )}
        </>
      )}
      <input className={styles.honeypot} type="checkbox" tabIndex={-1} autoComplete="off" />
      {invalidReason !== null && <div className={styles.error}>{intl.formatMessage(invalidReason)}</div>}
      <Button
        type="submit"
        kind="primary"
        size="middle"
        mix={styles.button}
        title={isLoading ? 'Loading...' : buttonLabel}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : buttonLabel}
      </Button>
    </form>
  );
};

export default Form;
