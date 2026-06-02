interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * SingStat Table Builder MCP — Department of Statistics Singapore.
 *
 * Keyless public API (https://tablebuilder.singstat.gov.sg/api/table).
 * All responses wrap their payload under a top-level `Data` key.
 *
 * Typical flow:
 *   1. search_tables(keyword) → resourceIds (the `id` field, e.g. "M810001") + titles.
 *   2. table_data(resourceId) → the actual time-series rows. Filter periods with
 *      `timeFilter` (comma-separated periods) or `between` (from,to range); page with
 *      offset/limit.
 *   3. table_metadata(resourceId) → variable/series structure for a table.
 */


const BASE = 'https://tablebuilder.singstat.gov.sg/api/table';
const UA = 'pipeworx-mcp-singstat-sg/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_tables',
    description:
      'Search Singapore official statistics tables (Department of Statistics Singapore) by keyword. ' +
      'Returns resource ids and titles. The `id` of a result (e.g. "M810001") is the resourceId used by table_data and table_metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Search term, e.g. "population", "gdp", "cpi".' },
        searchOption: {
          type: 'string',
          enum: ['all', 'title', 'variable'],
          description: 'Where to match the keyword. "all" (default) searches everything, "title" only table titles, "variable" only variable names.',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'table_data',
    description:
      'Fetch the time-series data rows for a Singapore statistics table by resourceId (get ids from search_tables). ' +
      'Data is returned under `Data` with a `row` array of series, each containing dated `columns`. ' +
      'Filter time periods with `timeFilter` (comma-separated periods like "2020,2021") or `between` (a from,to range like "2010,2020"); page with offset/limit.',
    inputSchema: {
      type: 'object',
      properties: {
        resourceId: { type: 'string', description: 'Table id from search_tables, e.g. "M810001".' },
        offset: { type: 'integer', description: 'Number of rows to skip (pagination).' },
        limit: { type: 'integer', description: 'Max number of rows to return.' },
        timeFilter: { type: 'string', description: 'Comma-separated specific periods to return, e.g. "2020,2021,2022".' },
        between: { type: 'string', description: 'Inclusive period range "from,to", e.g. "2010,2020".' },
        sortBy: { type: 'string', description: 'Sort expression, e.g. "rowtext asc".' },
        seriesNoORrowNo: { type: 'string', description: 'Comma-separated series/row numbers to limit which series are returned.' },
      },
      required: ['resourceId'],
    },
  },
  {
    name: 'table_metadata',
    description:
      'Get the structure/metadata for a Singapore statistics table by resourceId (get ids from search_tables): theme, subject, frequency, period coverage and the list of variables/series. Result is under `Data.records`.',
    inputSchema: {
      type: 'object',
      properties: {
        resourceId: { type: 'string', description: 'Table id from search_tables, e.g. "M810001".' },
      },
      required: ['resourceId'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_tables': {
      const keyword = reqStr(args, 'keyword', '"population"');
      const qs = new URLSearchParams({ keyword });
      const searchOption = args.searchOption;
      if (typeof searchOption === 'string' && searchOption.trim()) qs.set('searchOption', searchOption);
      else qs.set('searchOption', 'all');
      return singstatGet(`/resourceid?${qs.toString()}`);
    }
    case 'table_data': {
      const resourceId = reqStr(args, 'resourceId', '"M810001"');
      const qs = new URLSearchParams();
      for (const key of ['offset', 'limit', 'timeFilter', 'between', 'sortBy', 'seriesNoORrowNo'] as const) {
        const v = args[key];
        if (v !== undefined && v !== null && String(v).trim() !== '') qs.set(key, String(v));
      }
      const suffix = qs.toString();
      return singstatGet(`/tabledata/${encodeURIComponent(resourceId)}${suffix ? `?${suffix}` : ''}`);
    }
    case 'table_metadata': {
      const resourceId = reqStr(args, 'resourceId', '"M810001"');
      return singstatGet(`/metadata/${encodeURIComponent(resourceId)}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function singstatGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`SingStat: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
