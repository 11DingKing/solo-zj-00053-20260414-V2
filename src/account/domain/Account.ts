import { AggregateRoot } from '@nestjs/cqrs';

import {
  InsufficientBalanceError,
  InvalidAmountError,
  BalanceRemainedError,
  AccountLockedError,
  INVALID_AMOUNT_ERROR_MESSAGE,
  INSUFFICIENT_BALANCE_ERROR_MESSAGE,
  BALANCE_REMAINED_ERROR_MESSAGE,
  ACCOUNT_LOCKED_ERROR_MESSAGE,
} from 'libs/errors';
import { AccountClosedEvent } from 'src/account/domain/event/AccountClosedEvent';
import { AccountOpenedEvent } from 'src/account/domain/event/AccountOpenedEvent';
import { DepositedEvent } from 'src/account/domain/event/DepositedEvent';
import { PasswordUpdatedEvent } from 'src/account/domain/event/PasswordUpdatedEvent';
import { WithdrawnEvent } from 'src/account/domain/event/WithdrawnEvent';
import { RemittedOutEvent } from 'src/account/domain/event/RemittedOutEvent';
import { RemittedInEvent } from 'src/account/domain/event/RemittedInEvent';

export type AccountEssentialProperties = Readonly<
  Required<{
    id: string;
    name: string;
    email: string;
  }>
>;

export type AccountOptionalProperties = Readonly<
  Partial<{
    password: string;
    balance: number;
    lockedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    version: number;
  }>
>;

export type AccountProperties = AccountEssentialProperties &
  Required<AccountOptionalProperties>;

export interface Account {
  compareId: (id: string) => boolean;
  getId: () => string;
  open: () => void;
  updatePassword: (password: string) => void;
  withdraw: (amount: number) => void;
  deposit: (amount: number) => void;
  remitOut: (amount: number, receiverId: string) => void;
  remitIn: (amount: number, senderId: string) => void;
  close: () => void;
  lock: () => void;
  commit: () => void;
}

export class AccountImplement extends AggregateRoot implements Account {
  private readonly id: string;
  private readonly name: string;
  private readonly email: string;
  private password: string;
  private balance: number;
  private lockedAt: Date | null;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;
  private version;

  constructor(properties: AccountProperties) {
    super();
    Object.assign(this, properties);
  }
  commit: () => void;

  compareId(id: string): boolean {
    return id === this.id;
  }

  getId(): string {
    return this.id;
  }

  open(): void {
    this.apply(new AccountOpenedEvent(this.id, this.email));
  }

  updatePassword(password: string): void {
    this.password = password;
    this.updatedAt = new Date();
    this.apply(new PasswordUpdatedEvent(this.id, this.email));
  }

  withdraw(amount: number): void {
    if (amount < 1) throw new InvalidAmountError(INVALID_AMOUNT_ERROR_MESSAGE);
    if (this.balance < amount)
      throw new InsufficientBalanceError(INSUFFICIENT_BALANCE_ERROR_MESSAGE);
    this.balance -= amount;
    this.updatedAt = new Date();
    this.apply(new WithdrawnEvent(this.id, this.email, amount, this.balance));
  }

  deposit(amount: number): void {
    if (amount < 1) throw new InvalidAmountError(INVALID_AMOUNT_ERROR_MESSAGE);
    this.balance += amount;
    this.updatedAt = new Date();
    this.apply(new DepositedEvent(this.id, this.email, amount, this.balance));
  }

  remitOut(amount: number, receiverId: string): void {
    if (amount < 1) throw new InvalidAmountError(INVALID_AMOUNT_ERROR_MESSAGE);
    if (this.balance < amount)
      throw new InsufficientBalanceError(INSUFFICIENT_BALANCE_ERROR_MESSAGE);
    this.balance -= amount;
    this.updatedAt = new Date();
    this.apply(
      new RemittedOutEvent(
        this.id,
        this.email,
        amount,
        this.balance,
        receiverId,
      ),
    );
  }

  remitIn(amount: number, senderId: string): void {
    if (amount < 1) throw new InvalidAmountError(INVALID_AMOUNT_ERROR_MESSAGE);
    this.balance += amount;
    this.updatedAt = new Date();
    this.apply(
      new RemittedInEvent(this.id, this.email, amount, this.balance, senderId),
    );
  }

  close(): void {
    if (this.balance > 0)
      throw new BalanceRemainedError(BALANCE_REMAINED_ERROR_MESSAGE);
    this.deletedAt = new Date();
    this.updatedAt = new Date();
    this.apply(new AccountClosedEvent(this.id, this.email));
  }

  lock(): void {
    if (this.lockedAt)
      throw new AccountLockedError(ACCOUNT_LOCKED_ERROR_MESSAGE);
    this.lockedAt = new Date();
    this.updatedAt = new Date();
    this.version += 1;
  }
}
