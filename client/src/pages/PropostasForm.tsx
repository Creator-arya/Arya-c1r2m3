import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

export default function PropostasForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    numeroProposta: "",
    numeroParcelas: "",
    banco: "",
    valor: "",
    tipo: "",
  });

  const [comissaoCalculada, setComissaoCalculada] = useState<number | null>(null);
  const createPropostaMutation = trpc.propostas.create.useMutation();
  const comissoesQuery = trpc.comissoes.listByUser.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  useMemo(() => {
    if (formData.tipo && formData.banco && formData.valor && comissoesQuery.data) {
      const comissao = comissoesQuery.data.find(
        (c) => c.tipo === formData.tipo && c.banco === formData.banco
      );
      if (comissao) {
        const valor = parseFloat(formData.valor);
        const percentual = parseFloat(comissao.percentual.toString());
        const comissaoValor = (valor * percentual) / 100;
        setComissaoCalculada(comissaoValor);
      } else {
        setComissaoCalculada(0);
      }
    } else {
      setComissaoCalculada(null);
    }
  }, [formData.tipo, formData.banco, formData.valor, comissoesQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numeroProposta || !formData.numeroParcelas || !formData.banco || !formData.valor || !formData.tipo) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      await createPropostaMutation.mutateAsync({
        numeroProposta: formData.numeroProposta,
        numeroParcelas: parseInt(formData.numeroParcelas),
        banco: formData.banco,
        valor: formData.valor,
        tipo: formData.tipo as any,
      });

      toast.success("Proposta criada com sucesso!");
      setFormData({
        numeroProposta: "",
        numeroParcelas: "",
        banco: "",
        valor: "",
        tipo: "",
      });
      setComissaoCalculada(null);
    } catch (error) {
      toast.error("Erro ao criar proposta");
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Nova Proposta</CardTitle>
          <CardDescription>Preencha os dados da proposta para registrar no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numeroProposta">Número da Proposta</Label>
                <Input
                  id="numeroProposta"
                  type="text"
                  placeholder="Ex: PROP-001"
                  value={formData.numeroProposta}
                  onChange={(e) => setFormData({ ...formData, numeroProposta: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="numeroParcelas">Número de Parcelas</Label>
                <Input
                  id="numeroParcelas"
                  type="number"
                  placeholder="Ex: 60"
                  value={formData.numeroParcelas}
                  onChange={(e) => setFormData({ ...formData, numeroParcelas: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="Ex: 10000.00"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                required
              />
            </div>

            {comissaoCalculada !== null && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">Comissão Calculada</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  R$ {comissaoCalculada.toFixed(2)}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={createPropostaMutation.isPending}>
              {createPropostaMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Proposta"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
