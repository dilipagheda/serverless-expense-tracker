import React, {useEffect, useState} from 'react'
import Table from 'react-bootstrap/Table'
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import {ApiConfig} from '../config'
import axios from 'axios'

const mockData = {
  items: [
    {
      date: '03/11/2020',
      isTaxDeductible: true,
      userId: '92844207-49a6-4366-85eb-36558f5f0b90',
      amount: 10.5,
      description: 'bought from bigw bought from bigw bought from bigw bought from bigw bought from bigw bought from bigw',
      tags: ['bigw', 'cloths'],
      title: 'many cloths 1',
      expenseId: 'af3d7e68-dca5-42b3-94df-efb550e4f41f'
    },
    {
      date: '03/11/2020',
      isTaxDeductible: true,
      userId: '92844207-49a6-4366-85eb-36558f5f0b90',
      amount: 10.5,
      description: 'bought from bigw bought from bigw bought from bigw bought from bigw bought from bigw bought from bigw',
      tags: ['bigw', 'cloths'],
      title: 'many cloths 1',
      expenseId: 'bf3d7e68-dca5-42b3-94df-efb550e4f41f'
    }
  ]
}

const Tags = (props) => {
  if(props.items)
  {
    const renderedTags = props.items.map(item => {
      return (<span className='tag'>{item}</span>)
    })
  
    return (
      <div className='tag-container'>
        {renderedTags}
      </div>
    )
  }else{
    return null
  }
}

const ActionLinks = (props) => {
  const {id, handleDelete, downloadUrl, expenseList} = props
  const expenseItem = expenseList.filter(item => item.expenseId === id)
  const downloadLink = downloadUrl ? <a href={downloadUrl}>Download</a> : null
  return (
    <div class="action-links">
      <Link to={{ pathname: `/edit/${id}`, state: {item: expenseItem[0]} }}>Edit</Link>
      <Button variant="link" onClick={handleDelete}>Delete</Button>
      {downloadLink}
    </div>
  )
}

const ExpenseList = (props) => {

  const {idToken} = props
  const [expenseList, setExpenseList] = useState([])
  const [refresh, setRefresh] = useState(true)

  useEffect(() => {
    if(refresh)
    {
      axios.get(ApiConfig.getExpenseItemUrl, {
        headers: {
          Authorization: idToken
        }
      })
      .then(response => {
        setExpenseList(response.data.items)
        setRefresh(false)
      })
      .catch(error => {
        alert("sorry something went wrong. please check console for logs. you may need to login again as session is expired")
      })
    }
  },[refresh])

  const deleteExpenseById = async (id, idToken) => {
    if(window.confirm("Are you sure you want to delete?"))
    {
      try
      {
        await axios.delete(ApiConfig.deleteExpenseItemUrl(id), {
          headers: {
            Authorization: idToken
          }
        })
        setRefresh(true)
      }
      catch(error)
      {
        console.log(error)
        alert('error while deleting. check the console for errors')
      }
    }
  }

  const renderedRowItems = expenseList.map((item, index) => {
    const truncatedDesc = item.description.length > 27 ? `${item.description.substring(0,30)}...` : item.description
    return (
      <tr>
        <td>{index + 1}</td>
        {/* <td><Link to={`/${item.expenseId}`}>{item.title}</Link></td> */}
        <td>{item.title}</td>
        <td>{truncatedDesc}</td>
        <td>{item.amount}</td>
        <td>{item.date}</td>
        <td><Tags items = {item.tags} /></td>
        <td>
          <ActionLinks 
            handleDelete={() => deleteExpenseById(item.expenseId, idToken)} 
            id={item.expenseId} 
            downloadUrl={item.attachmentUrl}
            expenseList={expenseList}
          />
        </td>
      </tr>
    )
  })

  return (
    <div className="expense-list-container">
      {!refresh ? <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Tags</th>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {renderedRowItems}
        </tbody>
      </Table>
      : <div> Please wait...</div>
    }
    </div>
  )
}

export default ExpenseList