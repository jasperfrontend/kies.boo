import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./pages/Dashboard";
import { Footer } from "./components/Footer";
import Hub from "./pages/Hub";
import SearchResults from "./pages/SearchResults";
import UserProfile from "./pages/UserProfile";
import TagManagement from "./pages/TagManagement";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

// Wrapper component that adds footer to protected routes
const ProtectedWithFooter = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <div className="pb-16"> {/* Add padding bottom to prevent content from being hidden behind footer */}
      {children}
    </div>
    <Footer />
  </ProtectedRoute>
);

const AppContent = () => (
  <Routes>
    <Route 
      path="/" 
      element={
        <ProtectedWithFooter>
          <Dashboard />
        </ProtectedWithFooter>
      } 
    />
    <Route 
      path="/hub" 
      element={
        <ProtectedWithFooter>
          <Hub />
        </ProtectedWithFooter>
      } 
    />
    <Route 
      path="/search" 
      element={
        <ProtectedWithFooter>
          <SearchResults />
        </ProtectedWithFooter>
      } 
    />
    <Route 
      path="/profile" 
      element={
        <ProtectedWithFooter>
          <UserProfile />
        </ProtectedWithFooter>
      } 
    />
    <Route 
      path="/tags" 
      element={
        <ProtectedWithFooter>
          <TagManagement />
        </ProtectedWithFooter>
      } 
    />
    <Route 
      path="/auth" 
      element={
        <PublicRoute>
          <AuthForm />
        </PublicRoute>
      } 
    />
    {/* Public pages - these show footer without authentication */}
    <Route 
      path="/about" 
      element={<About />} 
    />
    <Route 
      path="/privacy" 
      element={<Privacy />} 
    />
    <Route 
      path="/terms" 
      element={<Terms />} 
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;