import React from "react";
import Navbar from "react-bootstrap/NavBar";
import Nav from "react-bootstrap/Nav";

function Header(props) {
  const userRole = "user";
  const isLoggedIn = true;
  return (
    <>
      {isLoggedIn ? (
        <Navbar bg="dark" variant="dark">
          <Nav className="mr-auto">
            {
              {
                admin: (
                  <Nav className="mr-auto">
                    <Nav.Link href="register">Admin Dashboard</Nav.Link>
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
        <Navbar bg="dark" variant="dark"></Navbar>
      )}
    </>
  );
}
export default Header;
