import { useEffect, useRef } from "react";

const VideoPlayer = ({ user }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!user.videoTrack) return;
    
    // When component mounts, play the video track
    if (ref.current && user.videoTrack && typeof user.videoTrack.play === 'function') {
        user.videoTrack.play(ref.current);
      }
    // if (ref.current) {
    //   user.videoTrack.play(ref.current);
    // }

   
  }, [user.videoTrack]);

  // Show a placeholder if there's no video track
  if (!user.videoTrack) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-700">
        <div className="text-white text-center">
          <div className="text-4xl mb-2">
            {user.userName ? user.userName.charAt(0).toUpperCase() : "?"}
          </div>
          <div>{user.isObserver ? "Observer" : (user.isDoctor ? "Doctor" : "Patient")}</div>
          {user.isLocal && <div className="mt-1 text-sm">Camera Off</div>}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="h-full w-full" />
  );
};

export default VideoPlayer;