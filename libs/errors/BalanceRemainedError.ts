import { BusinessError } from 'libs/errors/BusinessError';

export const BALANCE_REMAINED_ERROR_CODE = 'BALANCE_REMAINED';
export const BALANCE_REMAINED_ERROR_MESSAGE = 'Account balance is remained';

export class BalanceRemainedError extends BusinessError {
  constructor(message?: string) {
    super(
      BALANCE_REMAINED_ERROR_CODE,
      message || BALANCE_REMAINED_ERROR_MESSAGE,
    );
    this.name = 'BalanceRemainedError';
    Object.setPrototypeOf(this, BalanceRemainedError.prototype);
  }
}
