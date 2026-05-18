"use client";

import { useTheme } from "@/context/ThemeProvider";
import { Button } from "@/components/ui/button";

const Homepage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Button variant="secondary" onClick={() => setTheme("light")}>
        Light
      </Button>
      <Button variant="destructive" onClick={() => setTheme("dark")}>
        Dark
      </Button>
      <Button variant="outline" onClick={() => setTheme("system")}>
        System
      </Button>
      <Button variant="link" onClick={() => setTheme("dark")}>
        Dark
      </Button>
      <span className="text-primary-500">{theme}</span>
    </div>
  );
};

export default Homepage;
