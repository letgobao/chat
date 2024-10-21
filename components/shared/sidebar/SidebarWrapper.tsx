import React from "react";
import Nav from "./Nav";

type Props = React.PropsWithChildren<{}>;

const SidebarWrapper = ({ children }: Props) => {
  return (
    <div className="h-screen w-full p-4 flex flex-col lg:flex-row gap-4">
      <Nav />
      <main className="h-[calc(100% - 80px)] lg:h-full w-full gap-4 flex">
        {children}
      </main>
    </div>
  );
};

export default SidebarWrapper;
