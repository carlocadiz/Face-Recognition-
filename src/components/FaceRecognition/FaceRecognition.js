import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, box }) => {
  
  return(
    <div className='center ma'>
      <div className='absolute mt2'>
        <img id='inputimage'alt='' src={ imageUrl } width='500px' heigh='auto' />
        {box.map((b, index) => {
       return <div key={index} className="bounding-box" style={{ top: b.topRow, right: b.rightCol, bottom: b.bottomRow, left: b.leftCol}}></div>
      })}
      </div>
    </div>
  )
}

export default FaceRecognition;