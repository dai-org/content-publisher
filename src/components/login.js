import React, { useState } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { useAuth } from "../components/provideAuth";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Get auth state and re-render anytime it changes
    const auth = useAuth();
    const history = useHistory();
    function toggleLoader () {

    }
    return (
        auth.user ?
        <Redirect
            to={{
                pathname: "/upload",
                state: { from: '/' }
            }}
        /> :
        <div className='auth-wrapper'><img alt='' src='logo512.png' style={{width:125, marginRight: 10}} />
            <h4 className='mb-4'>DAI Content Publisher</h4>
            <div className='auth-inner'>
                <div>
                    <h3>Sign In</h3>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input type="email" className="form-control" id="email" aria-describedby="emailHelp" onChange={event => setEmail(event.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" className="form-control" id="password" onChange={event => setPassword(event.target.value)} />
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={async (event) => {
                            toggleLoader () ;
                            await auth.signin(email, password);
                            history.push('/upload');
                        }}
                    >
                        Sign in
                    </button>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default Login;