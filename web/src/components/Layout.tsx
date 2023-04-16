import { NavbarLayout } from "./NavbarLayout";
import { Outlet } from "react-router";
import { useSocketSetup } from "@/utils/useSocketSetup";
import { FooterNav } from "./FooterNav";

export const Layout = () => {
  useSocketSetup()

  return (
    <>
      <NavbarLayout />

      <div className="mx-sm-3 mx-md-4 mx-lg-5">
        <Outlet />
      </div>

      <FooterNav />
    </>
  );
}