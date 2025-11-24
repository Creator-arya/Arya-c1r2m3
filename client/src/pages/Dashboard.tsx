import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";


export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Você precisa estar logado para acessar o dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo, {user.name}!</p>
        <p className="text-gray-600 mt-2">Papel: {user.role === "admin" ? "Administrador" : "Usuário"}</p>
      </div>
    </DashboardLayout>
  );
}
