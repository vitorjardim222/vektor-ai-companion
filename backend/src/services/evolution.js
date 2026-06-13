// VEKTOR A.I — Evolution API client (thin wrapper)
// Docs: https://doc.evolution-api.com/
const BASE = (process.env.EVOLUTION_API_URL || "").replace(/\/+$/, "");
const KEY = process.env.EVOLUTION_API_KEY || "";

export class EvolutionError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function evolutionConfigured() {
  return !!BASE && !!KEY;
}

async function call(method, path, body) {
  if (!evolutionConfigured()) {
    throw new EvolutionError(503, "evolution_not_configured", null);
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new EvolutionError(res.status, `evolution_http_${res.status}`, data);
  return data;
}

/**
 * Evolution session = "instance". We use the DB id as instanceName (prefixed)
 * so it's stable and tenant-scoped.
 */
export const evolution = {
  configured: evolutionConfigured,

  async createInstance({ instanceName, webhookUrl }) {
    return call("POST", "/instance/create", {
      instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      webhook: webhookUrl
        ? {
            url: webhookUrl,
            enabled: true,
            events: [
              "QRCODE_UPDATED",
              "CONNECTION_UPDATE",
              "MESSAGES_UPSERT",
              "MESSAGES_UPDATE",
              "SEND_MESSAGE",
              "PRESENCE_UPDATE",
            ],
          }
        : undefined,
    });
  },

  async connect(instanceName) {
    return call("GET", `/instance/connect/${encodeURIComponent(instanceName)}`);
  },

  async status(instanceName) {
    return call("GET", `/instance/connectionState/${encodeURIComponent(instanceName)}`);
  },

  async logout(instanceName) {
    return call("DELETE", `/instance/logout/${encodeURIComponent(instanceName)}`);
  },

  async deleteInstance(instanceName) {
    return call("DELETE", `/instance/delete/${encodeURIComponent(instanceName)}`);
  },

  async fetchInstance(instanceName) {
    return call("GET", `/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`);
  },
};
