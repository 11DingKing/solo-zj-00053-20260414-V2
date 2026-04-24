import { BusinessError } from 'libs/errors/BusinessError';

export const ACCOUNT_NOT_FOUND_ERROR_CODE = 'ACCOUNT_NOT_FOUND';
export const ACCOUNT_NOT_FOUND_ERROR_MESSAGE = 'Account is not found';

export class AccountNotFoundError extends BusinessError {
  constructor(message?: string) {
    super(
      ACCOUNT_NOT_FOUND_ERROR_CODE,
      message || ACCOUNT_NOT_FOUND_ERROR_MESSAGE,
    );
    this.name = 'AccountNotFoundError';
    Object.setPrototypeOf(this, AccountNotFoundError.prototype);
  }
}
