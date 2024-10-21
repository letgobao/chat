"use client";

import { API_PATH } from "@/app/api/constants";
import ItemList from "@/components/shared/item-list/ItemList";
import Loading from "@/components/shared/loading/Loading";
import { defaultError } from "@/lib/toaster";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Conversation from "./_components/Conversation";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import { PusherEvent } from "@/lib/pusher";
import { usePusher } from "@/hooks/usePusher";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { fixPopover } from "@/components/shared/select/FriendsSelect";

type Props = React.PropsWithChildren<{}>;

export type ConversationDetail = {
  id: string;
  isGroup: boolean;
  lastMessage: string | null;
  name: string | null;
  imageUrl?: string;
  otherMembers: {
    email: string;
    imageUrl: string;
    name: string;
  }[];
};

const ConversationsLayout = ({ children }: Props) => {
  const [conversations, setConversations] = useState<
    ConversationDetail[]
  >([]);
  const [openDialog, setOpenDialog] =
    useState<boolean>(false);
  const getConversations = async () => {
    try {
      const { data: response } = await axios.get(
        API_PATH.CONVERSATION
      );

      setConversations(() => response);
    } catch (error) {
      defaultError(error);
    }
  };

  useEffect(() => {
    getConversations();
  }, []);

  useEffect(() => {
    fixPopover(openDialog);
  }, [openDialog]);

  const { channel } = usePusher();

  useEffect(() => {
    if (!!channel) {
      channel.bind(PusherEvent.LEAVE_CONVERSATION, () =>
        getConversations()
      );

      channel.bind(PusherEvent.NEW_CONVERSATION, () =>
        getConversations()
      );

      const handleNewMessage = (data: any) => {
        getConversations();
      };

      channel.bind(
        PusherEvent.NEW_MESSAGE,
        handleNewMessage
      );
    }
  }, [channel]);
  return (
    <>
      <CreateGroupDialog
        open={openDialog}
        setOpen={setOpenDialog}
      />
      <ItemList
        title="Conversations"
        action={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={"icon"}
                variant={"outline"}
                onClick={() => setOpenDialog(true)}
              >
                <CirclePlus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create Group</p>
            </TooltipContent>
          </Tooltip>
        }
      >
        {!conversations ? (
          <Loading />
        ) : conversations.length === 0 ? (
          <p className="w-full h-full flex items-center justify-center">
            No conversation found
          </p>
        ) : (
          conversations.map(
            ({
              id,
              name,
              isGroup,
              otherMembers,
              lastMessage,
            }) => {
              return (
                <Conversation
                  key={id}
                  id={id}
                  name={
                    isGroup
                      ? name || ""
                      : otherMembers[0].name
                  }
                  imageUrl={
                    isGroup
                      ? undefined
                      : otherMembers[0].imageUrl
                  }
                  isGroup={isGroup}
                  lastMessage={lastMessage}
                />
              );
            }
          )
        )}
      </ItemList>
      {children}
    </>
  );
};

export default ConversationsLayout;
