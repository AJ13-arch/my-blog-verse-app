
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, PenSquare } from "lucide-react";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="font-semibold text-xl">Vibrant Journal</Link>
          
          {user && (
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/posts/new">
                  <PenSquare className="mr-1 h-4 w-4" />
                  New Post
                </Link>
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {profile?.username || 'User'}
              </span>
              <Button size="sm" variant="ghost" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
