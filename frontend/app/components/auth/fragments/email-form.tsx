import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { MessageDescriptor, useIntl } from 'react-intl';
import classnames from 'classnames';

import Button from 'components/button';
import InputField from 'components/auth/components/input-field';

import messages from './messsages';
import { getEmailInvalidReason, getUsernameInvalidReason } from './utils';
import styles from './email-form.module.css';

export type EmailFromProps = {
  onSubmit(user: string, password: string): Promise<void>;
};

const EmailForm: FunctionComponent<EmailFromProps> = ({ onSubmit }) => {
  const intl = useIntl();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [invalidUsernameReason, setUsernameInvalidReason] = useState<MessageDescriptor | null>(null);
  const [invalidEmailReason, setEmailInvalidReason] = useState<MessageDescriptor | null>(null);
  const handleUsernameChange = (evt: Event) => {
    const { value } = evt.target as HTMLInputElement;

    setUsername(value);
    setUsernameInvalidReason(null);
  };

  const handleEmailChange = (evt: Event) => {
    const { value } = evt.target as HTMLInputElement;

    setEmail(value);
    setEmailInvalidReason(null);
  };

  const handleSubmit = async (evt: Event) => {
    const invalidUsernameReason = getUsernameInvalidReason(username);
    const invalidEmailReason = getEmailInvalidReason(email);

    evt.preventDefault();

    if (invalidUsernameReason !== null || invalidEmailReason !== null) {
      setUsernameInvalidReason(invalidUsernameReason);
      setEmailInvalidReason(invalidEmailReason);

      return;
    }

    setLoading(true);
    await onSubmit(username, email);
    setLoading(false);
  };

  return (
    <form className={classnames('email-form', styles.root)} onSubmit={handleSubmit}>
      <InputField
        permanentClassName="email-form-username"
        name="username"
        value={username}
        onInput={handleUsernameChange}
        placeholder={intl.formatMessage(messages.username)}
        errorMessage={invalidUsernameReason !== null && intl.formatMessage(invalidUsernameReason)}
      />
      <InputField
        permanentClassName="email-form-username"
        type="email"
        name="email"
        value={email}
        onInput={handleEmailChange}
        placeholder={intl.formatMessage(messages.emailAddress)}
        errorMessage={invalidEmailReason !== null && intl.formatMessage(invalidEmailReason)}
      />
      <Button mix="auth-anonymous-login-form__submit" type="submit" kind="primary" size="middle" disabled={isLoading}>
        {intl.formatMessage(isLoading ? messages.loading : messages.login)}
      </Button>
    </form>
  );
};

export default EmailForm;
