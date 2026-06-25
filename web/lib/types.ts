
export interface Entity {
  name: string;
  type: string;
}

export interface ExtractResponse {
  success: boolean;
  entities: Entity[];
}

export interface KgQueryResult {
  nodes: Array<{ id: string; label: string; properties: Record<string, any> }>;
  edges: Array<{ source: string; target: string; type: string }>;
}

export interface Citation {
  id: string;
  text: string;
  source: string;
  score?: number;
}

export interface RagResponse {
  answer: string;
  citations: Citation[];
  confidence: number;
}