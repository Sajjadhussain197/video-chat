"use client"
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import VideoPlayer from "./preVideoPlayer";
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })

const VideoRoom = () => {
    const [users, setUsers] = useState([]);
    const role = "subscriber";
    const hasJoinedRef = useRef(false);
    
    // Let's define these as state or props instead of hardcoded values
    const appointmentId = "myapp"; // You should get this from props or context
    const userId = Math.floor(Math.random() * 10000); // Generate random UID if not provided
    
    const handleUserJoined = async (user, mediaType) => {
            await client.subscribe(user, mediaType)
            if (mediaType === "video") {
              setUsers((prev) => [...prev, user])
            }
            if (mediaType === "audio") {
              // setUsers((prev) => [...prev, user])
              user.audioTrack.play()
            }
          }
          const handleUserLeft = async (user, mediaType) => {
            setUsers((previousUsers) =>
              previousUsers.filter((u) => u.uid !== user.uid)
            );
          }
  
    useEffect(() => {
      if (hasJoinedRef.current) return;
      hasJoinedRef.current = true;
  
      client.on("user-published", handleUserJoined);
      client.on("user-left", handleUserLeft);
  
      const init = async () => {
        try {
          const res = await fetch(`/api/agora?appointmentId=${appointmentId}&userId=${userId}&role=${role}`, {
            method: "GET",
          });
          
          const data = await res.json();
          const uid = await client.join(data.appId, data.channel, data.token, data.uid);
          
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          
          setUsers((prev) => [...prev, { 
            uid, 
            videoTrack, 
            audioTrack, 
            isLocal: true, 
            isHost: uid === 1 
          }]);
          
          await client.publish([audioTrack, videoTrack]);
        } catch (error) {
          console.error("Failed to join or create tracks:", error);
        }
      };
  
      init();
  
      return () => {
        client.off("user-published", handleUserJoined);
        client.off("user-left", handleUserLeft);
        
        // Proper cleanup
        users.forEach((user) => {
          if (user.isLocal) {
            user.audioTrack?.close();
            user.videoTrack?.close();
          }
        });
        
        client.leave();
      };
    }, [appointmentId, userId, role]);
    
    return (
            <div className='min-h-screen w-[60%] p-6 '>
              <h1>Video app Chat Room</h1>
              <div  style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 200px)',
                }}>
                {users.map((user)=>{
                return  <div key={user.uid} className="player h-[400px] w-[400px] bg-red-500 " id={`player-${user.uid}  text-black`}>{user.uid}
                  <VideoPlayer key={user.uid} user={user} />
                  </div> 
                })}
              </div>
            </div>
          )
  }
  export default VideoRoom;
// "use client"
// import AgoraRTC from "agora-rtc-sdk-ng"
// import { useEffect, useRef, useState } from "react"
// import VideoPlayer from "./VideoPlayer"
// const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })

// const appId = 'e535d6775a55463b84f5c8e50120be39'
// const token =  "007eJxTYNjnYyt04alW8d5Frzhf5S12/nh4/dvemZwMKnGPg+cbnXyiwJBmmGpoaWJuaWmWkmySlGpgYWlkbGqQkmycZmJgapiSPH0zQ0ZDICODk/kJBkYoBPFZGXIrEwsKGBgAwzYgjw=="

// const channel ="myapp"



// const VideoRoom = () => {
//   const [users,setUsers]=useState([])
//   const hasJoinedRef = useRef(false) 
//   const handleUserJoined = async (user, mediaType) => {
//     await client.subscribe(user, mediaType)
//     if (mediaType === "video") {
//       setUsers((prev) => [...prev, user])
//     }
//     if (mediaType === "audio") {
//       // setUsers((prev) => [...prev, user])
//       user.audioTrack.play()
//     }
//   }
//   const handleUserLeft = async (user, mediaType) => {
//     setUsers((previousUsers) =>
//       previousUsers.filter((u) => u.uid !== user.uid)
//     );
//   }
//   useEffect(() => {
    
//     // if (hasJoinedRef.current) return;

//     // hasJoinedRef.current = true;
//    client.on("user-published", handleUserJoined) 
//    client.on("user-left", handleUserLeft) 
//   const init = async () => {
//     try {
//       const uid = await client.join(appId, channel, token, null);
//       const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

//       setUsers((prev) => [...prev, { uid, videoTrack,audioTrack, isLocal: true, isHost: uid === 1  }]);
//       await client.publish([audioTrack, videoTrack]);
//     } catch (error) {
//       console.error("Failed to join or create tracks:", error);
//     }
//   };

//   init();
//   return () => {
//     // client.off("user-published", handleUserJoined);
//     // client.off("user-left", handleUserLeft); 
//     client.leave();
//   }

//   }
//   ,[])
//   return (
//     <div className='min-h-screen w-[60%] p-6 '>
//       <h1>Video app Chat Room</h1>
//       <div  style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(2, 200px)',
//         }}>
//         {users.map((user)=>{
//         return  <div key={user.uid} className="player h-[400px] w-[400px] bg-red-500 " id={`player-${user.uid}  text-black`}>{user.uid}
//           <VideoPlayer key={user.uid} user={user} />
//           </div> 
//         })}
//       </div>
//     </div>
//   )
// }

// export default VideoRoom





