// VEKTOR A.I — Backend entrypoint (placeholder).
// Replace with Fastify bootstrap in phase 2.
import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4000);

createServer((_req, res) => {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ service: "vektor-backend", status: "scaffold" }));
}).listen(port, () => {
  console.log(`[vektor-backend] listening on :${port}`);
});
