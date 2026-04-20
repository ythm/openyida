<div align="center">

# @openyida/mcp-app

**Interactive UIs for Yida low-code platform — renders inline in Claude, ChatGPT, VS Code and other MCP hosts.**

[![npm version](https://img.shields.io/npm/v/@openyida/mcp-app?color=brightgreen)](https://www.npmjs.com/package/@openyida/mcp-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Node.js ≥18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

</div>

---

## What is this?

`@openyida/mcp-app` is an [MCP Apps](https://github.com/modelcontextprotocol/ext-apps) server that brings **interactive UIs** for [Yida (宜搭)](https://www.aliwork.com) low-code platform directly into AI chat conversations.

Instead of getting plain text responses, you see:

- 📱 **App Dashboard** — card-style application list with icons and links
- 📊 **Report Charts** — interactive Bar / Line / Pie charts with click-to-switch
- 📋 **Form Preview** — visual schema preview with field types and IDs

## Quick Start

### Use with Claude Desktop / VS Code / ChatGPT

Add to your MCP client config:

```json
{
  "mcpServers": {
    "openyida": {
      "command": "npx",
      "args": ["-y", "@openyida/mcp-app", "--stdio"]
    }
  }
}
```

### Use with HTTP transport

```bash
npx @openyida/mcp-app
# Server listening on http://localhost:3001/mcp
```

## Prerequisites

- **Node.js ≥ 18**
- **openyida** CLI installed (`npm install -g openyida`) — needed for authentication

Before using MCP tools, log in to Yida:

```bash
openyida login
```

## Available Tools

| Tool | Description | Interactive UI |
|------|-------------|----------------|
| `yida_list_apps` | List all Yida applications | ✅ App Dashboard |
| `yida_create_app` | Create a new application | — |
| `yida_get_schema` | Get form schema & field IDs | ✅ Form Preview |
| `yida_create_form` | Create a form with fields | — |
| `yida_query_data` | Query form data instances | — |
| `yida_create_instance` | Create a form data record | — |
| `yida_query_report` | Query data for chart visualization | ✅ Report Chart |
| `yida_create_report` | Create a Yida report | — |
| `yida_login_status` | Check login status | — |
| `yida_login` | Trigger login flow | — |

## Development

```bash
cd mcp-app
npm install
npm run dev     # Watch mode (views + server)
npm run build   # Production build
```

## License

MIT — see [LICENSE](../LICENSE)
