import { Transaction } from 'src/transaction/domain/Transaction';

export interface TransactionRepository {
  newId: () => Promise<string>;
  save: (data: Transaction | Transaction[]) => Promise<void>;
  findById: (id: string) => Promise<Transaction | null>;
  findByAccountId: (accountId: string) => Promise<Transaction[]>;
}
