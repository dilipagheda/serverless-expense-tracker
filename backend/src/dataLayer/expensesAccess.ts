import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { ExpenseItem } from '../models/ExpenseItem'
import { ExpenseItemUpdate } from '../models/ExpenseItemUpdate'
import { QueryExpenseItem } from '../models/QueryExpenseItem'
import { BadRequestError } from '../validation/BadRequestError'
var moment = require('moment') // require

export class ExpenseItemAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly expenseitemsTable = process.env.EXPENSE_TRACKER_TABLE
  ) {}

  async getAllExpenseItems(userId: string): Promise<ExpenseItem[]> {
    console.log(`Getting all expense items for user: ${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.expenseitemsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    return items as ExpenseItem[]
  }

  async createExpenseItem(expenseItem: ExpenseItem): Promise<ExpenseItem> {
    await this.docClient
      .put({
        TableName: this.expenseitemsTable,
        Item: expenseItem
      })
      .promise()

    return expenseItem
  }

  async updateExpenseItem(
    expenseItem: ExpenseItemUpdate
  ): Promise<ExpenseItem> {
    console.log(expenseItem)

    const result = await this.docClient
      .query({
        TableName: this.expenseitemsTable,
        KeyConditionExpression: 'userId = :userId and expenseId = :expenseId',
        ExpressionAttributeValues: {
          ':userId': expenseItem.userId,
          ':expenseId': expenseItem.expenseId
        }
      })
      .promise()

    if (result.Items.length === 0) {
      throw new BadRequestError('expenseitemId does not exist!')
    }

    var params = {
      TableName: this.expenseitemsTable,
      Key: {
        expenseId: expenseItem.expenseId,
        userId: expenseItem.userId
      },
      UpdateExpression: getUpdateExpression(
        expenseItem.title,
        expenseItem.description,
        expenseItem.date,
        expenseItem.tags,
        expenseItem.attachmentUrl,
        expenseItem.amount,
        expenseItem.isTaxDeductible
      ),
      ExpressionAttributeValues: getExpressionAttributeValues(
        expenseItem.title,
        expenseItem.description,
        expenseItem.date,
        expenseItem.tags,
        expenseItem.attachmentUrl,
        expenseItem.amount,
        expenseItem.isTaxDeductible
      ),
      ReturnValues: 'UPDATED_NEW'
    }
    if (expenseItem.date) {
      params['ExpressionAttributeNames'] = {
        '#d': 'date'
      }
    }
    const newData = await this.docClient.update(params).promise()
    return {
      ...result[0],
      ...newData.Attributes
    } as ExpenseItem
  }

  async getExpenseItemById(
    userId: string,
    expenseitemId: string
  ): Promise<ExpenseItem> {
    const result = await this.docClient
      .query({
        TableName: this.expenseitemsTable,
        KeyConditionExpression: 'userId = :userId and expenseId = :expenseId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':expenseId': expenseitemId
        }
      })
      .promise()

    if (result.Items.length === 0) {
      return null
    }

    return result.Items[0] as ExpenseItem
  }

  async deleteExpenseItem(userId: string, expenseitemId: string) {
    var params = {
      TableName: this.expenseitemsTable,
      Key: {
        expenseId: expenseitemId,
        userId: userId
      }
    }

    await this.docClient.delete(params).promise()
  }

  async queryExpenses(
    query: QueryExpenseItem,
    userId: string
  ): Promise<ExpenseItem[]> {
    console.log('user sent a below query')
    console.log(query)

    const result = await this.docClient
      .query({
        TableName: this.expenseitemsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    let items = result.Items as ExpenseItem[]
    if (query.fromDate && query.toDate) {
      items = items.filter((item) => {
        return moment(item.date, 'DD/MM/YYYY').isBetween(
          moment(query.fromDate, 'DD/MM/YYYY'),
          moment(query.toDate, 'DD/MM/YYYY')
        )
      })
    }

    console.log(`items filtered by date range`)
    console.log(items)

    if (query.tags) {
      items = items.filter((item) => {
        let flag = false
        item.tags.forEach((tag) => {
          query.tags.forEach((queryTag) => {
            if (tag === queryTag) {
              console.log(`${tag}  ${queryTag}`)
              flag = true
            }
          })
        })
        return flag
      })
      console.log(`items filtered by tags`)
      console.log(items)
    }

    if (query.isTaxDeductible !== undefined) {
      items = items.filter(
        (item) => item.isTaxDeductible === query.isTaxDeductible
      )
      console.log('items filtered by is tax deductible flag')
      console.log(items)
    }

    items = items as ExpenseItem[]
    return items
  }
}

function createDynamoDBClient() {
  return new AWS.DynamoDB.DocumentClient()
}

function getExpressionAttributeValues(
  title,
  description,
  date,
  tags,
  attachmentUrl,
  amount,
  isTaxDeductible
) {
  let expr = {
    ':title': title,
    ':description': description,
    ':date': date,
    ':tags': tags,
    ':attachmentUrl': attachmentUrl,
    ':amount': amount,
    ':isTaxDeductible': isTaxDeductible
  }
  if (!title) {
    delete expr[':title']
  }
  if (!description) {
    delete expr[':description']
  }
  if (!date) {
    delete expr[':date']
  }
  if (!tags) {
    delete expr[':tags']
  }
  if (!attachmentUrl) {
    delete expr[':attachmentUrl']
  }
  if (!amount) {
    delete expr[':amount']
  }
  if (isTaxDeductible === undefined) {
    delete expr[':isTaxDeductible']
  }
  return expr
}

function getUpdateExpression(
  title,
  description,
  date,
  tags,
  attachmentUrl,
  amount,
  isTaxDeductible
) {
  let expr = `set `
  let count = 0
  if (title) {
    if (count > 0) {
      expr = `${expr}, `
    }
    expr = `${expr}title = :title`
    count = count + 1
  }
  if (description) {
    if (count > 0) {
      expr = `${expr}, `
    }
    expr = `${expr}description = :description`
    count = count + 1
  }
  if (date) {
    if (count > 0) {
      expr = `${expr}, `
    }
    expr = `${expr}#d = :date`
    count = count + 1
  }
  if (tags) {
    if (count > 0) {
      expr = `${expr}, `
    }
    expr = `${expr}tags = :tags`
    count = count + 1
  }
  if (attachmentUrl) {
    if (count > 0) {
      expr = `${expr}, `
    }
    expr = `${expr}attachmentUrl = :attachmentUrl`
    count = count + 1
  }
  if (amount) {
    if (count > 0) {
      expr = `${expr}, `
    }
    expr = `${expr}amount = :amount`
    count = count + 1
  }
  if (isTaxDeductible !== undefined) {
    if (count > 0) {
      expr = `${expr}, `
    }
    expr = `${expr}isTaxDeductible = :isTaxDeductible`
    count = count + 1
  }
  return expr
}
