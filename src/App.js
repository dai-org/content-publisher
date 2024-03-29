import React from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import './css/filter.css';
import { ProvideAuth } from './components/provideAuth';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PrivateRoute from './components/privateRoute';
import Login from './components/login';
import Upload from './routes/upload/upload';
import Navbar from './components/navbar'
import Faqs from './routes/faqs/faqs';
import Newsletters from './routes/newsletters/newsletters'
import DataDictionary from './routes/data_dictionary/data-dictionary';
import ReferenceGuides from './routes/reference_guides/reference-guides';
import USMCEvents from './routes/usmc_events/usmc-events';
import USMCUPK from './routes/upk_usmc/upk-usmc';
import News from './routes/news/news';
import Admin from './admin/admin';
import Distro from './admin/Distro';


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
                                <Newsletters />
                            </PrivateRoute>
                            <PrivateRoute path="/faqs">
                                <Navbar />
                                <Faqs />
                            </PrivateRoute>
                            <PrivateRoute path="/posts">
                                <Navbar/>
                                <News/>
                            </PrivateRoute>
                            <PrivateRoute path="/data-dictionary">
                                <Navbar />
                                <DataDictionary />
                            </PrivateRoute>
                            <PrivateRoute path="/reference-guides">
                                <Navbar />
                                <ReferenceGuides />
                            </PrivateRoute>
                            <PrivateRoute path="/usmc-events">
                                <Navbar />
                                <USMCEvents />
                            </PrivateRoute>
                            <PrivateRoute path="/upk-usmc">
                                <Navbar />
                                <USMCUPK />
                            </PrivateRoute>
                            <PrivateRoute path="/admin">
                                <Navbar />
                                <Admin />
                            </PrivateRoute>
                            <PrivateRoute path="/distro">
                                <Navbar />
                                <Distro />
                            </PrivateRoute>
                        </Route>
                    </Switch>
                </div>
            </Router>
        </ProvideAuth>
    );
}

export default App;