import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

import { getAllExpenseItems } from '../../businessLogic/expenseitems'
import { createLogger } from '../../utils/logger'
const logger = createLogger('getExpenseItems')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const authHeader = event.headers.Authorization
  try {
    let todoItems = await getAllExpenseItems(authHeader)

    logger.log({
      level: 'info',
      message: 'items successfully retrieved'
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: todoItems
      })
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: error.message
    })
  }
}
