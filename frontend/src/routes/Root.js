import React, { Component } from 'react'
import Loadable from 'react-loadable'
import { Router } from '@reach/router'
import axios from 'axios'

import BaseLoading from '../views/Loading'
import { CurrentUserContext } from '../contexts'
import * as authUtil from '../utils/auth'

const Loading = () => <BaseLoading fullWidth />

const AsyncLogin = Loadable({
  loader: () => import('./Login'),
  loading: Loading
})

const AsyncHome = Loadable({
  loader: () => import('./Home'),
  loading: Loading
})

const AsyncUserList = Loadable({
  loader: () => import('./UserList'),
  loading: Loading
})

class Root extends Component {
  state = {
    currentUser: {
      id: '',
      name: '',
      email: ''
    }
  }

  setCurrentUser = user => {
    this.setState({
      currentUser: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  }

  componentDidMount() {
    if (authUtil.isAuthenticated()) {
      axios
        .get('/me')
        .then(res => {
          const { data: validatedUser } = res
          const user = authUtil.getCurrentUser()
          authUtil.setCurrentUser({
            ...user,
            ...validatedUser
          })
          this.setState({
            currentUser: {
              id: user.id,
              name: user.name,
              email: user.email
            }
          })
        })
        .catch(error => {
          if (error.response.status === 401) {
            authUtil.setCurrentUser(null)
          }
        })
    }
  }

  render() {
    const { currentUser } = this.state

    return (
      <CurrentUserContext.Provider
        value={{ currentUser, setCurrentUser: this.setCurrentUser }}
      >
        <Router>
          <AsyncHome path="/" />
          <AsyncLogin path="/login" />
          <AsyncUserList path="/user-list" />
        </Router>
      </CurrentUserContext.Provider>
    )
  }
}

export default Root
