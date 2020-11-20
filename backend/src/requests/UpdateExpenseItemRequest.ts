/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateExpenseItemRequest {
  title?: string
  description?: string
  date?: string
  tags?: Array<string>
  attachmentUrl?: string
  amount?: number
  isTaxDeductible?: boolean
}
