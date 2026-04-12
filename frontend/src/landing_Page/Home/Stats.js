import React from 'react'
import { Link } from 'react-router-dom';
function Stats() {
    return ( 
       
       <div className='container p-4' >
          <div className='row p-4' >
             <div className='col-6 p-4 '>
                <h2 className='mt-5 ' >Trust with confidance</h2>
                <h4 className='mt-4 '>Customer-first always</h4>
                <p className='text-muted'>That's why 7.5m+ customers trust Finsprints with<br></br>
                   6 lakh crores+ equity investments. </p>
                <h4 className='mt-4 '>No spam or gimmicks</h4>
                <p className='text-muted'> No gimmicks, spam, “gamification”, or annoying push<br></br>
                     notifications. High quality apps that you use at your pace,<br></br> the way you like.</p>
                <h4 className='mt-4 ' text-muted> The Zerodha universe</h4>
                <p className='text-muted'>Not just an app, but a whole ecosystem. Our investments in 30+<br></br> fintech startups offer you tailored services specific to your needs.</p>
                <h4 className='mt-4 '>Do better with money</h4>
                <p className='text-muted'>With initiatives like Nudge and Kill Switch, we don’t just<br></br> facilitate transactions, but actively help you do better with<br></br> your money.</p>
             </div>
             <div className='col-6 mt-5 p-4 ml-2'> 
                <img src='/media/ecosystem.png' alt='ecosystem'style={{width:"90%"}}/>
                <div className='text-center'>
                    <Link href='Products' className='mx-5' style={{ textDecoration: 'none' }}>Explore our products <i className="fa-solid fa-arrow-right"></i></Link>
                    <Link href='' style={{ textDecoration: 'none' }}> Try our Kite demo <i className="fa-solid fa-arrow-right"></i></Link>
                </div>
             </div>
          </div>
       </div>
     );
}

export default Stats;