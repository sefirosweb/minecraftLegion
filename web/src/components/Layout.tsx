import NavbarLayout from "./NavbarLayout";
import { Outlet } from "react-router";

import { useSocketSetup } from "@/utils/useSocketSetup";
import { useSetSelectedSocket } from "@/utils/useSetSelectedSocket";
import { FooterNav } from "./FooterNav";

export const Layout = () => {

  useSocketSetup()
  useSetSelectedSocket()

  return (
    <>
      <NavbarLayout />
      <div className="container">
        <Outlet />
      </div>

      <FooterNav />
    </>
  );
}