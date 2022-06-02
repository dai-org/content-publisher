import React from "react";
import { useAuth } from './provideAuth';
import { Navbar, Container, Nav } from 'react-bootstrap';
import './navbar.css'

function NavBar() {
    const auth = useAuth();

    return (
        <Navbar collapseOnSelect expand="lg" style={{ boxShadow: 'none' }} bg="light" variant="light" sticky="top">
            <Container>
                <Navbar.Brand href="/">DAI App | Content Publisher</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/data-dictionary">Data Dictionary</Nav.Link>
                        <Nav.Link href="/faqs">FAQs</Nav.Link>
                        <Nav.Link href="/newsletters">Newsletters</Nav.Link>
                        <Nav.Link href="/posts">Posts</Nav.Link>
                        <Nav.Link href="/upk-usmc">DAI USMC UPK & SDPs</Nav.Link>
                        <Nav.Link href="/usmc-events">DAI Event Calendar</Nav.Link>

                    </Nav>
                    <button
                        type='button'
                        className='btn btn-danger btn-sm'
                        style={{ float: 'right' }}
                        onClick={async (event) => {
                            await auth.signout();
                        }}
                    >
                        Sign out
                    </button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;