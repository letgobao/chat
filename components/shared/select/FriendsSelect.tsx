import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X } from "lucide-react";
import React, { useState } from "react";
type Friend = {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
};
type SelectProps = {
  handleSelect: (data: any) => void;
  disabled?: boolean;
  unSelected: Friend[];
};

type SelectedProps = {
  selected: Friend[];
  removeSelected: (data: any) => void;
};

export const fixPopover = (open: boolean) => {
  const ID = "popover-fix";

  if (open) {
    const style = document.createElement("style");

    style.id = ID;
    style.innerHTML = `
[data-radix-popper-content-wrapper] {
  min-width: 100vw !important;
  display: flex !important;
  justify-content: center !important;
}
[data-radix-popper-content-wrapper] > div {
  min-width: 250px !important;
}
`;

    document.head.appendChild(style);
  } else {
    const style = document.getElementById(ID);

    if (style) {
      // wait for the popover to close before removing the style
      setTimeout(() => {
        document.head.removeChild(style);
      }, 150);
    }
  }
};

export const FriendsSelect = ({
  disabled = false,
  handleSelect,
  unSelected,
}: SelectProps) => {
  return (
    <FormItem className="relative flex items-center">
      <FormLabel className="flex-start">Friends</FormLabel>
      <FormControl>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <Button
              className="absolute left-1/2 -translate-x-1/2 w-[250px]"
              variant={"outline"}
            >
              Select
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-9">
            {unSelected.map((friend) => {
              return (
                <DropdownMenuCheckboxItem
                  key={friend.id}
                  className="flex items-center gap-2 w-full p-2"
                  onCheckedChange={() =>
                    handleSelect(friend.id)
                  }
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={friend.imageUrl} />
                    <AvatarFallback>
                      {friend.name.substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="truncate">
                    {friend.name}
                  </h4>
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export const FriendsSelected = ({
  selected,
  removeSelected,
}: SelectedProps) => {
  return (
    <Card className="flex items-center gap-4 overflow-x-auto w-full h-24 p-2 no-scrollbar">
      {selected.map((friend) => (
        <div
          key={friend.id}
          className="flex flex-col items-center rounded gap-1 w-14 hover:shadow-md cursor-pointer"
        >
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarImage src={friend.imageUrl} />
              <AvatarFallback>
                {friend.name.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
            <X
              className="text-muted-foreground w-4 h-4 absolute bottom-8 left-7 bg-muted rounded-full cursor-pointer"
              onClick={() => removeSelected(friend.id)}
            />
          </div>
          <p className="truncate text-sm">
            {friend.name.split(" ")[0]}
          </p>
        </div>
      ))}
    </Card>
  );
};
