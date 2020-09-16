import React from "react";
import Navbar from "react-bootstrap/NavBar";
import Nav from "react-bootstrap/Nav";
import axios from "axios";
import { API_BASE_URL } from "../Constants/apiConstants";

function Header(props) {
  const userRole = sessionStorage.getItem("role");
  const isLoggedIn = true;

  return (
    <>
      {isLoggedIn ? (
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand>{props.title}</Navbar.Brand>
          <Nav className="mr-auto">
            {
              {
                admin: (
                  <Nav className="mr-auto">
                    <Nav.Link href="/AdminDashboard">Admin Dashboard</Nav.Link>
                    <Nav.Link href="">Map</Nav.Link>
                    <Nav.Link href="">Delete Data</Nav.Link>
                    <Nav.Link href="">Export Data</Nav.Link>
                  </Nav>
                ),
                user: (
                  <Nav>
                    <Nav.Link href="UserDashboard">User Dashboard</Nav.Link>
                    <Nav.Link href="">Data Analysis</Nav.Link>
                    <Nav.Link href="dataUpload">Data Upload</Nav.Link>
                  </Nav>
                ),
              }[userRole]
            }
          </Nav>
        </Navbar>
      ) : (
        <Navbar bg="dark" variant="dark">
          {props.title}
        </Navbar>
      )}
    </>
  );
}
export default Header;
