import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{APP_TITLE}</h1>
          <p className="text-xl text-gray-600">Gerenciamento eficiente de propostas e comissões</p>
        </div>

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Acesse seu painel de controle</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/dashboard")} className="w-full">
                  Ir para Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nova Proposta</CardTitle>
                <CardDescription>Cadastre uma nova proposta</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/propostas/novo")} className="w-full">
                  Cadastrar Proposta
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Propostas</CardTitle>
                <CardDescription>Visualize suas propostas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/propostas/lista")} className="w-full">
                  Ver Propostas
                </Button>
              </CardContent>
            </Card>

            {user.role === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Comissões</CardTitle>
                  <CardDescription>Configure as comissões do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/comissoes")} className="w-full">
                    Gerenciar Comissões
                  </Button>
                </CardContent>
              </Card>
            )}

            {user.role === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>Crie e gerencie usuários do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/usuarios")} className="w-full">
                    Gerenciar Usuários
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bem-vindo, {user.name}!</CardTitle>
                  <CardDescription>Papel: {user.role === "admin" ? "Administrador" : user.role === "master" ? "Master" : "Usuário"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => logout()} variant="outline" className="w-full">
                    Sair
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Bem-vindo ao {APP_TITLE}</CardTitle>
                <CardDescription>Faça login para acessar o sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/login")} className="w-full">
                  Fazer Login
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
