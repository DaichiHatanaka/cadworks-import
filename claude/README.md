# Claude Desktop MCP Configuration

This directory contains a template for configuring Model Context Protocol (MCP)
servers used by this project with Claude Desktop.

## Quick Setup

Run the provided setup script to automatically configure Claude Desktop:

```bash
bash scripts/setup-claude-mcp.sh
```

The script will:

1. Detect your OS and find the Claude Desktop config directory
2. Back up your existing `claude_desktop_config.json`
3. Merge the MCP servers from this template into your config (existing entries are preserved)

## Manual Setup

1. Copy the template:

   ```bash
   cp claude/claude_desktop_config.example.json claude/claude_desktop_config.json
   ```

2. Edit `claude/claude_desktop_config.json`:
   - Replace `YOUR_NEON_API_KEY` with your key from https://console.neon.tech → Account → API Keys
   - Replace `/path/to/your/projects` with the absolute path to your projects directory

3. Copy to the Claude Desktop config location for your OS:

   **macOS:**

   ```bash
   cp claude/claude_desktop_config.json \
     "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
   ```

   **Linux:**

   ```bash
   cp claude/claude_desktop_config.json \
     "$HOME/.config/Claude/claude_desktop_config.json"
   ```

   **Windows (PowerShell):**

   ```powershell
   Copy-Item claude\claude_desktop_config.json `
     "$env:APPDATA\Claude\claude_desktop_config.json"
   ```

4. Restart Claude Desktop.

## MCP Servers

| Server       | Purpose                                                   |
| ------------ | --------------------------------------------------------- |
| `filesystem` | File system access for Claude to read/write project files |
| `neon`       | Database management, query execution, branch operations   |
| `vercel`     | Deployment management, environment variable configuration |
| `github`     | PR/Issue management, branch operations (requires OAuth)   |
| `context7`   | Fetch latest library documentation                        |
| `playwright` | E2E testing and browser automation                        |

## Security Notes

- `claude/claude_desktop_config.json` is in `.gitignore` — **never commit it**
- The `NEON_API_KEY` grants full access to your Neon account — treat it like a password
- The `filesystem` server path should be limited to your projects directory, not `/` or `$HOME`
