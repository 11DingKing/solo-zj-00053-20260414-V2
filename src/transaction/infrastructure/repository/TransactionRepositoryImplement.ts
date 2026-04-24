import { Inject } from '@nestjs/common';

import {
  EntityId,
  EntityIdTransformer,
  ENTITY_ID_TRANSFORMER,
  writeConnection,
} from 'libs/DatabaseModule';

import { TransactionEntity } from 'src/transaction/infrastructure/entity/TransactionEntity';

import { TransactionRepository } from 'src/transaction/domain/TransactionRepository';
import {
  Transaction,
  TransactionProperties,
} from 'src/transaction/domain/Transaction';
import { TransactionFactory } from 'src/transaction/domain/TransactionFactory';

export class TransactionRepositoryImplement implements TransactionRepository {
  @Inject() private readonly transactionFactory: TransactionFactory;
  @Inject(ENTITY_ID_TRANSFORMER)
  private readonly entityIdTransformer: EntityIdTransformer;

  async newId(): Promise<string> {
    return new EntityId().toString();
  }

  async save(data: Transaction | Transaction[]): Promise<void> {
    const models = Array.isArray(data) ? data : [data];
    const entities = models.map((model) => this.modelToEntity(model));
    await writeConnection.manager
      .getRepository(TransactionEntity)
      .save(entities);
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await writeConnection.manager
      .getRepository(TransactionEntity)
      .findOneBy({ id: this.entityIdTransformer.to(id) });
    return entity ? this.entityToModel(entity) : null;
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const entities = await writeConnection.manager
      .getRepository(TransactionEntity)
      .findBy({ accountId: this.entityIdTransformer.to(accountId) });
    return entities.map((entity) => this.entityToModel(entity));
  }

  private modelToEntity(model: Transaction): TransactionEntity {
    const properties = JSON.parse(
      JSON.stringify(model),
    ) as TransactionProperties;
    return {
      ...properties,
      id: this.entityIdTransformer.to(properties.id),
      accountId: this.entityIdTransformer.to(properties.accountId),
      counterpartyId: properties.counterpartyId
        ? this.entityIdTransformer.to(properties.counterpartyId)
        : null,
      createdAt: properties.createdAt,
    } as TransactionEntity;
  }

  private entityToModel(entity: TransactionEntity): Transaction {
    return this.transactionFactory.reconstitute({
      ...entity,
      id: this.entityIdTransformer.from(entity.id),
      accountId: this.entityIdTransformer.from(entity.accountId),
      counterpartyId: entity.counterpartyId
        ? this.entityIdTransformer.from(entity.counterpartyId)
        : null,
      createdAt: entity.createdAt,
    });
  }
}
