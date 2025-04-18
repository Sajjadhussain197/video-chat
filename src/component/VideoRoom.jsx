"use client"
import AgoraRTC from "agora-rtc-sdk-ng"
import { useEffect, useRef, useState } from "react"
import VideoPlayer from "./VideoPlayer";

const client = AgoraRTC.createClient({ 
  mode: "rtc",  // Use "rtc" for real-time communications
  codec: "vp8"
})

const VideoRoom = ({ 
  appointmentId,  // use this as channel name
  userType,       // "doctor", "patient", or "observer"
  userId,         // unique identifier for the user
  userName,       // display name
  isGroupSession = false // flag to indicate if this is a group session
}) => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const hasJoinedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Determine the role based on userType
  const role = userType === "observer" ? "subscriber" : "publisher";

  const handleUserJoined = async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    
    if (mediaType === "video") {
      setUsers((prev) => {
        // Check if user already exists in the array
        if (prev.some(u => u.uid === user.uid)) {
          return prev.map(u => u.uid === user.uid ? {...u, videoTrack: user.videoTrack} : u);
        }
        return [...prev, user];
      });
    }
    
    if (mediaType === "audio") {
      user.audioTrack.play();
      setUsers((prev) => {
        if (prev.some(u => u.uid === user.uid)) {
          return prev.map(u => u.uid === user.uid ? {...u, audioTrack: user.audioTrack} : u);
        }
        return prev;
      });
    }
  }

  const handleUserLeft = (user) => {
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
        // Fetch token from your API
        const res = await fetch(`/api/agora?appointmentId=${appointmentId}&userId=${userId}&role=${role}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch token');
        }
        
        const data = await res.json();
        
        // Join the channel
        const uid = await client.join(data.appId, data.channel, data.token, data.uid);
        
        // Create audio and video tracks
        let audioTrack, videoTrack;
        
        if (role === "publisher") {
          [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          
          // Store local tracks for later use (mute/unmute)
          setLocalTracks([audioTrack, videoTrack]);
          
          // Add the local user to the users array
          setUsers((prev) => [...prev, { 
            uid, 
            videoTrack, 
            audioTrack, 
            isLocal: true, 
            isDoctor: userType === "doctor",
            userName: userName 
          }]);
          
          // Publish tracks to the channel
          await client.publish([audioTrack, videoTrack]);
        } else {
          // For observer, just add them without tracks
          setUsers((prev) => [...prev, { 
            uid, 
            isLocal: true,
            isObserver: true,
            userName: userName
          }]);
        }
        
      } catch (error) {
        console.error("Failed to join or create tracks:", error);
      }
    };

    init();

    return () => {
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);
      
      // Clean up local tracks
      localTracks.forEach((track) => {
        track.close();
      });
      
      // Leave the channel
      client.leave();
      hasJoinedRef.current = false;
    };
  }, [appointmentId, userId, role, userName, userType]);

  const toggleMute = async () => {
    if (localTracks[0]) {
      if (isMuted) {
        await localTracks[0].setEnabled(true);
      } else {
        await localTracks[0].setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (localTracks[1]) {
      if (isVideoOff) {
        await localTracks[1].setEnabled(true);
      } else {
        await localTracks[1].setEnabled(false);
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  // Calculate layout based on number of users and session type
  const getLayoutClassName = () => {
    const count = users.length;
    
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-3";
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">
          {isGroupSession ? "Group Session" : "Doctor-Patient Consultation"}
        </h1>
        <div className="flex gap-2">
          {role === "publisher" && (
            <>
              <button 
                onClick={toggleMute} 
                className={`px-4 py-2 rounded ${isMuted ? 'bg-red-500' : 'bg-green-500'}`}
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button 
                onClick={toggleVideo} 
                className={`px-4 py-2 rounded ${isVideoOff ? 'bg-red-500' : 'bg-green-500'}`}
              >
                {isVideoOff ? "Turn Video On" : "Turn Video Off"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`grid ${getLayoutClassName()} gap-4 flex-grow`}>
        {users.map((user) => (
          <div 
            key={user.uid} 
            className={`
              relative rounded-lg overflow-hidden bg-gray-800
              ${user.isDoctor ? 'border-2 border-blue-500' : user.isObserver ? 'border-2 border-gray-500' : 'border-2 border-green-500'}
            `}
          >
            <VideoPlayer user={user} />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white">
              {user.userName || `User-${user.uid}`} {user.isLocal ? '(You)' : ''}
              {user.isDoctor ? ' - Doctor' : user.isObserver ? ' - Observer' : ' - Patient'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoRoom;