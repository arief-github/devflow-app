"use client";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn />
    </div>
  );
};

export default SignInPage;
