"use client";

import { API_PATH } from "@/app/api/constants";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useConversation } from "@/hooks/useConversation";
import { defaultError } from "@/lib/toaster";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TextAreaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { SendHorizonalIcon } from "lucide-react";

type Props = {};

const messageSchema = z.object({
  content: z.string(),
});

const ChatInput = (props: Props) => {
  const { conversationId } = useConversation();
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleInputChange = (evt: any) => {
    const { value, selectionStart } = evt.target;

    if (selectionStart !== null) {
      form.setValue("content", value);
    }
  };

  const handleSubmit = async (
    values: z.infer<typeof messageSchema>
  ) => {
    try {
      if (checkEmptyContent()) {
        form.reset();
        return;
      }
      await axios.post(API_PATH.MESSAGE, {
        conversationId,
        content: values.content.trim(),
      });
      form.reset();
    } catch (error) {
      defaultError(error);
    }
  };

  const checkEmptyContent = () => {
    let { content } = form.getValues();
    content = content.trim();
    return (
      content.length === 0 ||
      content
        .split("\n")
        .every((line) => line.trim().length === 0)
    );
  };
  return (
    <Card className="w-full p-2 rounded-lg relative">
      <div className="flex gap-2 items-end w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex gap-2 items-end w-full"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="h-full w-full">
                  <FormControl>
                    <TextAreaAutosize
                      rows={1}
                      maxRows={3}
                      {...field}
                      onChange={handleInputChange}
                      onKeyDown={async (e) => {
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey
                        ) {
                          e.preventDefault();
                          await form.handleSubmit(
                            handleSubmit
                          )();
                        }
                      }}
                      placeholder="Type a message..."
                      className="min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground placeholder:text-muted-foreground p-1.5"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              disabled={isSubmitting}
              type={"submit"}
              size={"icon"}
            >
              <SendHorizonalIcon />
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default ChatInput;
