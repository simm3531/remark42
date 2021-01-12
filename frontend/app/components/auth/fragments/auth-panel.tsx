import { h, Fragment, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { useIntl, FormattedMessage, MessageDescriptor } from 'react-intl';
import classnames from 'classnames';

import type { OAuthProvider, FormProvider, User } from 'common/types';
import Button from 'components/button';
import capitalizeFirstLetter from 'utils/capitalize-first-letter';

import InputField from '../components/input-field';
import OAuthButton from '../components/oauth-button';
import { useDropdown } from './auth-panel.hooks';
import { anonymousSignin, emailSignin, verifyEmailSignin, oauthSignin } from './auth-panel.api';
import { getTokenInvalidReason, getEmailInvalidReason, getUsernameInvalidReason } from './utils';
import messages from './messsages';
import styles from './auth-panel.module.css';

export type AuthPanelProps = {
  oauthProviders?: OAuthProvider[];
  formProviders?: FormProvider[];
};

const AuthPanel: FunctionComponent<AuthPanelProps> = ({ oauthProviders = [], formProviders = [] }) => {
  const intl = useIntl();
  // State of UI
  const [isLoading, setLoading] = useState(false);
  const [showTokenStep, setShowTokenStep] = useState(false);
  const [active, setActive] = useState(formProviders[0]);
  const [ref, isDropdownShowed, toggleDropdownState] = useDropdown(showTokenStep);
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
    <div className={classnames('auth-panel', styles.root)} ref={ref}>
      <button
        className={classnames(styles.button, { [styles.buttonActive]: isDropdownShowed })}
        onClick={toggleDropdownState}
      >
        <FormattedMessage id="auth.signin" defaultMessage="Sign In" />
      </button>
      <div className={classnames(styles.dropdown, { [styles.dropdownShow]: isDropdownShowed })}>
        <form className={classnames('signin-form', styles.form)} onSubmit={handleSubmit}>
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
            mix={styles.submit}
            title={isLoading ? 'Loading...' : buttonLabel}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : buttonLabel}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthPanel;
