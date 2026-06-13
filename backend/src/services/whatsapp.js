// VEKTOR A.I — WhatsApp session service (DB + Evolution orchestration)
import { prisma } from "../prisma.js";
import { evolution, EvolutionError } from "./evolution.js";

function mapEvolutionState(state) {
  if (!state) return "DISCONNECTED";
  const s = String(state).toLowerCase();
  if (s === "open" || s === "connected") return "CONNECTED";
  if (s === "connecting" || s === "qr" || s === "qrcode") return "CONNECTING";
  if (s === "close" || s === "closed" || s === "disconnected" || s === "logout") return "DISCONNECTED";
  return "ERROR";
}

function instanceNameFor(session) {
  return session.evolutionSessionId || `vk_${session.id}`;
}

function webhookUrl(orgId) {
  const base = (process.env.APP_URL || process.env.BACKEND_URL || "").replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/api/webhooks/evolution/${orgId}`;
}

export const whatsappService = {
  async list(organizationId) {
    return prisma.whatsAppSession.findMany({
      where: { organizationId, active: true },
      orderBy: [{ createdAt: "desc" }],
    });
  },

  async create(organizationId, input) {
    const session = await prisma.whatsAppSession.create({
      data: {
        organizationId,
        name: input.name,
        phoneNumber: input.phoneNumber ?? null,
        autoReconnect: input.autoReconnect ?? true,
        assignedPoolId: input.assignedPoolId ?? null,
        assignedHumanId: input.assignedHumanId ?? null,
        status: "DISCONNECTED",
      },
    });
    const instanceName = instanceNameFor(session);
    if (evolution.configured()) {
      try {
        const created = await evolution.createInstance({
          instanceName,
          webhookUrl: webhookUrl(organizationId),
        });
        const qr = created?.qrcode?.base64 || created?.qrcode || null;
        return prisma.whatsAppSession.update({
          where: { id: session.id },
          data: {
            evolutionSessionId: instanceName,
            status: qr ? "QR" : "CONNECTING",
            qrCode: qr,
          },
        });
      } catch (err) {
        return prisma.whatsAppSession.update({
          where: { id: session.id },
          data: {
            status: "ERROR",
            evolutionSessionId: instanceName,
          },
        });
      }
    }
    return prisma.whatsAppSession.update({
      where: { id: session.id },
      data: { evolutionSessionId: instanceName },
    });
  },

  async qrCode(session) {
    if (!evolution.configured()) {
      return { qrCode: session.qrCode, status: session.status, configured: false };
    }
    const instanceName = instanceNameFor(session);
    try {
      const data = await evolution.connect(instanceName);
      const qr = data?.base64 || data?.qrcode?.base64 || data?.code || null;
      const updated = await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: { qrCode: qr, status: qr ? "QR" : "CONNECTING" },
      });
      return { qrCode: updated.qrCode, status: updated.status, configured: true };
    } catch (err) {
      if (err instanceof EvolutionError) {
        return { qrCode: null, status: "ERROR", error: err.message, configured: true };
      }
      throw err;
    }
  },

  async refreshStatus(session) {
    if (!evolution.configured()) return session;
    const instanceName = instanceNameFor(session);
    try {
      const data = await evolution.status(instanceName);
      const state = data?.instance?.state || data?.state || data?.status;
      const mapped = mapEvolutionState(state);
      return prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          status: mapped,
          lastConnectionAt: mapped === "CONNECTED" ? new Date() : session.lastConnectionAt,
        },
      });
    } catch {
      return session;
    }
  },

  async disconnect(session) {
    if (evolution.configured()) {
      try { await evolution.logout(instanceNameFor(session)); } catch {}
    }
    return prisma.whatsAppSession.update({
      where: { id: session.id },
      data: { status: "DISCONNECTED", qrCode: null },
    });
  },

  async reconnect(session) {
    return this.qrCode(session);
  },

  async remove(session) {
    if (evolution.configured()) {
      try { await evolution.deleteInstance(instanceNameFor(session)); } catch {}
    }
    await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: { active: false, status: "DISCONNECTED", qrCode: null },
    });
    return { deleted: true };
  },

  async recordEvent({ organizationId, sessionId, type, payload }) {
    return prisma.whatsAppEvent.create({
      data: { organizationId, sessionId: sessionId ?? null, type, payload: payload ?? {} },
    });
  },
};
