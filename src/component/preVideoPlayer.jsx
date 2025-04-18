"use client"
import React, { useEffect, useRef } from 'react'

const VideoPlayer = ({user}) => {
    const ref=useRef()
    useEffect(()=>{
        user.videoTrack.play(ref.current)
    },[])
  return (
    <div>
        UID:{user.uid}
        <div  ref={ref} className='w-[200px] h-[200px]'></div>  
    </div>
  )
}

export default VideoPlayer
