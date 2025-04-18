// const VideoRoom = dynamic(() => import("../src/component/VideoRoom"), { ssr: false });

// import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-black min-w-full min-h-screen">

      </div>

  );
}
// "use client"
// import dynamic from 'next/dynamic';
// import React, { useState } from 'react';

// // Dynamically import AgoraUIKit with SSR disabled
// const AgoraUIKitWithNoSSR = dynamic(
//   () => import('agora-react-uikit').then((mod) => mod.default),
//   { ssr: false }
// );

// const Home = () => {
//   const [videoCall, setVideoCall] = useState(false);
  
//   // You need both RTC and RTM tokens if security is enabled
//   const rtcProps = {
//     appId: 'f1e1947996dc4be0892350dc3f4051dc',
//     channel: 'test',
//     token: "007eJxTYIiMNX+o+PnOBp5fUfdr7eX4lGSf6m9OmXR1r1TuFyZ33UoFhjTDVENLE3NLS7OUZJOkVAMLSyNjU4OUZOM0EwNTw5RkwU8MGQ2BjAyHFqQzMjJAIIjPwlCSWlzCwAAA7O8eBg==" // Generate a proper RTC token
//   };
  
//   const rtmProps = {
//     token: "007eJxTYIiMNX+o+PnOBp5fUfdr7eX4lGSf6m9OmXR1r1TuFyZ33UoFhjTDVENLE3NLS7OUZJOkVAMLSyNjU4OUZOM0EwNTw5RkwU8MGQ2BjAyHFqQzMjJAIIjPwlCSWlzCwAAA7O8eBg==", // Generate a proper RTM token
//     uid: String(Math.floor(Math.random() * 10000)), // Generate a random user ID or use a specific one
//   };
  
//   const callbacks = {
//     EndCall: () => setVideoCall(false),
//   };

//   return (
//     <div style={{ height: '100vh', width: '100%' }}>
//       {videoCall ? (
//         <AgoraUIKitWithNoSSR 
//           rtcProps={rtcProps} 
//           rtmProps={rtmProps}
//           callbacks={callbacks} 
//         />
//       ) : (
//         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
//           <button 
//             onClick={() => setVideoCall(true)}
//             style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer' }}
//           >
//             Start Video Call
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;