// Worker entry point — routes MCP and download requests
export { PDFMcpAgent } from "./mcp-server";
import { PDFMcpAgent } from "./mcp-server";
import { handleDownload } from "./storage/r2";
import type { Env } from "./mcp-server";

const mcpHandler = PDFMcpAgent.serve("/mcp");

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/download/")) {
      const key = decodeURIComponent(url.pathname.slice("/download/".length));
      if (!key) {
        return new Response("Missing key", { status: 400 });
      }
      return handleDownload(env.PDF_BUCKET, key);
    }

    // Fall through to MCP agent handler
    return mcpHandler.fetch(request, env, ctx);
  },
};

