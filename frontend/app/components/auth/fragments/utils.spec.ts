import messages from './messsages';
import { getUsernameInvalidReason, getEmailInvalidReason } from './utils';

describe('getUsernameInvalidReason', () => {
  it('should return message about min length', () => {
    expect(getUsernameInvalidReason('')).toEqual(messages.lengthLimit);
    expect(getUsernameInvalidReason('o')).toEqual(messages.lengthLimit);
    expect(getUsernameInvalidReason('oo')).toEqual(messages.lengthLimit);
  });

  it('should return message about invalid user name', () => {
    expect(getUsernameInvalidReason('     ')).toEqual(messages.symbolLimit);
    expect(getUsernameInvalidReason('*oo')).toEqual(messages.symbolLimit);
  });
  it('should return null for valid user name', () => {
    expect(getUsernameInvalidReason('hello')).toBe(null);
    expect(getUsernameInvalidReason('Раз_Два Три_34567')).toBe(null);
  });
});

describe('getEmailInvalidReason', () => {
  it('should return message about invalid email', () => {
    expect(getEmailInvalidReason('')).toEqual(messages.invalidEmail);
    expect(getEmailInvalidReason('')).toEqual(messages.invalidEmail);
    expect(getEmailInvalidReason('o')).toEqual(messages.invalidEmail);
    expect(getEmailInvalidReason('oo_sad@.ccc')).toEqual(messages.invalidEmail);
    // TODO: Fix regexp for these two cases
    // expect(getEmailInvalidReason('_@.ccc')).toEqual(messages.invalidEmail);
    // expect(getEmailInvalidReason('_@_.ccc')).toEqual(messages.invalidEmail);
  });

  it('should return null for valid user name', () => {
    expect(getEmailInvalidReason('x@x.com')).toBe(null);
    expect(getEmailInvalidReason('u@umputun.com')).toBe(null);
    expect(getEmailInvalidReason('akellbl4@gmail.com')).toBe(null);
    expect(getEmailInvalidReason('hello_buddy@bing.com')).toBe(null);
    expect(getEmailInvalidReason('1asd_@asd.ccc')).toEqual(null);
  });
});
