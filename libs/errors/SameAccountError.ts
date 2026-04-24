import { BusinessError } from 'libs/errors/BusinessError';

export const SAME_ACCOUNT_ERROR_CODE = 'SAME_ACCOUNT';
export const SAME_ACCOUNT_ERROR_MESSAGE =
  'Withdrawal and deposit accounts cannot be the same';

export class SameAccountError extends BusinessError {
  constructor(message?: string) {
    super(SAME_ACCOUNT_ERROR_CODE, message || SAME_ACCOUNT_ERROR_MESSAGE);
    this.name = 'SameAccountError';
    Object.setPrototypeOf(this, SameAccountError.prototype);
  }
}
