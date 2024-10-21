"use client";

import ConversationFallback from "@/components/shared/conversation/ConversationFallback";
import ItemList from "@/components/shared/item-list/ItemList";
import React, { useEffect, useState } from "react";
import AddFriendDialog from "./_components/AddFriendDialog";
import axios from "axios";
import { defaultError } from "@/lib/toaster";
import Request from "./_components/Request";
import { API_PATH } from "@/app/api/constants";
import Loading from "@/components/shared/loading/Loading";
import { PusherEvent } from "@/lib/pusher";
import { useAuth } from "@clerk/nextjs";
import { usePusher } from "@/hooks/usePusher";
type Props = {};

type FriendRequest = {
  id: string;
  sender: {
    name: string;
    imageUrl: string;
    email: string;
  };
};

const FriendsPage = (props: Props) => {
  const [requests, setRequests] = useState<
    FriendRequest[] | null
  >(null);

  useEffect(() => {
    fetchData();
  }, []);

  const { channel } = usePusher();

  useEffect(() => {
    if (!!channel) {
      channel.bind(PusherEvent.NEW_REQUEST, fetchData);
      channel.bind(PusherEvent.HANDLE_REQUEST, fetchData);
    }
  }, [channel]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        API_PATH.FRIEND_REQUEST
      );
      setRequests(data.requests);
    } catch (error: any) {
      defaultError(error);
    }
  };

  return (
    <>
      <ItemList
        title="Friends"
        action={<AddFriendDialog />}
      >
        {!requests ? (
          <Loading />
        ) : requests.length === 0 ? (
          <p className="w-full h-full flex items-center justify-center">
            No friend request found
          </p>
        ) : (
          requests.map((request) => (
            <Request
              key={request.id}
              id={request.id}
              {...request.sender}
            />
          ))
        )}
      </ItemList>
      <ConversationFallback />
    </>
  );
};

export default FriendsPage;
