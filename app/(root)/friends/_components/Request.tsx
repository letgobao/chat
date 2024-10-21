"use client";

import { API_PATH } from "@/app/api/constants";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { defaultError, toast } from "@/lib/toaster";
import axios from "axios";
import { Check, User, X } from "lucide-react";
import { useState } from "react";

type Props = {
  name: string;
  imageUrl: string;
  email: string;
  id: string;
};

const Request = ({ id, imageUrl, name, email }: Props) => {
  const [loading, setLoading] = useState(false);
  const handleRequest = async (isAccept: boolean) => {
    try {
      setLoading(() => true);
      await axios.patch(API_PATH.FRIEND_REQUEST, {
        id,
        isAccept,
      });
      toast.success(
        isAccept
          ? "You are now friends"
          : "Friend request denied"
      );
      setLoading(() => false);
    } catch (error) {
      defaultError(error);
    } finally {
      setLoading(() => false);
    }
  };
  return (
    <Card className="w-full p-2 flex flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-4 truncate">
        <Avatar>
          <AvatarImage src={imageUrl} />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col truncate">
          <h4 className="truncate ">{name}</h4>
          <p className="text-xs text-muted-foreground truncate">
            {email}
          </p>
        </div>
      </div>
      <div className="flex item-center gap-2">
        <Button
          size={"icon"}
          onClick={() => handleRequest(true)}
          disabled={loading}
        >
          <Check />
        </Button>
        <Button
          size={"icon"}
          variant="destructive"
          onClick={() => handleRequest(false)}
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Request;
