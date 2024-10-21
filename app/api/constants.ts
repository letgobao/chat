export const API_PATH = {
  FRIEND_REQUEST: "/api/friends/requests",
  CONVERSATION: "/api/conversations",
  CONVERSATION_DETAIL: (id: string) =>
    `/api/conversations/${id}`,
  MESSAGE: "/api/conversations/messages",
  GROUP: "/api/friends/groups",
  FRIEND: "/api/friends",
  DELETE_FRIEND: (conversationId: string) =>
    `/api/friends/${conversationId}`,
} as const;
