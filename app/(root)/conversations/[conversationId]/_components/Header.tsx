"use client";

import {
  AvatarFallback,
  AvatarImage,
  Avatar,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
("@radix-ui/react-avatar");
import { CircleArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  imageUrl?: string;
  name: string;
  options?: {
    label: string;
    destructive: boolean;
    onClick?: () => void;
    dialog?: React.JSX.Element;
  }[];
};

const Header = ({ imageUrl, name, options }: Props) => {
  return (
    <Card className="flex w-full rounded-lg items-center p-2 justify-between">
      <div className="flex items-center gap-2">
        <Link
          className="block lh:hidden"
          href={"/conversations"}
        >
          <CircleArrowLeft />
        </Link>
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={imageUrl}
            className="rounded-full"
          />
          <AvatarFallback>
            {name.substring(0, 1)}
          </AvatarFallback>
        </Avatar>
        <h2 className="font-semibold">{name}</h2>
      </div>
      <div className="flex gap-2">
        {options ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={"icon"} variant={"secondary"}>
                <Settings />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {options.map(
                (
                  { onClick, destructive, label },
                  index
                ) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={onClick ? onClick : undefined}
                    className={cn(
                      "font-semibold cursor-pointer",
                      {
                        "text-destructive": destructive,
                      }
                    )}
                  >
                    {label}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </Card>
  );
};

export default Header;
