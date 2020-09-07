import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isLogin } from '../utils';

const PrivateRoute = ({component: Component, ...rest}) => {
    const loggedIn = isLogin();
    console.log('loggedIn');
    console.log(loggedIn);
    return (

        // Show the component only when the user is logged in
        // Otherwise, redirect the user to /signin page
        <Route {...rest} render={props => (
            loggedIn ?
                <Component {...props} />
            : <Redirect to="/login" />
        )} />
    );
};

export default PrivateRoute;