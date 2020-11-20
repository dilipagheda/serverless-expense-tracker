/**
 * Fields in a request to query expense items.
 */
export interface QueryExpenseItemRequest {
  fromDate?: string
  toDate?: string
  tags?: Array<string>
  isTaxDeductible?: boolean
}
