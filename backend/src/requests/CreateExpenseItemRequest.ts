/**
 * Fields in a request to create a single Expense item.
 */
export interface CreateExpenseItemRequest {
  title: string
  description: string
  date: string
  amount: number
  tags?: Array<string>
  isTaxDeductible?: boolean
}
