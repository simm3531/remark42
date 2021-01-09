import { defineMessages } from 'react-intl';

const messages = defineMessages({
  username: {
    id: 'auth.user-name',
    defaultMessage: 'Username',
  },
  lengthLimit: {
    id: 'auth.length-limit',
    defaultMessage: 'Username must be at least 3 characters long',
  },
  symbolLimit: {
    id: 'auth.symbol-limit',
    defaultMessage: 'Username must contain only letters, numbers, underscores or spaces',
  },
  expiredToken: {
    id: 'auth.expired-token',
    defaultMessage: 'Token is expired',
  },
  userNotFound: {
    id: 'auth.user-not-found',
    defaultMessage: 'No user was found',
  },
  unexpectedError: {
    id: 'auth.unexpected-error',
    defaultMessage: 'Something went wrong. Please try again a bit later.',
  },
  loading: {
    id: 'auth.loading',
    defaultMessage: 'Loading...',
  },
  invalidEmail: {
    id: 'auth.invalid-email',
    defaultMessage: 'Address should be valid email address',
  },
  emptyToken: {
    id: 'auth.empty-token',
    defaultMessage: 'Token field must not be empty',
  },
  invalidToken: {
    id: 'auth.invalid-token',
    defaultMessage: 'Token is invalid',
  },
  emailAddress: {
    id: 'auth.email-address',
    defaultMessage: 'Email Address',
  },
  token: {
    id: 'auth.token',
    defaultMessage: 'Token',
  },
  login: {
    id: 'auth.login',
    defaultMessage: 'Sign In',
  },
});
export default messages;
