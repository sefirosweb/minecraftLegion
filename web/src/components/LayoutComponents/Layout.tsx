import { Navbar } from "./Navbar";
import { Outlet } from "react-router";
import { useSocketSetup } from "@/utils/useSocketSetup";
import { FooterNav } from "./FooterNav";
import React, { Suspense } from "react";
import { LoadingPage } from "@/pages/LoadingPage";

export const Layout: React.FC = () => {
  useSocketSetup()

  return (
    <>
      <Navbar />

      <div className="mx-sm-3 mx-md-4 mx-lg-5">
        <Suspense fallback={<LoadingPage />}>
          <Outlet />
        </Suspense>
      </div>

      <FooterNav />
    </>
  );
}