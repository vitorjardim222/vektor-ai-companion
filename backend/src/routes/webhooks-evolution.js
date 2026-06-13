// VEKTOR A.I — Evolution API webhook receiver
// Persists events only (no AI / automation processing in this phase).
import { prisma } from "../prisma.js";
import { whatsappService } from "../services/whatsapp.js";

function mapState(state) {
  const s = String(state || "").toLowerCase();
  if (s === "open" || s === "connected") return "CONNECTED";
  if (s === "connecting") return "CONNECTING";
  if (s === "close" || s === "closed" || s === "disconnected" || s === "logout") return "DISCONNECTED";
  return null;
}

export default async function evolutionWebhookRoutes(fastify) {
  // No auth middleware — Evolution calls us. Tenant ID is in the URL.
  fastify.post("/webhooks/evolution/:orgId", async (request, reply) => {
    const { orgId } = request.params;
    const body = request.body ?? {};
    const event = body.event || body.type || "unknown";
    const instanceName = body.instance || body.instanceName || body?.data?.instance || null;

    let session = null;
    if (instanceName) {
      session = await prisma.whatsAppSession.findFirst({
        where: { organizationId: orgId, evolutionSessionId: instanceName },
      });
    }

    await whatsappService.recordEvent({
      organizationId: orgId,
      sessionId: session?.id,
      type: String(event),
      payload: body,
    });

    if (session) {
      const data = {};
      if (event === "QRCODE_UPDATED" || event === "qrcode.updated") {
        const qr = body?.data?.qrcode?.base64 || body?.qrcode?.base64 || body?.qrcode || null;
        if (qr) { data.qrCode = qr; data.status = "QR"; }
      }
      if (event === "CONNECTION_UPDATE" || event === "connection.update") {
        const mapped = mapState(body?.data?.state || body?.state);
        if (mapped) {
          data.status = mapped;
          if (mapped === "CONNECTED") {
            data.lastConnectionAt = new Date();
            data.qrCode = null;
          }
        }
        const phone = body?.data?.wuid || body?.data?.phoneNumber || null;
        if (phone && !session.phoneNumber) data.phoneNumber = String(phone).split("@")[0];
      }
      if (event === "MESSAGES_UPSERT" || event === "messages.upsert" || event === "SEND_MESSAGE") {
        data.lastMessageAt = new Date();
      }
      if (Object.keys(data).length > 0) {
        await prisma.whatsAppSession.update({ where: { id: session.id }, data });
      }
    }

    return reply.code(200).send({ ok: true });
  });
}
