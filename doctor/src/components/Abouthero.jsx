import React from 'react'
import './Abouthero.css';

const Abouthero = () => {
  return (
   <section className='view-1'>
    <div className='top'>
      <h1>Lorem ipsum dolor sit amet.</h1>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo officia quos asperiores odit dolore odio, dolores obcaecati corrupti eligendi. Quia eveniet cum illum cumque voluptate consequatur laudantium dolorem! Eligendi, illo?</p>
    </div>
    <div className='bottom'>
      <img src='https://images.pexels.com/photos/3094215/pexels-photo-3094215.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' 
      alt='exercise' className='img-a'></img>
      <img src='https://images.pexels.com/photos/1153369/pexels-photo-1153369.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' 
      alt='food1' className='img-b'></img>
      <img src='https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' 
      alt='food' className='img-c'></img>
    </div>
   </section>
  )
}

export default Abouthero