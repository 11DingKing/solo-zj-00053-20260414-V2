import { IEvent } from '@nestjs/cqrs';

export class RemittedOutEvent implements IEvent {
  constructor(
    readonly accountId: string,
    readonly email: string,
    readonly amount: number,
    readonly balanceAfter: number,
    readonly receiverId: string,
  ) {}
}
