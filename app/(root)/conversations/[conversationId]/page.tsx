"use client";

import { API_PATH } from "@/app/api/constants";
import ConversationContainer from "@/components/shared/conversation/ConversationContainer";
import { defaultError } from "@/lib/toaster";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ConversationDetail } from "../layout";
import Loading from "@/components/shared/loading/Loading";
import Header from "./_components/Header";
import Body from "./_components/Body";
import ChatInput from "./_components/ChatInput";
import UnfriendDialog from "./_components/UnfriendDialog";
import LeaveGroupDialog from "./_components/LeaveGroupDialog";
import AddFriendDialog from "../../friends/_components/AddFriendDialog";
import AddMemberDialog from "./_components/AddMemberDialog";
import { fixPopover } from "@/components/shared/select/FriendsSelect";

type Props = {
  params: {
    conversationId: string;
  };
};

const ConversationPage = ({
  params: { conversationId },
}: Props) => {
  const [conversation, setConversation] =
    useState<null | ConversationDetail>(null);
  const [unfriendDialogOpen, setUnfriendDialogOpen] =
    useState<boolean>(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] =
    useState<boolean>(false);

  const [addMemberDialogOpen, setAddMemberDialogOpen] =
    useState<boolean>(false);
  const getConversation = async () => {
    try {
      const { data } = await axios.get(
        API_PATH.CONVERSATION_DETAIL(
          conversationId as string
        )
      );
      setConversation(() => data);
    } catch (error) {
      defaultError(error);
    }
  };
  useEffect(() => {
    getConversation();
  }, []);

  useEffect(() => {
    fixPopover(addMemberDialogOpen);
  }, [addMemberDialogOpen]);
  return !conversation ? (
    <Loading />
  ) : (
    <ConversationContainer>
      <UnfriendDialog
        open={unfriendDialogOpen}
        setOpen={setUnfriendDialogOpen}
        conversationId={conversationId}
      />
      <LeaveGroupDialog
        open={leaveGroupDialogOpen}
        setOpen={setLeaveGroupDialogOpen}
        conversationId={conversationId}
      />
      <AddMemberDialog
        conversationId={conversationId}
        open={addMemberDialogOpen}
        setOpen={setAddMemberDialogOpen}
      />
      <Header
        imageUrl={conversation.imageUrl}
        name={conversation.name as string}
        options={
          conversation.isGroup
            ? [
                {
                  label: "Add members",
                  destructive: false,
                  onClick: () => {
                    setAddMemberDialogOpen(() => true);
                  },
                },
                {
                  label: "Leave group",
                  destructive: true,
                  onClick: () => {
                    setLeaveGroupDialogOpen(() => true);
                  },
                },
              ]
            : [
                {
                  label: "Unfriend",
                  destructive: true,
                  onClick: () => {
                    setUnfriendDialogOpen(() => true);
                  },
                },
              ]
        }
      />
      <Body />
      <ChatInput />
    </ConversationContainer>
  );
};

export default ConversationPage;
