# mcp-singstat-sg

SingStat Table Builder MCP — Department of Statistics Singapore.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1689+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Tools

| Tool | Description |
|------|-------------|
| `search_tables` | Search Singapore official statistics tables (Department of Statistics Singapore) by keyword. Returns resource ids and titles. The `id` of a result (e.g. "M810001") is the resourceId used by table_data and table_metadata. |
| `table_data` | Fetch the time-series data rows for a Singapore statistics table. Pass `resourceId` ONLY if you already have a real one from a prior search_tables/table_metadata call. Otherwise pass `search` with the topic in plain words (e.g. "resident unemployment rate", "gdp by industry") and this tool resolves the best-matching table itself — the response carries a `resolved` field naming exactly which table id and title were used, so NEVER guess or reuse an id you saw in an example; it is almost certainly for a different table. Data is returned under `Data` with a `row` array of series, each containing dated `columns`. Filter time periods with `timeFilter` (comma-separated periods like "2020,2021") or `between` (a from,to range like "2010,2020"); page with offset/limit. |
| `table_metadata` | Get the structure/metadata for a Singapore statistics table by resourceId (get ids from search_tables): theme, subject, frequency, period coverage and the list of variables/series. Result is under `Data.records`. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "singstat-sg": {
      "url": "https://gateway.pipeworx.io/singstat-sg/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/singstat-sg/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1689+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/singstat_sg_search_tables \
  -H 'Content-Type: application/json' \
  -d '{"keyword":"population"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/singstat_sg_search_tables`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "singstat-sg": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-singstat-sg"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-singstat-sg
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Singstat Sg data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
