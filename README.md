# mcp-singstat-sg

SingStat Table Builder MCP — Department of Statistics Singapore.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_tables` | Search Singapore official statistics tables (Department of Statistics Singapore) by keyword. Returns resource ids and titles. The `id` of a result (e.g. "M810001") is the resourceId used by table_data and table_metadata. |
| `table_data` | Fetch the time-series data rows for a Singapore statistics table by resourceId (get ids from search_tables). Data is returned under `Data` with a `row` array of series, each containing dated `columns`. Filter time periods with `timeFilter` (comma-separated periods like "2020,2021") or `between` (a from,to range like "2010,2020"); page with offset/limit. |
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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Singstat Sg data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
