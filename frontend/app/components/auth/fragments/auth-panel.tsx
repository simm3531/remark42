import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';

import type { FormProvider, OAuthProvider } from 'common/types';

import Form from './form';
import styles from './auth-panel.module.css';

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
  const handleSubmitForm = async (provider: FormProvider, username: string, email?: string) => {
    return undefined;
  };

  return (
    <div className={classnames('auth-panel', styles.root)}>
      <button
        className={classnames(styles.button, { [styles.buttonActive]: showDropdown })}
        onClick={handleOpenDropdwon}
      >
        <FormattedMessage id="auth.submit" defaultMessage="Submit" />
      </button>
      <div className={classnames(styles.dropdown, { [styles.dropdownShow]: showDropdown })}>
        <Form oauthProviders={oauthProviders} formProviders={formProviders} onSubmit={handleSubmitForm} />
      </div>
    </div>
  );
};

export default AuthPanel;
