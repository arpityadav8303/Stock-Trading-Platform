import React from 'react'
import { Link } from 'react-router-dom';
function Pricing() {
    return ( 
       <div className='container p-2 '>
         <div className='row '>
            <div className='col-6 '>
                <h2>Unbeatable pricing</h2>
                <p className='mt-3 text-muted'>We pioneered the concept of discount broking and price <br></br> transparency in India. Flat fees and no hidden charges.</p>
                <Link href='Pricing' style={{ textDecoration: 'none' }}>See pricing  <i className="fa-solid fa-arrow-right"></i></Link>
            </div>
            
            <div className='col-6'>
                <img src='/media/price.png' style={{width:"95%"}}></img>
            </div>
         </div>
       </div>
     );
}

export default Pricing;