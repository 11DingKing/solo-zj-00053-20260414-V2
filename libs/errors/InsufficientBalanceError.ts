import { BusinessError } from 'libs/errors/BusinessError';

export const INSUFFICIENT_BALANCE_ERROR_CODE = 'INSUFFICIENT_BALANCE';
export const INSUFFICIENT_BALANCE_ERROR_MESSAGE =
  'Requested amount exceeds your withdrawal limit';

export class InsufficientBalanceError extends BusinessError {
  constructor(message?: string) {
    super(
      INSUFFICIENT_BALANCE_ERROR_CODE,
      message || INSUFFICIENT_BALANCE_ERROR_MESSAGE,
    );
    this.name = 'InsufficientBalanceError';
    Object.setPrototypeOf(this, InsufficientBalanceError.prototype);
  }
}
