import * as uuid from 'uuid'
import { ExpenseItem } from '../models/ExpenseItem'
import { ExpenseItemAccess } from '../dataLayer/expensesAccess'
import { CreateExpenseItemRequest } from '../requests/CreateExpenseItemRequest'
import { UpdateExpenseItemRequest } from '../requests/UpdateExpenseItemRequest'
import { QueryExpenseItemRequest } from '../requests/QueryExpenseItemRequest'
import { parseUserId, getToken } from '../auth/utils'
import { ExpenseItemUpdate } from '../models/ExpenseItemUpdate'

const expenseitemsAccess = new ExpenseItemAccess()

export async function getAllExpenseItems(
  authHeader: string
): Promise<ExpenseItem[]> {
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)
  return expenseitemsAccess.getAllExpenseItems(userId)
}

export async function queryExpenses(
  query: QueryExpenseItemRequest,
  authHeader: string
): Promise<ExpenseItem[]> {
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)
  return expenseitemsAccess.queryExpenses(query, userId)
}

export async function createExpenseItem(
  createExpenseItemRequest: CreateExpenseItemRequest,
  authHeader: string
): Promise<ExpenseItem> {
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)
  const itemId = uuid.v4()

  return await expenseitemsAccess.createExpenseItem({
    expenseId: itemId,
    userId: userId,
    title: createExpenseItemRequest.title,
    description: createExpenseItemRequest.description,
    date: createExpenseItemRequest.date,
    tags: createExpenseItemRequest.tags,
    amount: createExpenseItemRequest.amount,
    isTaxDeductible: createExpenseItemRequest.isTaxDeductible
  })
}

export async function updateExpenseItem(
  updateExpenseItemRequest: UpdateExpenseItemRequest,
  authHeader: string,
  expenseitemId: string
): Promise<ExpenseItem> {
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)

  const updateInfo: ExpenseItemUpdate = {
    expenseId: expenseitemId,
    userId: userId,
    title: updateExpenseItemRequest.title,
    description: updateExpenseItemRequest.description,
    amount: updateExpenseItemRequest.amount,
    date: updateExpenseItemRequest.date,
    tags: updateExpenseItemRequest.tags,
    attachmentUrl: updateExpenseItemRequest.attachmentUrl,
    isTaxDeductible: updateExpenseItemRequest.isTaxDeductible
  }

  return await expenseitemsAccess.updateExpenseItem(updateInfo)
}

export async function getExpenseItemById(
  authHeader: string,
  expenseitemId: string
): Promise<ExpenseItem> {
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)

  return await expenseitemsAccess.getExpenseItemById(userId, expenseitemId)
}

export async function deleteExpenseItem(
  authHeader: string,
  expenseitemId: string
) {
  const jwtToken = getToken(authHeader)
  const userId = parseUserId(jwtToken)
  await expenseitemsAccess.deleteExpenseItem(userId, expenseitemId)
}
