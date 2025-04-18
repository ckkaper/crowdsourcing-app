import React, { useState } from "react";
import "./App.css";
import LoginForm from "./Login";
import RegistrationForm from "./Register";
import Header from "./Header";
import Home from "./Home";
import DataUpload from "./User/DataUpload";
import PrivateRoute from "./PrivateRoute";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AlertComponent from "./AlertComponent";
import Dashboard from "./User/Dashboard";

function App() {
  const [title, updateTitle] = useState(null);
  const [errorMessage, updateErrorMessage] = useState(null);
  return (
    <Router>
      <div className="App">
        <Header title={title} />
        <div className="container d-flex align-items-center flex-column">
          <Switch>
            <Route path="/" exact={true}>
              <RegistrationForm
                showError={updateErrorMessage}
                updateTitle={updateTitle}
              />
            </Route>
            <Route path="/register">
              <RegistrationForm
                showError={updateErrorMessage}
                updateTitle={updateTitle}
              />
            </Route>
            <Route path="/login">
              <LoginForm
                showError={updateErrorMessage}
                updateTitle={updateTitle}
              />
            </Route>
            <PrivateRoute component={Home} path="/home" />
            <PrivateRoute component={Dashboard} path="/UserDashboard" />
            <PrivateRoute component={DataUpload} path="/dataUpload" />
          </Switch>
          <AlertComponent
            errorMessage={errorMessage}
            hideError={updateErrorMessage}
          />
        </div>
      </div>
    </Router>
  );
}

export default App;
