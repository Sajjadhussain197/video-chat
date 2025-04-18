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
  const [isAlreadyConnected, setIsAlreadyConnected] = useState(false);
  
  // Determine the role based on userType
  const role = userType === "observer" ? "subscriber" : "publisher";

  const checkIfAlreadyConnected = () => {
    const storageKey = `agora_connected_${appointmentId}_${userId}`;
    
    // First check if we have a record in localStorage
    const connectedTimestamp = localStorage.getItem(storageKey);
    
    if (connectedTimestamp) {
      const now = new Date().getTime();
      const timestamp = parseInt(connectedTimestamp);
      
      // If the timestamp is recent (within 5 seconds), consider it an active session
      if (now - timestamp < 5000) {
        console.log("User already connected in another tab");
        setIsAlreadyConnected(true);
        return true;
      }
    }

const setConnected = () => {
    localStorage.setItem(storageKey, new Date().getTime().toString());
  };
  setConnected();
  
  const interval = setInterval(setConnected, 2000);
  const handleBeforeUnload = () => {
    localStorage.removeItem(storageKey);
    clearInterval(interval);
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    clearInterval(interval);
    localStorage.removeItem(storageKey);
  };
};


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
    // Check if this user is already connected in another tab
    const cleanupConnectionCheck = checkIfAlreadyConnected();
    if (isAlreadyConnected) {
        return cleanupConnectionCheck;
      }
      
    
    hasJoinedRef.current = true;

    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    const init = async () => {
      try {
        if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
            console.log("Client already connected or connecting");
            return;
          }
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
        
      cleanupConnectionCheck();
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

  if (isAlreadyConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-6 bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Already Connected</h2>
          <p className="mb-6">
            You're already connected to this session in another tab or window. 
            Close this tab or continue the session in your existing tab.
          </p>
          <button 
            onClick={() => window.close()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close This Tab
          </button>
        </div>
      </div>
    );
  }

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