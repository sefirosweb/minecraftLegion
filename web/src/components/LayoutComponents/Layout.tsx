import { Navbar } from "./Navbar";
import { Outlet } from "react-router";
import { useSocketSetup } from "@/utils/useSocketSetup";
import { FooterNav } from "./FooterNav";
import React from "react";

export const Layout: React.FC = () => {
  useSocketSetup()

  return (
    <>
      <Navbar />

      <div className="mx-sm-3 mx-md-4 mx-lg-5">
        <Outlet />
      </div>

      <FooterNav />
    </>
  );
}