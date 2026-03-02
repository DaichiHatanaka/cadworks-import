#!/usr/bin/env bash
# setup-claude-mcp.sh
#
# Merges MCP server config into Claude Desktop's claude_desktop_config.json.
# Supports macOS, Linux, and Windows (via Git Bash / WSL).
#
# Usage:
#   bash scripts/setup-claude-mcp.sh
#   NEON_API_KEY=your_key bash scripts/setup-claude-mcp.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXAMPLE_CONFIG="$REPO_ROOT/claude/claude_desktop_config.example.json"

# ─── 1. Detect Claude Desktop config directory ────────────────────────────────

detect_config_dir() {
  case "$(uname -s)" in
    Darwin)
      echo "$HOME/Library/Application Support/Claude"
      ;;
    Linux)
      # Check for WSL
      if grep -qi microsoft /proc/version 2>/dev/null; then
        WIN_APPDATA="$(cmd.exe /c "echo %APPDATA%" 2>/dev/null | tr -d '\r')"
        if [ -n "$WIN_APPDATA" ]; then
          echo "$(wslpath "$WIN_APPDATA")/Claude"
        else
          echo "$HOME/.config/Claude"
        fi
      else
        echo "$HOME/.config/Claude"
      fi
      ;;
    MINGW* | CYGWIN* | MSYS*)
      echo "$APPDATA/Claude"
      ;;
    *)
      echo "$HOME/.config/Claude"
      ;;
  esac
}

CONFIG_DIR="$(detect_config_dir)"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

echo "Claude Desktop config directory: $CONFIG_DIR"

# ─── 2. Check dependencies ────────────────────────────────────────────────────

if ! command -v node &>/dev/null; then
  echo "Error: Node.js is required but not found in PATH." >&2
  exit 1
fi

if [ ! -f "$EXAMPLE_CONFIG" ]; then
  echo "Error: Example config not found at $EXAMPLE_CONFIG" >&2
  exit 1
fi

# ─── 3. Read Neon API Key ─────────────────────────────────────────────────────

if [ -z "${NEON_API_KEY:-}" ]; then
  echo ""
  echo "Enter your Neon API Key (https://console.neon.tech → Account → API Keys)."
  echo "Leave blank to skip — you can edit the config manually later."
  read -r -s -p "NEON_API_KEY: " NEON_API_KEY
  echo ""
fi

# ─── 4. Backup existing config ────────────────────────────────────────────────

mkdir -p "$CONFIG_DIR"

if [ -f "$CONFIG_FILE" ]; then
  BACKUP="$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
  cp "$CONFIG_FILE" "$BACKUP"
  echo "Backed up existing config to: $BACKUP"
fi

# ─── 5. Merge MCP servers using Node.js ──────────────────────────────────────

node - <<EOF
const fs = require('fs');

const examplePath = ${JSON.stringify(EXAMPLE_CONFIG)};
const configPath = ${JSON.stringify(CONFIG_FILE)};
const neonApiKey = ${JSON.stringify(NEON_API_KEY)};

// Load template config
const example = JSON.parse(fs.readFileSync(examplePath, 'utf8'));

// Load or initialize existing config
let existing = { mcpServers: {} };
if (fs.existsSync(configPath)) {
  try {
    existing = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    console.error('Warning: Could not parse existing config — starting fresh.');
  }
}
if (!existing.mcpServers) existing.mcpServers = {};

// Merge strategy: template provides new entries, user's existing entries win.
const merged = {
  ...existing,
  mcpServers: {
    ...example.mcpServers,
    ...existing.mcpServers,
  },
};

// Apply NEON_API_KEY if provided
if (neonApiKey && merged.mcpServers.neon?.env) {
  merged.mcpServers.neon.env.NEON_API_KEY = neonApiKey;
}

fs.writeFileSync(configPath, JSON.stringify(merged, null, 2) + '\n');
console.log('MCP servers merged into: ' + configPath);
EOF

echo ""
echo "Done! Restart Claude Desktop to apply the new MCP configuration."
