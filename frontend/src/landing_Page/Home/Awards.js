import React from 'react'
import { Link } from 'react-router-dom';
function Awards() {
    return (  
       <div className='container mt-5'>
        <div className='row'>
            <div className='col-6 '>
                <img src='/media/largestBroker.svg' alt=''/>
            </div>
            <div className='col-6 mt-5'>
                    <h1>Larget stock broker in India</h1>
                    <p className='mb-5'>7.5m+ Finsprints clients contribute to over 15% of all retail order
                     volumes in India by trading and investing in: </p>
                     <div className='row'>
                        <div className='col-6'>
                            <ul>
                        <li> <p>Future & Options</p></li>
                        <li><p> Stocks</p></li>
                        <li><p> Commodities Derivatives</p></li>
                     </ul>
                        </div>
                        <div className='col-6'>
                            <ul>
                        <li> <p>Mutual Funds</p></li>
                        <li><p> IPO'S</p></li>
                        <li><p> Govt. Bonds</p></li>
                     </ul>
                        </div>
                     </div>
                     <img src='/media/pressLogos.png' style={{width:'90%'}} alt='press'/>
                     
             </div>   


        </div>
       </div>
    );
}

export default Awards;