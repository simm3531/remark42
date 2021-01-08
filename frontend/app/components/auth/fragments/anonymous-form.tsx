import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import classnames from 'classnames';
import { MessageDescriptor, useIntl } from 'react-intl';

import Button from 'components/button';

import { getUsernameInvalidReason } from './utils';
import styles from './anonymous-form.module.css';
import InputField from '../components/input-field';
import messages from './messsages';

type AnonymousFormProps = {
  onSubmit(value: string): Promise<void>;
};

const AnonymousForm: FunctionComponent<AnonymousFormProps> = ({ onSubmit }) => {
  const intl = useIntl();
  const [username, setUsername] = useState('');
  const [invalidReason, setInvalidReason] = useState<MessageDescriptor | null>(null);
  // We use honeypot tequniq to prevent bots to login
  const [honeypot, setHoneypot] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const handleInput = (evt: Event) => {
    const { value } = evt.target as HTMLInputElement;

    setInvalidReason(null);
    setUsername(value);
  };

  const handleHoneypotChange = (evt: Event) => {
    const { checked } = evt.target as HTMLInputElement;

    setHoneypot(checked);
  };

  const handleSubmit = async (evt: Event) => {
    evt.preventDefault();

    const invalidReason = getUsernameInvalidReason(username);

    if (invalidReason !== null) {
      setInvalidReason(invalidReason);
    }
    if (honeypot) {
      // what should i do if bot uncovered?
      window.location.reload();
    }

    setLoading(true);
    await onSubmit(username);
    setLoading(false);
  };

  return (
    <form className={classnames('anonymous-login', styles.root)} onSubmit={handleSubmit}>
      <InputField
        name="username"
        value={username}
        onInput={handleInput}
        placeholder={intl.formatMessage(messages.username)}
        permanentClassName={'anonymous-login-username'}
        errorMessage={invalidReason !== null && intl.formatMessage(invalidReason)}
      />
      <input
        className={styles.honeypot}
        type="checkbox"
        tabIndex={-1}
        autoComplete="off"
        onChange={handleHoneypotChange}
        checked={honeypot}
      />
      <Button mix="auth-anonymous-login-form__submit" type="submit" kind="primary" size="middle" disabled={isLoading}>
        {intl.formatMessage(isLoading ? messages.loading : messages.login)}
      </Button>
    </form>
  );
};

export default AnonymousForm;
