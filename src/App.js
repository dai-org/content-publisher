import React from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { ProvideAuth } from './components/provideAuth';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PrivateRoute from './components/privateRoute';
import Login from './components/login';
import Upload from './routes/upload/upload';
import Navbar from './components/navbar'

function App() {
    return (
        <ProvideAuth>
            <Router>
                <div className='App'>
                    <Switch>
                        <Route exact path='/' component={Login} />
                        <Route path='/signin' component={Login} />
                        <Route>
                            <PrivateRoute path="/upload">
                                <Navbar />
                                <Upload />
                            </PrivateRoute>
                            <PrivateRoute path="/newsletters">
                                <Navbar />
                                <Upload />
                            </PrivateRoute>
                            <PrivateRoute path="/faqs">
                                <Navbar />
                                <Upload />
                            </PrivateRoute>
                            <PrivateRoute path="/data-dictionary">
                                <Navbar />
                                <Upload />
                            </PrivateRoute>
                        </Route>
                    </Switch>
                </div>
            </Router>
        </ProvideAuth>
    );
}

export default App;