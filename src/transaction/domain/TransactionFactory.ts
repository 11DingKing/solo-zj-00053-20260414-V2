import { Transaction, TransactionProperties } from 'src/transaction/domain/Transaction';
import { TransactionImplement } from 'src/transaction/domain/Transaction';

export class TransactionFactory {
  create(properties: TransactionProperties): Transaction {
    return new TransactionImplement(properties);
  }

  reconstitute(properties: TransactionProperties): Transaction {
    return new TransactionImplement(properties);
  }
}
