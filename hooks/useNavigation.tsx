import { API_PATH } from "@/app/api/constants";
import { PusherEvent } from "@/lib/pusher";
import { defaultError } from "@/lib/toaster";
import axios from "axios";
import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePusher } from "./usePusher";

export const useNavigation = () => {
  const pathname = usePathname();

  const [count, setCount] = useState<number>(0);

  const getCount = async () => {
    try {
      const { data } = await axios.options(
        API_PATH.FRIEND_REQUEST
      );
      setCount(() => data.count);
    } catch (error) {
      defaultError(error);
    }
  };

  useEffect(() => {
    getCount();
  }, []);

  const { channel } = usePusher();
  useEffect(() => {
    if (!!channel) {
      channel.bind(PusherEvent.NEW_REQUEST, getCount);
      channel.bind(PusherEvent.HANDLE_REQUEST, getCount);
    }
  }, [channel]);

  const paths = useMemo(
    () => [
      {
        name: "Conversations",
        href: "/conversations",
        icon: <MessageSquare />,
        active: pathname?.startsWith("/conversations"),
      },
      {
        name: "Friends",
        href: "/friends",
        icon: <Users />,
        active: pathname?.startsWith("/friends"),
        count,
      },
    ],
    [pathname, count]
  );

  return paths;
};
