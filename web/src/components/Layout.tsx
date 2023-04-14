import NavbarLayout from "./NavbarLayout";
import { Outlet } from "react-router";
import { useSocketSetup } from "@/utils/useSocketSetup";
import { FooterNav } from "./FooterNav";
import { useSetSelectedSocket } from "@/utils/useSetSelectedSocket";

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