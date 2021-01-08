import { MessageDescriptor } from 'react-intl';
import messages from './messsages';

const MIN_LENGTH = 3;
const EMAIL_REGEXP = /[^@]+@[^.]+\..+/;
const USERNAME_REGEXP = /^[\p{L}\d_ ]+$/u;

export function getUsernameInvalidReason(username: string): MessageDescriptor | null {
  if (username.length < MIN_LENGTH) {
    return messages.lengthLimit;
  }

  if (!USERNAME_REGEXP.test(username.trim())) {
    return messages.symbolLimit;
  }

  return null;
}

export function getEmailInvalidReason(email: string): MessageDescriptor | null {
  if (!EMAIL_REGEXP.test(email)) {
    return messages.invalidEmail;
  }

  return null;
}
