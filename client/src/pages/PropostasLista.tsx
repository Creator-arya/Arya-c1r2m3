import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const TIPOS_PROPOSTA_MAP: Record<string, string> = {
  novo: "Novo",
  refinanciamento: "Refinanciamento",
  portabilidade: "Portabilidade",
  refin_portabilidade: "Refin da Portabilidade",
  refin_carteira: "Refin de Carteira",
  fgts: "FGTS",
  clt: "CLT",
  outros: "Outros",
};

export default function PropostasLista() {
  const { user } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const propostasQuery = trpc.propostas.list.useQuery();
  const deletePropostaMutation = trpc.propostas.delete.useMutation({
    onSuccess: () => {
      toast.success("Proposta deletada com sucesso!");
      propostasQuery.refetch();
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Erro ao deletar proposta");
    },
  });

  const handleDelete = async (id: number) => {
    if (deleteId === id) {
      await deletePropostaMutation.mutateAsync({ id });
    } else {
      setDeleteId(id);
    }
  };

  if (propostasQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const propostas = propostasQuery.data || [];

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Propostas</CardTitle>
          <CardDescription>
            {user?.role === "admin" ? "Todas as propostas do sistema" : "Suas propostas cadastradas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {propostas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma proposta encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Proposta</th>
                    <th className="text-left py-3 px-4">Banco</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-right py-3 px-4">Valor</th>
                    <th className="text-right py-3 px-4">Comissão</th>
                    <th className="text-center py-3 px-4">Parcelas</th>
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-center py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {propostas.map((proposta) => (
                    <tr key={proposta.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{proposta.numeroProposta}</td>
                      <td className="py-3 px-4">{proposta.banco}</td>
                      <td className="py-3 px-4">{TIPOS_PROPOSTA_MAP[proposta.tipo] || proposta.tipo}</td>
                      <td className="py-3 px-4 text-right">R$ {parseFloat(proposta.valor.toString()).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        R$ {parseFloat(proposta.comissao.toString()).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">{proposta.numeroParcelas}x</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(proposta.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={deleteId === proposta.id ? "text-red-700" : "text-red-600 hover:text-red-800"}
                            onClick={() => handleDelete(proposta.id)}
                            disabled={deletePropostaMutation.isPending}
                          >
                            {deletePropostaMutation.isPending && deleteId === proposta.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {deleteId === proposta.id && (
                          <p className="text-xs text-red-600 mt-1">Clique novamente para confirmar</p>
                        )}
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
