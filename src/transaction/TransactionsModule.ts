import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { TransactionQueryImplement } from 'src/transaction/infrastructure/query/TransactionQueryImplement';
import { TransactionRepositoryImplement } from 'src/transaction/infrastructure/repository/TransactionRepositoryImplement';
import { TransactionEntity } from 'src/transaction/infrastructure/entity/TransactionEntity';

import { TransactionsController } from 'src/transaction/interface/TransactionsController';

import { FindTransactionsHandler } from 'src/transaction/application/query/FindTransactionsHandler';
import { InjectionToken } from 'src/transaction/application/InjectionToken';
import { TransactionDepositedHandler } from 'src/transaction/application/event/TransactionDepositedHandler';
import { TransactionWithdrawnHandler } from 'src/transaction/application/event/TransactionWithdrawnHandler';
import { TransactionRemittedOutHandler } from 'src/transaction/application/event/TransactionRemittedOutHandler';
import { TransactionRemittedInHandler } from 'src/transaction/application/event/TransactionRemittedInHandler';

import { TransactionFactory } from 'src/transaction/domain/TransactionFactory';

const infrastructure: Provider[] = [
  {
    provide: InjectionToken.TRANSACTION_REPOSITORY,
    useClass: TransactionRepositoryImplement,
  },
  {
    provide: InjectionToken.TRANSACTION_QUERY,
    useClass: TransactionQueryImplement,
  },
];

const application = [
  FindTransactionsHandler,
  TransactionDepositedHandler,
  TransactionWithdrawnHandler,
  TransactionRemittedOutHandler,
  TransactionRemittedInHandler,
];

const domain = [TransactionFactory];

@Module({
  imports: [CqrsModule],
  controllers: [TransactionsController],
  providers: [...infrastructure, ...application, ...domain],
})
export class TransactionsModule {}
