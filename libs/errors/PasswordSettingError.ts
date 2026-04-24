import { BusinessError } from 'libs/errors/BusinessError';

export const PASSWORD_SETTING_ERROR_CODE = 'PASSWORD_SETTING_ERROR';
export const PASSWORD_SETTING_ERROR_MESSAGE = 'Can not set password';

export class PasswordSettingError extends BusinessError {
  constructor(message?: string) {
    super(
      PASSWORD_SETTING_ERROR_CODE,
      message || PASSWORD_SETTING_ERROR_MESSAGE,
    );
    this.name = 'PasswordSettingError';
    Object.setPrototypeOf(this, PasswordSettingError.prototype);
  }
}
