
import React, { useEffect, useState } from 'react'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import Auth from '@aws-amplify/auth'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import { BrowserRouter as Router, Switch, Route, NavLink } from 'react-router-dom'
import ExpenseList from './components/ExpenseList'
import ExpenseDetail from './components/ExpenseDetail'
import CreateExpense from './components/CreateExpense'
import EditExpense from './components/EditExpense'

import './styles/App.scss'

const App = (props) => 
{
  const [idToken, setIdToken] = useState()

  useEffect(() => {
    Auth.currentSession().then((data) => {
      console.log('JWT', data.getIdToken().getJwtToken())
      setIdToken(data.getIdToken().getJwtToken())
    })
  },[idToken]) 

  return (
    idToken ? <div className="App">
      <Router>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">Expense Tracker</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <NavLink exact to={`/`} activeClassName="active" className='nav-link' role='button'>Home</NavLink>
              <NavLink exact to={`/add`} activeClassName="active" className='nav-link' role='button'>Add an Expense</NavLink>
            </Nav>
            <Navbar.Text>Signed in as Mark Otto </Navbar.Text>
            <AmplifySignOut />
          </Navbar.Collapse>
        </Navbar>

        <Switch>
          <Route path="/add">
            <CreateExpense idToken={idToken}/>
          </Route>
          <Route path="/edit/:id">
            <EditExpense idToken={idToken} />
          </Route>
          <Route path="/:id">
            <ExpenseDetail idToken={idToken}/>
          </Route>
          <Route path="/">
            <ExpenseList idToken={idToken}/>
          </Route>
        </Switch>
      </Router>
    </div>
    : null
  )
}

export default withAuthenticator(App)
