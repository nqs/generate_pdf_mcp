// Worker entry point — routes MCP requests to the PDFMcpAgent Durable Object
export { PDFMcpAgent } from "./mcp-server";
import { PDFMcpAgent } from "./mcp-server";

export default PDFMcpAgent.serve("/mcp");

