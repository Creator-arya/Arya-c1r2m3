import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

const TIPOS_PROPOSTA = [
  { value: "novo", label: "Novo" },
  { value: "refinanciamento", label: "Refinanciamento" },
  { value: "portabilidade", label: "Portabilidade" },
  { value: "refin_portabilidade", label: "Refin da Portabilidade" },
  { value: "refin_carteira", label: "Refin de Carteira" },
  { value: "fgts", label: "FGTS" },
  { value: "clt", label: "CLT" },
  { value: "outros", label: "Outros" },
];

const BANCOS = [
  "Banco do Brasil",
  "Caixa",
  "Itaú",
  "Bradesco",
  "Santander",
  "Nubank",
  "Inter",
  "Outro",
];

export default function ComissoesGerenciamento() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    userId: "",
    banco: "",
    tipo: "",
    percentual: "",
  });

  const comissoesQuery = trpc.comissoes.listAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const usersQuery = trpc.users.listAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const createComissaoMutation = trpc.comissoes.create.useMutation({
    onSuccess: () => {
      toast.success("Comissão criada com sucesso!");
      setFormData({ userId: "", banco: "", tipo: "", percentual: "" });
      comissoesQuery.refetch();
    },
    onError: () => {
      toast.error("Erro ao criar comissão");
    },
  });

  const deleteComissaoMutation = trpc.comissoes.delete.useMutation({
    onSuccess: () => {
      toast.success("Comissão deletada com sucesso!");
      comissoesQuery.refetch();
    },
    onError: () => {
      toast.error("Erro ao deletar comissão");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.banco || !formData.tipo || !formData.percentual) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      await createComissaoMutation.mutateAsync({
        userId: parseInt(formData.userId),
        banco: formData.banco,
        tipo: formData.tipo as any,
        percentual: formData.percentual,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <p className="text-red-600">Você não tem permissão para acessar esta página</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Comissão</CardTitle>
          <CardDescription>Configure as comissões para cada usuário, banco e tipo de proposta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">Usuário</Label>
                <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                  <SelectTrigger id="userId">
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersQuery.data?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="banco">Banco</Label>
                <Select value={formData.banco} onValueChange={(value) => setFormData({ ...formData, banco: value })}>
                  <SelectTrigger id="banco">
                    <SelectValue placeholder="Selecione um banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANCOS.map((banco) => (
                      <SelectItem key={banco} value={banco}>
                        {banco}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo de Proposta</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_PROPOSTA.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="percentual">Percentual (%)</Label>
                <Input
                  id="percentual"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 2.5"
                  value={formData.percentual}
                  onChange={(e) => setFormData({ ...formData, percentual: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={createComissaoMutation.isPending}>
              {createComissaoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Comissão"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comissões Cadastradas</CardTitle>
          <CardDescription>Gerencie as comissões do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {comissoesQuery.isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : comissoesQuery.data?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma comissão cadastrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Usuário</th>
                    <th className="text-left py-3 px-4">Banco</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-right py-3 px-4">Percentual</th>
                    <th className="text-center py-3 px-4">Status</th>
                    <th className="text-center py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {comissoesQuery.data?.map((comissao: any) => (
                    <tr key={comissao.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{comissao.userId}</td>
                      <td className="py-3 px-4">{comissao.banco}</td>
                      <td className="py-3 px-4">{comissao.tipo}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {parseFloat(comissao.percentual.toString()).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={comissao.ativo ? "text-green-600" : "text-gray-500"}>
                          {comissao.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800" title="Editar">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => deleteComissaoMutation.mutate({ id: comissao.id })}
                            disabled={deleteComissaoMutation.isPending}
                          >
                            {deleteComissaoMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
