import 'source-map-support/register'
var moment = require('moment') // require

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { UpdateExpenseItemRequest } from '../../requests/UpdateExpenseItemRequest'
import { updateExpenseItem } from '../../businessLogic/expenseitems'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateExpenseItem')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const expenseId = event.pathParameters.expenseId
  const updatedTodo: UpdateExpenseItemRequest = JSON.parse(event.body)
  const authHeader = event.headers.Authorization

  if (
    (updatedTodo.title && updatedTodo.title.length === 0) ||
    (updatedTodo.description && updatedTodo.description.length === 0) ||
    (updatedTodo.date && updatedTodo.date.length == 0)
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

  if (updatedTodo.date && !moment(updatedTodo.date, 'DD/MM/YYYY').isValid()) {
    logger.log({
      level: 'error',
      message: `invalid date ${updatedTodo.date}`
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

  try {
    const updatedInfo = await updateExpenseItem(
      updatedTodo,
      authHeader,
      expenseId
    )
    logger.log({
      level: 'info',
      message: 'update successful'
    })
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: updatedInfo
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
