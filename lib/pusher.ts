import Client from "pusher-js";
import Server from "pusher";

export const PusherServer = new Server({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY ?? "",
  secret: process.env.PUSHER_APP_SECRET ?? "",
  cluster: "ap1",
  useTLS: true,
});

export const PusherClient = new Client(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY ?? "",
  { cluster: "ap1" }
);

export const PusherEvent = {
  NEW_MESSAGE: "new-message",
  NEW_REQUEST: "new-request",
  HANDLE_REQUEST: "handle-request",
  LEAVE_CONVERSATION: "leave_conversation",
  NEW_CONVERSATION: "leave_conversation",
};
