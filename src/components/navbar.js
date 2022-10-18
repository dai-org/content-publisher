import React from 'react';
import { useAuth } from './provideAuth';
import { Navbar, Container, Nav } from 'react-bootstrap';
import './navbar.css'




function NavBar() {
    const auth = useAuth();
    return (
        <Navbar collapseOnSelect expand="lg" style={{ boxShadow: 'none' }} bg="light" variant="light" sticky="top">
            <Container>
                <Navbar.Brand href="/"> <img alt='' src='logo512.png' style={{width:50, marginRight: 10}} />Content Publisher <small>(v1.7.18)</small></Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/data-dictionary">Data Dictionary</Nav.Link>
                        <Nav.Link href="/faqs">FAQs</Nav.Link>
                        <Nav.Link href="/newsletters">Newsletters</Nav.Link>
                        <Nav.Link href="/posts">News/Posts</Nav.Link>
                        <Nav.Link href="/upk-usmc">UPK & SPDs</Nav.Link>
                        <Nav.Link href="/usmc-events">Events Calendar</Nav.Link>
                        <Nav.Link href="/admin">Users</Nav.Link>
                        <Nav.Link href="/distro">Email List</Nav.Link>
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