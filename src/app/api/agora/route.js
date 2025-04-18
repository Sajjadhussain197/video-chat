import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { NextResponse } from "next/server";

const APP_ID = "f1e1947996dc4be0892350dc3f4051dc";
const APP_CERTIFICATE = "e535d6775a55463b84f5c8e50120be39";

export async function GET(request) {
  // Extract query parameters from the URL
  const { searchParams } = new URL(request.url);
  const appointmentId = searchParams.get("appointmentId");
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");

  if (!appointmentId || !userId || !role) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  const channelName = appointmentId;
  const uid = parseInt(userId); // ensure uid is number
  const userRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const expirationTimeInSeconds = 60 * 60; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    userRole,
    privilegeExpireTime
  );

  return NextResponse.json({
    token,
    appId: APP_ID,
    channel: channelName,
    uid,
  });
}