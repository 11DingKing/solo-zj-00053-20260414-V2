import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  HttpStatus,
  NotFoundException,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Auth, AuthorizedHeader } from 'libs/Auth';

import { FindTransactionsRequestQueryString } from 'src/transaction/interface/dto/FindTransactionsRequestQueryString';
import { FindTransactionsResponseDto } from 'src/transaction/interface/dto/FindTransactionsResponseDto';
import { TransactionSummaryRequestQueryString } from 'src/transaction/interface/dto/TransactionSummaryRequestQueryString';
import { TransactionSummaryResponseDto } from 'src/transaction/interface/dto/TransactionSummaryResponseDto';
import { ResponseDescription } from 'src/account/interface/ResponseDescription';

import { FindTransactionsQuery } from 'src/transaction/application/query/FindTransactionsQuery';
import { TransactionQuery } from 'src/transaction/application/query/TransactionQuery';
import { InjectionToken } from 'src/transaction/application/InjectionToken';
import { Inject } from '@nestjs/common';

import { ErrorMessage } from 'src/account/domain/ErrorMessage';

@ApiTags('Transactions')
@Controller()
export class TransactionsController {
  constructor(
    readonly queryBus: QueryBus,
    @Inject(InjectionToken.TRANSACTION_QUERY)
    private readonly transactionQuery: TransactionQuery,
  ) {}

  @Auth()
  @Get('accounts/:accountId/transactions')
  @UseInterceptors(CacheInterceptor)
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseDescription.OK,
    type: FindTransactionsResponseDto,
  })
  @ApiBadRequestResponse({ description: ResponseDescription.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ResponseDescription.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ResponseDescription.UNAUTHORIZED })
  @ApiInternalServerErrorResponse({
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
  })
  async findTransactions(
    @Headers() header: AuthorizedHeader,
    @Param('accountId') accountId: string,
    @Query() querystring: FindTransactionsRequestQueryString,
  ): Promise<FindTransactionsResponseDto> {
    if (header.accountId !== accountId)
      throw new NotFoundException(ErrorMessage.ACCOUNT_IS_NOT_FOUND);

    const query = new FindTransactionsQuery({
      accountId,
      type: querystring.type,
      startDate: querystring.startDate
        ? new Date(querystring.startDate)
        : undefined,
      endDate: querystring.endDate ? new Date(querystring.endDate) : undefined,
      skip: querystring.skip,
      take: querystring.take,
    });

    return this.queryBus.execute(query);
  }

  @Auth()
  @Get('accounts/:accountId/transactions/summary')
  @UseInterceptors(CacheInterceptor)
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseDescription.OK,
    type: TransactionSummaryResponseDto,
  })
  @ApiBadRequestResponse({ description: ResponseDescription.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ResponseDescription.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ResponseDescription.UNAUTHORIZED })
  @ApiInternalServerErrorResponse({
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
  })
  async getTransactionSummary(
    @Headers() header: AuthorizedHeader,
    @Param('accountId') accountId: string,
    @Query() querystring: TransactionSummaryRequestQueryString,
  ): Promise<TransactionSummaryResponseDto> {
    if (header.accountId !== accountId)
      throw new NotFoundException(ErrorMessage.ACCOUNT_IS_NOT_FOUND);

    return this.transactionQuery.getSummary(
      accountId,
      querystring.startDate ? new Date(querystring.startDate) : undefined,
      querystring.endDate ? new Date(querystring.endDate) : undefined,
    );
  }

  @Auth()
  @Get('accounts/:accountId/transactions/export')
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseDescription.OK,
  })
  @ApiBadRequestResponse({ description: ResponseDescription.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ResponseDescription.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ResponseDescription.UNAUTHORIZED })
  @ApiInternalServerErrorResponse({
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
  })
  async exportTransactions(
    @Headers() header: AuthorizedHeader,
    @Param('accountId') accountId: string,
    @Query() querystring: TransactionSummaryRequestQueryString,
  ): Promise<{ data: string; filename: string }> {
    if (header.accountId !== accountId)
      throw new NotFoundException(ErrorMessage.ACCOUNT_IS_NOT_FOUND);

    const query = new FindTransactionsQuery({
      accountId,
      startDate: querystring.startDate
        ? new Date(querystring.startDate)
        : undefined,
      endDate: querystring.endDate ? new Date(querystring.endDate) : undefined,
      skip: 0,
      take: 10000,
    });

    const result = await this.queryBus.execute(query);
    const summary = await this.transactionQuery.getSummary(
      accountId,
      querystring.startDate ? new Date(querystring.startDate) : undefined,
      querystring.endDate ? new Date(querystring.endDate) : undefined,
    );

    let csv = 'ID,Type,Amount,Balance After,Counterparty,Description,Date\n';
    for (const tx of result.transactions) {
      csv += `${tx.id},${tx.type},${tx.amount},${tx.balanceAfter},${
        tx.counterpartyId || ''
      },${tx.description || ''},${tx.createdAt.toISOString()}\n`;
    }

    csv += '\nSummary\n';
    csv += `Total Deposit,${summary.totalDeposit}\n`;
    csv += `Total Withdraw,${summary.totalWithdraw}\n`;
    csv += `Total Remit Out,${summary.totalRemitOut}\n`;
    csv += `Total Remit In,${summary.totalRemitIn}\n`;
    csv += `Net Change,${summary.netChange}\n`;

    const filename = `transactions_${accountId}_${
      new Date().toISOString().split('T')[0]
    }.csv`;

    return { data: csv, filename };
  }
}
