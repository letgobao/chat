"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigation } from "@/hooks/useNavigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Nav = () => {
  const paths = useNavigation();
  return (
    <Card className="fixed bottom-4 w-[calc(100vw-32px)] flex items-center h-16 p-2 lg:bottom-0 lg:relative lg:flex-col lg:justify-between  lg:h-full lg:w-16 lg:px-2 lg:py-4">
      <nav className="w-full h-full">
        <ul className="flex relative h-full justify-evenly lg:justify-start lg:flex-col  items-center lg:gap-4">
          {paths.map((path, id) => (
            <li key={id} className="relative">
              {path.count ? (
                <Badge
                  className="absolute left-6 bottom-7 px-2"
                  variant={"destructive"}
                >
                  {path.count}
                </Badge>
              ) : null}
              <Link href={path.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={
                        path.active ? "default" : "outline"
                      }
                    >
                      {path.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{path.name}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            </li>
          ))}
          <li className="lg:absolute lg:bottom-12">
            <ThemeToggle />
          </li>
          <li className="lg:absolute lg:bottom-0">
            <UserButton />
          </li>
        </ul>
      </nav>
    </Card>
  );
};

export default Nav;
