import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-dark">
          <AppSidebar />
          <main className="flex-1 overflow-hidden">
            <header className="h-16 flex items-center border-b border-border bg-card/50 backdrop-blur-sm">
              <SidebarTrigger className="ml-4" />
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">SA</span>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                    Shree Alankar
                  </h1>
                </div>
              </div>
            </header>
            <div className="p-6 h-[calc(100vh-4rem)] overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};