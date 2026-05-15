"use client";
import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignUp />
    </div>
  );
};

export default SignUpPage;
