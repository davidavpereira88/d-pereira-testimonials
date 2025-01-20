import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useBranding } from "@/hooks/useBranding";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: branding } = useBranding();
  const primaryColor = branding?.primary_color || '#2e75a9';

  const { data: userRole, isLoading: isRoleLoading } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      return data?.role;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again.",
      });
    }
  };

  // Hide navigation on login and embed pages, or if there's no authenticated user
  if (!user || location.pathname === '/login' || location.pathname === '/embed' || isRoleLoading) {
    return null;
  }

  return (
    <nav className="bg-background border-b mb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
                location.pathname === "/" 
                  ? "hover:opacity-90" 
                  : "hover:bg-muted"
              )}
              style={location.pathname === "/" ? {
                backgroundColor: `${primaryColor}10`,
                color: primaryColor
              } : undefined}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>
            {userRole === "admin" && (
              <Link 
                to="/admin" 
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
                  location.pathname === "/admin" 
                    ? "hover:opacity-90" 
                    : "hover:bg-muted"
                )}
                style={location.pathname === "/admin" ? {
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor
                } : undefined}
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Admin</span>
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};