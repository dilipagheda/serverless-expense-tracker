import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const ExpenseDetail = (props) => {
  let { id } = useParams()

  return (
    <div>
      ExpenseDetail
      <p>id is {id}</p>
    </div>
  )
}

export default ExpenseDetail
