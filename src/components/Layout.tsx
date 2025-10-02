import { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="md:ml-64 p-4 md:p-6 pt-16 md:pt-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;