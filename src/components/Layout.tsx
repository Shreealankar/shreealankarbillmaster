import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/auth');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-dark">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <header className="h-16 flex items-center border-b border-border bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="ml-4" />
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/a353b3db-e82b-4bbf-9ce4-2324f1d83ca1.png" 
                  alt="Shree Alankar Logo" 
                  className="w-10 h-10 object-contain"
                />
                <div className="text-center">
                  <h1 className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                    Shree Alankar
                  </h1>
                  <p className="text-xs text-muted-foreground">Jewelry Billing System</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="mr-4"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </header>
          <div className="p-6 h-[calc(100vh-4rem)] overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};