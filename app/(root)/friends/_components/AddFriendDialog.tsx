"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toaster";
import { API_PATH } from "@/app/api/constants";

type Props = {};

const addFriendFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field can not be empty" })
    .email("Please enter a valid email"),
});

const AddFriendDialog = (props: Props) => {
  const form = useForm<z.infer<typeof addFriendFormSchema>>(
    {
      resolver: zodResolver(addFriendFormSchema),
      defaultValues: {
        email: "",
      },
    }
  );

  const isLoading = form.formState.isSubmitting;

  const handleSubmit = async (
    values: z.infer<typeof addFriendFormSchema>
  ) => {
    try {
      await axios.post(API_PATH.FRIEND_REQUEST, values);

      form.reset();

      toast.success("Friend request sent!");
    } catch (error: any) {
      toast.error(
        error.response?.data || "Unexpected error occurred!"
      );
    }
  };
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size={"icon"} variant={"outline"}>
            <DialogTrigger asChild>
              <UserPlus />
            </DialogTrigger>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Friend</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add friend</DialogTitle>
          <DialogDescription>
            Send a request to connect with your friend.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={isLoading} type="submit">
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
