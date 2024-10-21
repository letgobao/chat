import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  isCurrentUser: boolean;
  imageUrl: string;
  name: string;
  content: string;
  createdAt: Date;
  groupBubble: boolean;
};

const Message = ({
  isCurrentUser,
  imageUrl,
  name,
  content,
  createdAt,
  groupBubble,
}: Props) => {
  return (
    <div
      className={cn("flex items-end", {
        "justify-end": isCurrentUser,
      })}
    >
      <div
        className={cn("flex flex-col w-full mx-2", {
          "order-1 items-end": isCurrentUser,
          "order-2 items-start": !isCurrentUser,
        })}
      >
        <div
          className={cn(
            "px-4 py-2 rounded-lg max-w-[70%]",
            {
              "bg-primary text-primary-foreground":
                isCurrentUser,
              "bg-secondary text-secondary-foreground":
                !isCurrentUser,
              "rounded-br-none":
                groupBubble && isCurrentUser,
              "rounded-bl-none":
                groupBubble && !isCurrentUser,
            }
          )}
        >
          <p className="text-wrap break-words whitespace-pre-wrap">
            {content}
          </p>
          <p
            className={cn("text-xs flex w-full my-1", {
              "text-primary-foreground justify-end":
                isCurrentUser,
              "text-secondary-foreground justify-start":
                !isCurrentUser,
            })}
          >
            {timeAgo(createdAt)}
          </p>
        </div>
      </div>
      <Avatar
        className={cn("relative w-8 h-8", {
          "order-2": isCurrentUser,
          "order-1": !isCurrentUser,
          invisible: groupBubble,
        })}
      >
        <AvatarImage src={imageUrl} />
        <AvatarFallback>
          {name.substring(0, 1)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default Message;
