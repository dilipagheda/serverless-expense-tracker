const apiId = 'ur46469dea'
const region = 'ap-southeast-2'

export const ApiConfig = {
  createExpenseItemUrl: `https://${apiId}.execute-api.${region}.amazonaws.com/dev/expense`,
  getExpenseItemUrl: `https://${apiId}.execute-api.${region}.amazonaws.com/dev/expenses`,
  generateUploadUrl: (expenseId, fileName) => {
    console.log(`generateUploadUrl ${fileName}`)
    return `https://${apiId}.execute-api.${region}.amazonaws.com/dev/expenses/${expenseId}/attachment?filename=${fileName}`
  },
  deleteExpenseItemUrl: (expenseId) => `https://${apiId}.execute-api.${region}.amazonaws.com/dev/expenses/${expenseId}`,
  updateExpenseItemUrl: (expenseId) => `https://${apiId}.execute-api.${region}.amazonaws.com/dev/expenses/${expenseId}`
}