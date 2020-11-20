import 'source-map-support/register'
var moment = require('moment') // require

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { CreateExpenseItemRequest } from '../../requests/CreateExpenseItemRequest'
import { createExpenseItem } from '../../businessLogic/expenseitems'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createExpenseItem')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const newExpenseItem: CreateExpenseItemRequest = JSON.parse(event.body)
  const authHeader = event.headers.Authorization

  try {
    if (!newExpenseItem.isTaxDeductible) {
      newExpenseItem.isTaxDeductible = false
    }
    if (
      newExpenseItem.title.length === 0 ||
      newExpenseItem.description.length === 0 ||
      newExpenseItem.date.length == 0
    ) {
      logger.log({
        level: 'error',
        message:
          'expense item title, description and date can not be empty. returning 400'
      })

      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'expense item name, description and date can not be empty!'
        })
      }
    }

    if (!moment(newExpenseItem.date, 'DD/MM/YYYY').isValid()) {
      logger.log({
        level: 'error',
        message: `invalid date ${newExpenseItem.date}`
      })

      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'invalid date. format should be DD/MM/YYYY'
        })
      }
    }

    const expenseItem = await createExpenseItem(newExpenseItem, authHeader)

    logger.log({
      level: 'info',
      message: 'create successful'
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: expenseItem
      })
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: error
    })
  }
}
