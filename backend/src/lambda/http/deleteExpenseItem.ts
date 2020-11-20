import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { deleteAttachment } from './utils'
import { getExpenseItemById, deleteExpenseItem } from '../../businessLogic/expenseitems'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteExpenseItem')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const expenseId = event.pathParameters.expenseId
  const authHeader = event.headers.Authorization

  try {
    //1. check if todoId already exists and has an attachment Url
    const expenseItem = await getExpenseItemById(authHeader, expenseId)
    if (expenseItem) {
      if (expenseItem.attachmentUrl) {
        //2. delete current attachment first
        await deleteAttachment(expenseItem.attachmentUrl)
        logger.log({
          level: 'info',
          message: 'delete s3 object successful'
        })
      }
      await deleteExpenseItem(authHeader, expenseId)
      logger.log({
        level: 'info',
        message: 'delete dynamodb record successful'
      })
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({})
      }
    } else {
      //return bad request
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'expense item does not exist!'
        })
      }
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: error
    })
  }
}
