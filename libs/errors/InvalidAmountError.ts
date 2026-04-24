import { BusinessError } from 'libs/errors/BusinessError';

export const INVALID_AMOUNT_ERROR_CODE = 'INVALID_AMOUNT';
export const INVALID_AMOUNT_ERROR_MESSAGE = 'Invalid transaction amount';

export class InvalidAmountError extends BusinessError {
  constructor(message?: string) {
    super(INVALID_AMOUNT_ERROR_CODE, message || INVALID_AMOUNT_ERROR_MESSAGE);
    this.name = 'InvalidAmountError';
    Object.setPrototypeOf(this, InvalidAmountError.prototype);
  }
}
