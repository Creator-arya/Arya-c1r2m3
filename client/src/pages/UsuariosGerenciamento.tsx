import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "user" | "admin" | "master";
  createdAt: string;
}

export default function UsuariosGerenciamento() {
  const [, navigate] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "user" as const,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/list");
      if (!response.ok) throw new Error("Erro ao buscar usuarios");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.name) {
      toast.error("Preencha todos os campos obrigatorios");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar usuario");
      }

      toast.success("Usuario criado com sucesso!");
      setFormData({ username: "", password: "", name: "", email: "", role: "user" });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar usuario");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este usuario?")) return;

    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar usuario");

      toast.success("Usuario deletado com sucesso!");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar usuario");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Novo Usuario</CardTitle>
              <CardDescription>Cadastre um novo usuario no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Usuario *</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nome de usuario"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Senha"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="role">Papel</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Usuario"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Usuarios do Sistema</CardTitle>
              <CardDescription>Gerenciar usuarios cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="animate-spin w-8 h-8" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-sm">{user.username}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email || "-"}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {user.role === "admin" ? "Admin" : user.role === "master" ? "Master" : "Usuario"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
