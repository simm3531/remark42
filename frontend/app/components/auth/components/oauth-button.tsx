import { h, FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { defineMessages, useIntl } from 'react-intl';
import classnames from 'classnames';

import type { OAuthProvider } from 'common/types';
import capitalizeFirstLetter from 'utils/capitalize-first-letter';

import styles from './oauth-button.module.css';

const OAUTH_ICONS: Record<string, string> = {
  facebook: require('./assets/facebook.svg').default as string,
  twitter: require('./assets/twitter.svg').default as string,
  google: require('./assets/google.svg').default as string,
  github: require('./assets/github.svg').default as string,
  microsoft: require('./assets/microsoft.svg').default as string,
  yandex: require('./assets/yandex.svg').default as string,
};

if (process.env.NODE_ENV === 'development') {
  Object.assign(OAUTH_ICONS, { dev: require('./assets/dev.svg').default as string });
}

type OAuthIconProps = {
  provider: OAuthProvider;
  onClick(evt: Event): void;
};

const OAuthButton: FunctionComponent<OAuthIconProps> = ({ provider, onClick }) => {
  const intl = useIntl();
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const url = OAUTH_ICONS[provider];

    if (!url) {
      return;
    }

    fetch(`./${url}`)
      .then((res) => res.text())
      .then((icon) => {
        if (!mounted) {
          return;
        }
        setIcon(icon);
      });

    return () => {
      mounted = false;
    };
  }, [provider]);

  if (icon === null) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      name={provider}
      className={classnames('oath-button', styles.root)}
      title={`${intl.formatMessage(messages.buttonTitle)} ${capitalizeFirstLetter(provider)}`}
      dangerouslySetInnerHTML={{ __html: icon }} // eslint-disable-line react/no-danger
    />
  );
};

const messages = defineMessages({
  buttonTitle: {
    id: 'oauth-button',
    defaultMessage: 'Login via',
  },
});

export default OAuthButton;
