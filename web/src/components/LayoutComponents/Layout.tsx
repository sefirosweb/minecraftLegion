import { Navbar } from "./Navbar";
import { Outlet } from "react-router";
import { useSocketSetup } from "@/utils/useSocketSetup";
import { FooterNav } from "./FooterNav";
import React, { Suspense } from "react";
import { LoadingPage } from "@/pages/LoadingPage";
import { Container } from "react-bootstrap";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const Layout: React.FC = () => {
  useSocketSetup()

  return (
    <>
      <Navbar />
      <Container className="mb-5">
        <Suspense fallback={<LoadingPage />}>
          <Outlet />
        </Suspense>
      </Container>
      <ReactQueryDevtools />
      <FooterNav />
    </>
  );
}