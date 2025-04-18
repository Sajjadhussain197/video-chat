// // import VideoRoom from "@/component/VideoRoom"
// "use client"
// // import VideoRoom from "@/component/VideoRoom";
// import dynamic from "next/dynamic";

// const VideoRoom = dynamic(() => 
//   import("@/component/VideoRoom").then(mod => mod.default), 
//   { ssr: false }
// );




// const VideoChatPage = () => {
//   return (
//     <div>
//       <VideoRoom />
//     </div>
//   )
// }

// export default VideoChatPage
"use client"
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
// import VideoRoom from '@/component/VideoRoom';

// Dynamically import VideoRoom component with SSR disabled
const VideoRoom = dynamic(() => 
  import("@/component/VideoRoom").then(mod => mod.default), 
  { ssr: false }
);

const VideoChatPage = ({ params }) => {
  // You would get these from your authentication and context
  const [sessionInfo, setSessionInfo] = useState({
    appointmentId: params?.appointmentId || "demo-channel-123",
    userType: "doctor", // "doctor", "patient", or "observer"
    userId: Math.floor(Math.random() * 100000), // In production, use a stable ID
    userName: "Dr. Smith",
    isGroupSession: false
  });

  useEffect(() => {
    // In a real app, you would fetch appointment details here
    // and determine if this is a group session, the user's role, etc.
  }, [params?.appointmentId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <VideoRoom 
        appointmentId={sessionInfo.appointmentId}
        userType={sessionInfo.userType}
        userId={sessionInfo.userId}
        userName={sessionInfo.userName}
        isGroupSession={sessionInfo.isGroupSession}
      />
    </div>
  );
};

export default VideoChatPage;
