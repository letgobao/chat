import { PusherClient } from "@/lib/pusher";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Channel } from "pusher-js";
import { useEffect, useMemo, useState } from "react";

export const usePusher = () => {
  const { userId } = useAuth();
  const [channel, setChannel] = useState<null | Channel>(
    null
  );

  useEffect(() => {
    if (!!userId && channel === null) {
      const newChannel = PusherClient.subscribe(userId);

      setChannel(() => newChannel);
    }
  }, [userId, channel]);

  return { channel };
};
