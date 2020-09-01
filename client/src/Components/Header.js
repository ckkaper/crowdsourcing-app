import React from "react";
import  Navbar from "react-bootstrap/NavBar";
import Nav from "react-bootstrap/Nav";

function Header(props) {
  const isLoggedIn = true;
  return (
    <>
      {isLoggedIn ? (
        <Navbar bg="dark" variant="dark">
          <Nav className="mr-auto">
            <Nav.Link href="register">Home</Nav.Link>
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#pricing">Pricing</Nav.Link>
          </Nav>
        </Navbar>
      ) : (
        <Navbar bg="dark" variant="dark">    
      </Navbar>
      )}
    </>
  );
}
export default Header;
