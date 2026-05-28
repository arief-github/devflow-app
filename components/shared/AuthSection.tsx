"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { Skeleton } from "../ui/skeleton";

const AuthSection = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (isSignedIn) {
    return (
      <UserButton
        afterSwitchSessionUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-10 w-10",
          },
          variables: {
            colorPrimary: "#ff7000",
          },
        }}
      />
    );
  }
};

export default AuthSection;
