export interface ExpenseItemUpdate {
  userId: string
  expenseId: string
  title?: string
  description?: string
  date?: string
  tags?: Array<string>
  attachmentUrl?: string
  amount?: number
  isTaxDeductible?: boolean
}
