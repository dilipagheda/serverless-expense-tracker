export interface QueryExpenseItem {
  fromDate?:string
  toDate?:string
  tags?: Array<string>
  isTaxDeductible?: boolean
}
