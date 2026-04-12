import React from 'react';

import Footer from '../Footer';
import CreateTicket from './CreateTicket';
import Hero from './Hero';
import NavBar from '../NavBar';

function SupportPage() {
    return ( 
        <>
            <NavBar />
            <CreateTicket />
            <Hero />
            <Footer />
        </>
    );
}

export default SupportPage;