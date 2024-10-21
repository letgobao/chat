"use client";

import { API_PATH } from "@/app/api/constants";
import {
  FriendsSelect,
  FriendsSelected,
} from "@/components/shared/select/FriendsSelect";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { defaultError, toast } from "@/lib/toaster";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CirclePlus, X } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  conversationId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

type Friend = {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
};

const createGroupSchema = z.object({
  list: z.string().array().min(1, {
    message: "You must select at least 1 new members",
  }),
});

const AddMemberDialog = ({
  conversationId,
  open,
  setOpen,
}: Props) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const form = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { list: [] },
  });

  useEffect(() => {
    getFriends();
  }, []);

  const getFriends = async () => {
    try {
      const { data } = await axios.get(
        API_PATH.DELETE_FRIEND(conversationId)
      );
      setFriends(() => data);
    } catch (error) {
      defaultError(error);
    }
  };

  const list = form.watch("list", []);

  const isSubmitting = form.formState.isSubmitting;

  const unSelectedFriends = useMemo(() => {
    return friends.filter(
      (friend) => !list.includes(friend.id)
    );
  }, [list.length, friends.length]);

  const handleSubmit = async (
    values: z.infer<typeof createGroupSchema>
  ) => {
    try {
      await axios.put(API_PATH.GROUP, {
        ...values,
        conversationId,
      });
      toast.success("Add new members successfully");
      form.reset();
      setOpen(false);
    } catch (error) {
      defaultError(error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="block">
        <DialogHeader className="mb-4">
          <DialogTitle>Add new member</DialogTitle>
          <DialogDescription>
            Add your friends to group
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="list"
              render={({}) => (
                <FriendsSelect
                  handleSelect={(checkedId: string) => {
                    form.setValue("list", [
                      ...list,
                      checkedId,
                    ]);
                  }}
                  disabled={unSelectedFriends.length === 0}
                  unSelected={unSelectedFriends}
                />
              )}
            />
            <FriendsSelected
              selected={friends.filter((friend) =>
                list.includes(friend.id)
              )}
              removeSelected={(selectedId) => {
                form.setValue(
                  "list",
                  list.filter(
                    (member) => member !== selectedId
                  )
                );
              }}
            />
            <DialogFooter>
              <Button
                disabled={isSubmitting}
                type="submit"
                className="w-full"
              >
                Add
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
