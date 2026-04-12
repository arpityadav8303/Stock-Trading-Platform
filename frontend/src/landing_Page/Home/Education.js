import React from 'react'
import { Link } from 'react-router-dom';
function Education() {
    return ( 
        <div className='container mt-5 p-5'>
            <div className='row'>
                <div className='col-6'>
                    <img src='/media/education.svg' style={{width:'70%'}}></img>
                </div>
                 <div className='col-6'>
                    <h3>Free and open market education</h3>
                    <p className='mt-4'>Varsity, the largest online stock market education book in the world <br></br>covering everything from the basics to advanced trading.</p>
                    <a href='' className='mt-4' style={{ textDecoration: 'none' }}>Verasity  <i className="fa-solid fa-arrow-right"></i></a>
                    <p className='mt-4'>TradingQ&A, the most active trading and investment community in <br></br> India for all your market related queries.</p>
                    <Link href='' className='mt-4' style={{ textDecoration: 'none' }}>TradingQ&A  <i className="fa-solid fa-arrow-right"></i></Link>
                 </div>
            </div>
        </div>
     );
}

export default Education;