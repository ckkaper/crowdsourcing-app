import React, { useEffect, useState } from "react";
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
import AdminDashboard from "./Admin/AdminDashboard";

function App() {
  console.log("App component");
  const [title, updateTitle] = useState("Home");
  const [errorMessage, updateErrorMessage] = useState(null);

  useEffect(() => {
    updateTitle("Home")
  },[]);
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
            <PrivateRoute path="/dataUpload">
              <DataUpload updateTitle={updateTitle} />
            </PrivateRoute>
            <PrivateRoute path="/AdminDashboard">
              <AdminDashboard updateTitle={updateTitle} />
            </PrivateRoute>
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
