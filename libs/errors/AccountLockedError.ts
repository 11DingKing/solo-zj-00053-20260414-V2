import { BusinessError } from 'libs/errors/BusinessError';

export const ACCOUNT_LOCKED_ERROR_CODE = 'ACCOUNT_LOCKED';
export const ACCOUNT_LOCKED_ERROR_MESSAGE = 'Account is already locked';

export class AccountLockedError extends BusinessError {
  constructor(message?: string) {
    super(ACCOUNT_LOCKED_ERROR_CODE, message || ACCOUNT_LOCKED_ERROR_MESSAGE);
    this.name = 'AccountLockedError';
    Object.setPrototypeOf(this, AccountLockedError.prototype);
  }
}
