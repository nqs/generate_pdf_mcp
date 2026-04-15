import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export interface Env {
  PDF_BUCKET: R2Bucket;
  PDF_MCP: DurableObjectNamespace;
}

export interface PDFMcpState {
  documentsGenerated: number;
}

export class PDFMcpAgent extends McpAgent<Env, PDFMcpState> {
  server = new McpServer({
    name: "pdf-mcp-server",
    version: "1.0.0",
  });

  initialState: PDFMcpState = {
    documentsGenerated: 0,
  };

  async init(): Promise<void> {
    // Placeholder tool — will be replaced with generate_pdf in a later task
    this.server.registerTool(
      "ping",
      {
        description: "Health check — confirms the PDF MCP server is running",
        inputSchema: {
          message: z.string().optional().describe("Optional echo message"),
        },
      },
      async ({ message }) => ({
        content: [
          {
            type: "text" as const,
            text: message ? `pong: ${message}` : "pong",
          },
        ],
      })
    );
  }
}

