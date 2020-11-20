import React, {useState, useEffect} from 'react'
import { useForm, Controller } from "react-hook-form";
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container'
import NumberFormat from 'react-number-format';
import DatePicker from 'react-date-picker';
import Button from 'react-bootstrap/Button'
import moment from 'moment';
import FormFile from 'react-bootstrap/FormFile'
import axios from 'axios';
import {ApiConfig} from '../config'
import { Redirect } from 'react-router-dom'

const CreateExpense = (props) => {
  const {idToken} = props
  const { register, errors, handleSubmit, control, setValue } = useForm();

  const [expenseDate, setExpenseDate] = useState();
  const [customErrors, setCustomErrors] = useState({amount:{}, expenseDate:{}});
  const [wait, setWait] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const onSubmit = async (data) => {
    console.log(data)
    console.log(errors)

    if(!data.amount)
    {
      setCustomErrors({...customErrors, amount: {message: "Expense amount is required"}})
    }else{
      setCustomErrors({...customErrors, amount:{}})
    }

    //make an API call here
    setWait(true)
    try
    {
      const createExpenseItemResponse = await axios.post(ApiConfig.createExpenseItemUrl, {
        title: data.title,
        description: data.description,
        date: data.expenseDate,
        amount: parseFloat(data.amount),
        tags: data.tags ? data.tags.split(',') : []
      }, {
        headers: {
          Authorization: idToken
        }
      })

      if(data.expenseReceipt)
      {
        const newExpenseItem = createExpenseItemResponse.data
  
        const generateUploadUrlResponse = await axios.post(ApiConfig.generateUploadUrl(newExpenseItem.item.expenseId, data.expenseReceipt.name), null, {
          headers: {
            Authorization: idToken
          }
        })
        await axios.put(generateUploadUrlResponse.data.uploadUrl, data.expenseReceipt )
      }
      setIsDone(true)
    }catch(error)
    {
      alert("sorry. something went wrong. check console for error log")
      console.log(error)
      setWait(false)
    }
  }

  const handleChange = (val) => {
    setExpenseDate(val)
  }

  useEffect(() => {
    console.log('my token '+ idToken)
    if(expenseDate && !moment(expenseDate).isValid())
    {
      setCustomErrors({...customErrors, expenseDate: {message: "Expense date is not valid"}})
    }else{
      setCustomErrors({...customErrors, expenseDate:{}})
    }
    const formattedVal = moment(expenseDate).format('DD/MM/YYYY')
    setValue("expenseDate", formattedVal);
    console.log(`useEffect expenseDate ${expenseDate}`)
  }, [expenseDate])
  
  useEffect(() => {
    register("expenseDate")
    register("amount")
    register("expenseReceipt")
    setExpenseDate(new Date())
  }, [register])

  return (
    isDone ? <Redirect to='/' />
    : <Container className="create-expense-form-container">
      <Row>
        <Col xs={12} md={8}>
          <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group controlId="title">
                <Form.Label>Title</Form.Label>
                <Controller
                  as={<Form.Control name="title" type="text" />}
                  name="title"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Expense title is required", maxLength: 50 }}
                />
                {errors.title && <span>{errors.title.message}</span>}
              </Form.Group>     
              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Controller
                  as={<Form.Control name="description" type="text" />}
                  name="description"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Expense description is required", maxLength: 50 }}
                />
                {errors.description && <span>{errors.description.message}</span>}
              </Form.Group>
              <Form.Group controlId="date">
                <Form.Label>Expense Date</Form.Label>
                <div className="date-format-label">Expense date can not be in future</div>
                <DatePicker
                  value={expenseDate}
                  format="dd/MM/y"
                  dayPlaceholder="DD"
                  monthPlaceholder="MM"
                  yearPlaceholder="YYYY"
                  maxDate={new Date()}
                  required={true}
                  onChange={handleChange}
                />
                {customErrors.expenseDate.message && <span>{customErrors.expenseDate.message}</span>}
              </Form.Group>
              <Form.Group controlId="amount">
                <Form.Label>Amount</Form.Label>
                <NumberFormat
                    id="amount" 
                    allowNegative={false} 
                    thousandSeparator={true} 
                    prefix={'$'} 
                    decimalScale={2} 
                    className="form-control" 
                    maxLength={16}
                    onValueChange={(values) => {
                      const {value} = values;
                      setValue("amount", value)
                    }}/>
                {customErrors.amount.message && <span>{customErrors.amount.message}</span>}
              </Form.Group>
              <Form.Group controlId="expenseReceipt">
                <Form.File id="expenseReceipt">
                  <Form.File.Label>Please select an expense receipt to upload:</Form.File.Label>
                  <FormFile.Input onChange={(e) => {
                          console.log("afd")
                          console.log(e.target.files[0])
                          setValue("expenseReceipt", e.target.files[0])
                        }}/>
                  </Form.File>
              </Form.Group>
              <Form.Group controlId="tags">
                <Form.Label>Tags <span className='tags-help'>(add comma seperated tags. e.g., electronics, computer, personal-use)</span></Form.Label>
                <Controller
                  as={<Form.Control name="tags" type="text" />}
                  name="tags"
                  control={control}
                  defaultValue=""
                />
                {errors.title && <span>{errors.title.message}</span>}
              </Form.Group>     
              {
                wait ? <div>Please wait..</div> : <Button type="submit" variant="primary">Submit</Button>
              }
              
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default CreateExpense