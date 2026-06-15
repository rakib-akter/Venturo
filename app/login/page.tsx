import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to sync your Venturo trips across devices.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-12" />}>
      <AuthForm />
    </Suspense>
  );
}
