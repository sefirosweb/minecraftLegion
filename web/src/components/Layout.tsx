import NavbarLayout from "./NavbarLayout";
import { Outlet } from "react-router";
import { useSocketSetup } from "@/utils/useSocketSetup";
import { FooterNav } from "./FooterNav";

export const Layout = () => {

  useSocketSetup()

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