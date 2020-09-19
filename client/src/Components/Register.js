import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Register.css";
import { API_BASE_URL } from "../Constants/apiConstants";
import { withRouter } from "react-router-dom";
import { EROFS } from "constants";

function RegistrationForm(props) {
  const passwordChecker = (password, props) => {
    let errors = [];
    if (password.length < 8) {
      errors.push("Your password must be at least 8 characters");
    }
    if (password.search(/.*[!@#$%^&*() =+_-]/) < 0) {
      errors.push("Your password must contain at least one symbol");
    }
    if (password.search(/[A-Z]/) < 0) {
      errors.push("Your password mus contain at least one capital letter");
    }
    if (password.search(/[a-z]/i) < 0) {
      errors.push("Your password must contain at least one letter.");
    }
    if (password.search(/[0-9]/) < 0) {
      errors.push("Your password must contain at least one digit.");
    }
    if (errors.length > 0) {
      props.showError(errors.join("\n"));
      return false;
    }
    return true;
  };

  useEffect(() => {
    console.log("here");
    props.updateTitle("Register");
  }, []);

  const [state, setState] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    successMessage: null,
  });
  const handleChange = (e) => {
    const { id, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  const sendDetailsToServer = () => {
    if (state.email.length && state.password.length) {
      props.showError(null);
      const payload = {
        username: state.username,
        email: state.email,
        password: state.password,
      };
      console.log("i am called");
      console.log(payload);
      axios
        .post(API_BASE_URL + "register", payload)
        .then(function (response) {
          if (response.status === 200) {
            console.log(response.data);
            alert("successfully registered");
            setState((prevState) => ({
              ...prevState,
              successMessage:
                "Registration successful. Redirecting to home page..",
            }));
            redirectToHome();
            props.showError(null);
          } else {
            props.showError("Some error ocurred");
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      props.showError("Please enter valid username and password");
    }
  };
  const redirectToHome = () => {
    props.updateTitle("Home");
    props.history.push("/home");
  };
  const redirectToLogin = () => {
    props.updateTitle("Login");
    props.history.push("/login");
  };
  const handleSubmitClick = (e) => {
    e.preventDefault();
    // if (passwordChecker(state.password,props)) {
    if (state.password === state.confirmPassword) {
      sendDetailsToServer();
    } else {
      props.showError("Passwords do not match");
    }
    // }
  };
  return (
    <div className="card col-12 col-lg-4 login-card mt-2 hv-center">
      <form>
        <div className="form-group text-left">
          <label htmlFor="exampleInputEmail1">username</label>
          <input
            type="username"
            className="form-control"
            id="username"
            aria-describedby="emailHelp"
            placeholder="Enter username"
            value={state.username}
            onChange={handleChange}
          />
          <small id="emailHelp" className="form-text text-muted">
            We'll never share your email with anyone else.
          </small>
        </div>
        <div className="form-group text-left">
          <label htmlFor="exampleInputEmail1">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            aria-describedby="emailHelp"
            placeholder="Enter email"
            value={state.email}
            onChange={handleChange}
          />
          <small id="emailHelp" className="form-text text-muted">
            We'll never share your email with anyone else.
          </small>
        </div>
        <div className="form-group text-left">
          <label htmlFor="exampleInputPassword1">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Password"
            value={state.password}
            onChange={handleChange}
          />
        </div>
        <div className="form-group text-left">
          <label htmlFor="exampleInputPassword1">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            placeholder="Confirm Password"
            value={state.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleSubmitClick}
        >
          Register
        </button>
      </form>
      <div
        className="alert alert-success mt-2"
        style={{ display: state.successMessage ? "block" : "none" }}
        role="alert"
      >
        {state.successMessage}
      </div>
      <div className="mt-2">
        <span>Already have an account? </span>
        <span className="loginText" onClick={() => redirectToLogin()}>
          Login here
        </span>
      </div>
    </div>
  );
}

export default withRouter(RegistrationForm);
