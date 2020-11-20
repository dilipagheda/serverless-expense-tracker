import 'source-map-support/register'
var moment = require('moment') // require

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { queryExpenses } from '../../businessLogic/expenseitems'
import { createLogger } from '../../utils/logger'
import { QueryExpenseItemRequest } from '../../requests/QueryExpenseItemRequest'

const logger = createLogger('queryExpenseItem')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const queryInfo: QueryExpenseItemRequest = JSON.parse(event.body)
  const authHeader = event.headers.Authorization

  if (
    queryInfo.fromDate &&
    !moment(queryInfo.fromDate, 'DD/MM/YYYY').isValid()
  ) {
    logger.log({
      level: 'error',
      message: `invalid from date ${queryInfo.fromDate}`
    })

    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'invalid from date. format should be DD/MM/YYYY'
      })
    }
  }

  if (queryInfo.toDate && !moment(queryInfo.toDate, 'DD/MM/YYYY').isValid()) {
    logger.log({
      level: 'error',
      message: `invalid to date ${queryInfo.toDate}`
    })

    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'invalid to date. format should be DD/MM/YYYY'
      })
    }
  }

  try {
    const items = await queryExpenses(queryInfo, authHeader)
    logger.log({
      level: 'info',
      message: 'query successful'
    })
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: items
      })
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: error
    })
    if (error.name === 'BadRequestError') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: error.message
        })
      }
    }
  }
}
