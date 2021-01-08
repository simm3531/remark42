import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';

import capitalizeFirstLetter from 'utils/capitalize-first-letter';
import OAuthButton from 'components/auth/components/oauth-button';

import EmailForm from './email-form';
import AnonymousForm from './anonymous-form';
import styles from './auth-panel.module.css';

export type OAuthProvider = 'facebook' | 'twitter' | 'google' | 'yandex' | 'github' | 'microsoft' | 'dev';
export type FormProvider = 'email' | 'anonymous';
export type Provider = OAuthProvider | FormProvider;

const FORM_PROVIDERS_COMPONENTS = {
  anonymous: AnonymousForm,
  email: EmailForm,
};

type FormProvidersProps = {
  formProviders: FormProvider[];
};

const FormProviders: FunctionComponent<FormProvidersProps> = ({ formProviders }) => {
  const [active, setActive] = useState(formProviders[0]);
  const handleSetActive = (evt: Event) => {
    const { dataset } = evt.target as HTMLButtonElement;
    const provider = dataset.provider;

    evt.preventDefault();

    if (!provider) {
      return;
    }

    setActive(provider as FormProvider);
  };

  const ActiveForm = FORM_PROVIDERS_COMPONENTS[active];

  return (
    <div className={classnames('form-providers')}>
      {formProviders.length > 1 && (
        <ul className={classnames('form-providers-list', styles.tabs)}>
          {formProviders.map((p) => (
            <li className={classnames('form-providers-item', styles.tabsItem)}>
              <button
                className={classnames('form-providers-button', styles.tabsButton, {
                  [styles.tabsButtonActive]: p === active,
                })}
                data-provider={p}
                onClick={handleSetActive}
              >
                {capitalizeFirstLetter(p)}
              </button>
            </li>
          ))}
        </ul>
      )}
      <ActiveForm onSubmit={async () => undefined} />
    </div>
  );
};

export type AuthPanelProps = {
  oauthProviders?: OAuthProvider[];
  formProviders?: FormProvider[];
};

const AuthPanel: FunctionComponent<AuthPanelProps> = ({ oauthProviders = [], formProviders = [] }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const handleOpenDropdwon = (evt: Event) => {
    evt.preventDefault();
    setShowDropdown((s) => !s);
  };

  return (
    <div className={classnames('auth-panel', styles.root)}>
      <button
        className={classnames(styles.button, { [styles.buttonActive]: showDropdown })}
        onClick={handleOpenDropdwon}
      >
        <FormattedMessage id="auth.login-and-submit" defaultMessage="Login and Submit" />
      </button>
      <div className={classnames(styles.dropdown, { [styles.dropdownShow]: showDropdown })}>
        <div className={styles.dropdownTitle}>You should signin for submit:</div>
        {oauthProviders.length > 0 && (
          <ul className={classnames(styles.providersList)}>
            {oauthProviders.map((p) => (
              <li className={classnames(styles.providersItem)}>
                <OAuthButton provider={p} />
              </li>
            ))}
          </ul>
        )}
        <FormProviders formProviders={formProviders} />
      </div>
    </div>
  );
};

export default AuthPanel;
