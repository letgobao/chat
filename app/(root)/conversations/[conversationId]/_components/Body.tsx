"use client";

import { API_PATH } from "@/app/api/constants";
import { useConversation } from "@/hooks/useConversation";
import { defaultError } from "@/lib/toaster";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Message from "./Message";
import { PusherClient, PusherEvent } from "@/lib/pusher";
import { useAuth } from "@clerk/nextjs";

type Props = {};

type MessageDetail = {
  id: string;
  content: string;
  createdAt: Date;
  isCurrentUser: boolean;
  senderId: string;
  sender: {
    name: string;
    imageUrl: string;
  };
};

const Body = (props: Props) => {
  const { conversationId } = useConversation();
  const { userId } = useAuth();

  const [messages, setMessages] = useState<MessageDetail[]>(
    []
  );

  const getMessages = async () => {
    try {
      const { data } = await axios.get(API_PATH.MESSAGE, {
        params: { conversationId },
      });
      setMessages(() => data);
    } catch (error) {
      defaultError(error);
    }
  };

  useEffect(() => {
    getMessages();
  }, []);

  useEffect(() => {
    if (!!conversationId) {
      const conversationChannel =
        PusherClient.subscribe(conversationId);
      const handleTrigger = async (message: any) => {
        setMessages((prev) => [
          {
            ...message,
            isCurrentUser: message.senderId === userId,
          },
          ...prev,
        ]);
      };
      conversationChannel.bind(
        PusherEvent.NEW_MESSAGE,
        handleTrigger
      );
    }
  }, [conversationId]);

  return (
    <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 no-scrollbar">
      {messages?.map(
        ({ id, sender, senderId, ...detail }, index) => {
          return (
            <Message
              key={id}
              {...detail}
              {...sender}
              groupBubble={
                messages[index - 1]
                  ? messages[index - 1].senderId ===
                    senderId
                  : false
              }
            />
          );
        }
      )}
    </div>
  );
};

export default Body;
