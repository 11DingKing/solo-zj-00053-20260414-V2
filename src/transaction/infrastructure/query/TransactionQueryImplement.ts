import { Inject, Injectable } from '@nestjs/common';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

import {
  EntityIdTransformer,
  ENTITY_ID_TRANSFORMER,
  readConnection,
} from 'libs/DatabaseModule';

import { TransactionEntity } from 'src/transaction/infrastructure/entity/TransactionEntity';

import { TransactionQuery } from 'src/transaction/application/query/TransactionQuery';
import { FindTransactionsQuery } from 'src/transaction/application/query/FindTransactionsQuery';
import { FindTransactionsResult } from 'src/transaction/application/query/FindTransactionsResult';
import { TransactionType } from 'src/transaction/domain/TransactionType';

@Injectable()
export class TransactionQueryImplement implements TransactionQuery {
  @Inject(ENTITY_ID_TRANSFORMER)
  private readonly entityIdTransformer: EntityIdTransformer;

  async find(query: FindTransactionsQuery): Promise<FindTransactionsResult> {
    const repository = readConnection.getRepository(TransactionEntity);

    const where: any = {
      accountId: this.entityIdTransformer.to(query.accountId),
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.startDate && query.endDate) {
      where.createdAt = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      where.createdAt = MoreThanOrEqual(query.startDate);
    } else if (query.endDate) {
      where.createdAt = LessThanOrEqual(query.endDate);
    }

    const [entities, total] = await repository.findAndCount({
      where,
      skip: query.skip,
      take: query.take,
      order: { createdAt: 'DESC' },
    });

    return {
      transactions: entities.map((entity) => ({
        id: this.entityIdTransformer.from(entity.id),
        accountId: this.entityIdTransformer.from(entity.accountId),
        type: entity.type,
        amount: entity.amount,
        balanceAfter: entity.balanceAfter,
        counterpartyId: entity.counterpartyId
          ? this.entityIdTransformer.from(entity.counterpartyId)
          : null,
        description: entity.description,
        createdAt: entity.createdAt,
      })),
      total,
    };
  }

  async getSummary(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalDeposit: number;
    totalWithdraw: number;
    totalRemitOut: number;
    totalRemitIn: number;
    netChange: number;
  }> {
    const repository = readConnection.getRepository(TransactionEntity);

    const where: any = {
      accountId: this.entityIdTransformer.to(accountId),
    };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }

    const entities = await repository.findBy(where);

    let totalDeposit = 0;
    let totalWithdraw = 0;
    let totalRemitOut = 0;
    let totalRemitIn = 0;

    for (const entity of entities) {
      switch (entity.type) {
        case TransactionType.DEPOSIT:
          totalDeposit += entity.amount;
          break;
        case TransactionType.WITHDRAW:
          totalWithdraw += entity.amount;
          break;
        case TransactionType.REMIT_OUT:
          totalRemitOut += entity.amount;
          break;
        case TransactionType.REMIT_IN:
          totalRemitIn += entity.amount;
          break;
      }
    }

    const netChange =
      totalDeposit + totalRemitIn - totalWithdraw - totalRemitOut;

    return {
      totalDeposit,
      totalWithdraw,
      totalRemitOut,
      totalRemitIn,
      netChange,
    };
  }
}
