// VEKTOR A.I — Analytics API (mock aggregation, tenant isolated)
import { prisma } from "../prisma.js";

async function assertMembership(request, reply, organizationId) {
  const userId = request.user.sub;
  const m = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
  if (!m) {
    reply.code(403).send({ error: "forbidden" });
    return null;
  }
  return m;
}

function daysRange(days = 30) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default async function analyticsRoutes(fastify) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/organizations/:orgId/analytics/overview", async (request, reply) => {
    const { orgId } = request.params;
    if (!(await assertMembership(request, reply, orgId))) return;
    const rnd = seededRandom(orgId.length || 7);

    const days = daysRange(30);
    const messagesPerDay = days.map((date) => ({
      date,
      enviadas: Math.floor(rnd() * 400) + 120,
      recebidas: Math.floor(rnd() * 350) + 100,
    }));

    return {
      kpis: {
        mensagensTotal: messagesPerDay.reduce((a, b) => a + b.enviadas + b.recebidas, 0),
        taxaResolucaoIA: 0.78,
        taxaHandoffHumano: 0.22,
        conversaoLeads: 0.34,
        receitaMensal: 48230.5,
        cobrancasVencidas: 12,
        renovacoesIptv: 87,
        sessoesWhatsappAtivas: 4,
        sucessoAutomacoes: 0.92,
      },
      messagesPerDay,
      leadsBySource: [
        { source: "WhatsApp", value: 412 },
        { source: "Instagram", value: 198 },
        { source: "Site", value: 156 },
        { source: "Indicação", value: 89 },
        { source: "Outros", value: 44 },
      ],
      funnel: [
        { stage: "Novo", value: 820 },
        { stage: "Qualificado", value: 540 },
        { stage: "Proposta", value: 310 },
        { stage: "Negociação", value: 180 },
        { stage: "Fechado", value: 124 },
      ],
      revenueMonthly: [
        { month: "Jan", value: 28100 },
        { month: "Fev", value: 31200 },
        { month: "Mar", value: 33980 },
        { month: "Abr", value: 36500 },
        { month: "Mai", value: 41250 },
        { month: "Jun", value: 48230 },
      ],
      overdueBilling: days.slice(-14).map((date) => ({
        date,
        value: Math.floor(rnd() * 8) + 1,
      })),
      iptvRenewals: days.slice(-14).map((date) => ({
        date,
        renovados: Math.floor(rnd() * 12) + 2,
        vencidos: Math.floor(rnd() * 5),
      })),
      agentPerformance: [
        { name: "Ana Souza", atendimentos: 184, resolucao: 0.91 },
        { name: "Bruno Lima", atendimentos: 142, resolucao: 0.84 },
        { name: "Carla Dias", atendimentos: 121, resolucao: 0.79 },
        { name: "Diego Reis", atendimentos: 98, resolucao: 0.73 },
      ],
      poolPerformance: [
        { name: "Pool Comercial", conversas: 432, sucesso: 0.88 },
        { name: "Pool Suporte", conversas: 318, sucesso: 0.82 },
        { name: "Pool Cobrança", conversas: 256, sucesso: 0.76 },
      ],
      aiProviderUsage: [
        { provider: "OpenAI", tokens: 1240000, cost: 312.4 },
        { provider: "Anthropic", tokens: 820000, cost: 245.1 },
        { provider: "Gemini", tokens: 410000, cost: 98.7 },
        { provider: "Groq", tokens: 220000, cost: 18.2 },
      ],
      whatsappSessions: [
        { name: "Comercial-01", status: "online", uptime: 0.998 },
        { name: "Suporte-01", status: "online", uptime: 0.991 },
        { name: "Cobrança-01", status: "degraded", uptime: 0.872 },
        { name: "Vendas-02", status: "offline", uptime: 0.0 },
      ],
    };
  });
}
