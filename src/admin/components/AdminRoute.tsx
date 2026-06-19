import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, isLoading, hasError, retry } = useAdminAuth();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <h1 className="text-xl font-semibold">Не вдалося перевірити доступ</h1>
          <p className="text-sm text-muted-foreground">
            Сталася тимчасова помилка мережі під час перевірки ваших прав адміністратора.
          </p>
          <Button onClick={retry}>Спробувати ще раз</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
