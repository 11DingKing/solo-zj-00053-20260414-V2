import { TransactionType } from 'src/transaction/domain/TransactionType';

export type TransactionEssentialProperties = Readonly<
  Required<{
    id: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    balanceAfter: number;
  }>
>;

export type TransactionOptionalProperties = Readonly<
  Partial<{
    counterpartyId: string | null;
    description: string | null;
    createdAt: Date;
  }>
>;

export type TransactionProperties = TransactionEssentialProperties &
  Required<TransactionOptionalProperties>;

export interface Transaction {
  getId: () => string;
  getAccountId: () => string;
  getType: () => TransactionType;
  getAmount: () => number;
  getBalanceAfter: () => number;
  getCounterpartyId: () => string | null;
  getDescription: () => string | null;
  getCreatedAt: () => Date;
}

export class TransactionImplement implements Transaction {
  private readonly id: string;
  private readonly accountId: string;
  private readonly type: TransactionType;
  private readonly amount: number;
  private readonly balanceAfter: number;
  private readonly counterpartyId: string | null;
  private readonly description: string | null;
  private readonly createdAt: Date;

  constructor(properties: TransactionProperties) {
    Object.assign(this, properties);
  }

  getId(): string {
    return this.id;
  }

  getAccountId(): string {
    return this.accountId;
  }

  getType(): TransactionType {
    return this.type;
  }

  getAmount(): number {
    return this.amount;
  }

  getBalanceAfter(): number {
    return this.balanceAfter;
  }

  getCounterpartyId(): string | null {
    return this.counterpartyId;
  }

  getDescription(): string | null {
    return this.description;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
