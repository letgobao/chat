"use client";

import { Card } from "@/components/ui/card";
import { useConversation } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";
import React from "react";

type Props = React.PropsWithChildren<{
  title: string;
  action?: React.ReactNode;
}>;

const ItemList = ({
  children,
  title,
  action: Action,
}: Props) => {
  const { isActive } = useConversation();
  return (
    <Card
      className={cn(
        "hidden h-full w-full lg:flex-none lg:w-80 p-2",
        {
          "flex flex-col": !isActive,
          "lg:flex flex-col": isActive,
        }
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {Action ? Action : null}
      </div>
      <div
        className={cn(
          "w-full flex items-center justify-start gap-3 flex-col overflow-scroll shrink-1 no-scrollbar"
        )}
      >
        {children}
      </div>
    </Card>
  );
};

export default ItemList;
