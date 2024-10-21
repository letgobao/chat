import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  id: string;
  imageUrl?: string;
  name: string;
  isGroup: boolean;
  lastMessage: string | null;
};

const Conversation = ({
  id,
  imageUrl,
  name,
  isGroup,
  lastMessage,
}: Props) => {
  return (
    <Link href={`/conversations/${id}`} className="w-full">
      <Card className="p-2 flex flex-row items-center gap-4 truncate">
        <div className="flex flex-row items-center gap-4 truncate">
          <Avatar>
            {!isGroup && <AvatarImage src={imageUrl} />}
            <AvatarFallback>
              {isGroup ? (
                name.charAt(0).toLocaleUpperCase()
              ) : (
                <User />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <h4 className="truncate">{name}</h4>
            <p className="text-sm text-muted-foreground">
              {lastMessage ?? "Start the conversation!"}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Conversation;
