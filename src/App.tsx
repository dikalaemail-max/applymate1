import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Scholarships from "./pages/Scholarships";
import ScholarshipForm from "./pages/ScholarshipForm";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import SharedWithMe from "./pages/SharedWithMe";
import SharedView from "./pages/SharedView";
import AdminUsers from "./pages/AdminUsers";
import SettingsPage from "./pages/SettingsPage";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/shared/:token" element={<SharedView />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/scholarships" element={<ProtectedRoute><Scholarships /></ProtectedRoute>} />
            <Route path="/scholarships/new" element={<ProtectedRoute><ScholarshipForm /></ProtectedRoute>} />
            <Route path="/scholarships/:id" element={<ProtectedRoute><ScholarshipDetail /></ProtectedRoute>} />
            <Route path="/shared" element={<ProtectedRoute><SharedWithMe /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
