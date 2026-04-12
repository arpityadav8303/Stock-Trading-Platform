import React from 'react'

function Hero() {
    return ( 
       
        <div className='container p-5'>

            <div className='row text-center'>
                <img src='/media/homeHero.png' alt='img' className='mb-5'/>
                <h1 className='mt-4'>Invest in everything</h1>
                <p>Invest in everything stock F&O mutual funds commodities</p>
                <button className='p-2'fs-5 style={{width:"20%", margin:"0 auto" , backgroundColor: '#007BFF',border:'3px', borderRadius: '4px',color:'white'}}>Sign Up</button>

            </div>

        </div>
     );
}

export default Hero;