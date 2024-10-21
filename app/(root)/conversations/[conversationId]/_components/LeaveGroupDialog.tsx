"use client";
import { API_PATH } from "@/app/api/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { defaultError, toast } from "@/lib/toaster";
import axios from "axios";
import React, {
  Dispatch,
  SetStateAction,
  useState,
} from "react";

type Props = {
  conversationId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const LeaveGroupDialog = ({
  conversationId,
  open,
  setOpen,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const leave = async () => {
    try {
      setLoading(() => true);
      await axios.delete(
        API_PATH.CONVERSATION_DETAIL(conversationId)
      );
      toast.success("Leave group success");

      setLoading(() => false);
    } catch (error) {
      defaultError(error);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can not be undo. All messages will
            be lost and you will not be able to message this
            user. All groups chat will still work as normal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={leave}
          >
            Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveGroupDialog;
