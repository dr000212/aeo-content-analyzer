export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Category = "Structure" | "Schema" | "Entity" | "Readability";
export type Effort = "Low" | "Medium" | "High";

export interface Check {
  id: string;
  passed: boolean;
  text: string;
  impact: string;
  category: Category;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  impact_score: number;
  effort: Effort;
}

export interface AIRecommendation {
  title: string;
  description: string;
  category: Category;
  suggested_rewrite: string | null;
  code_snippet: string | null;
}

export interface ModuleResult {
  score: number;
  checks: Check[];
  recommendations: Recommendation[];
  details: Record<string, unknown>;
}

export interface PageMeta {
  url: string;
  title: string | null;
  word_count: number;
  heading_count: number;
  image_count: number;
  link_count: number;
  schema_types: string[];
  has_meta_description: boolean;
  meta_description_length: number;
}

export interface AnalyzeResponse {
  url: string;
  overall_score: number;
  grade: string;
  structure: ModuleResult;
  schema_markup: ModuleResult;
  entity: ModuleResult;
  readability: ModuleResult;
  checks: Check[];
  recommendations: Recommendation[];
  ai_recommendations: AIRecommendation[];
  ai_enhanced: boolean;
  meta: PageMeta;
  analysis_time_ms: number;
  cached: boolean;
}

export interface AnalyzeRequest {
  url: string;
  options: {
    deep_entity_analysis: boolean;
    include_ai_recommendations: boolean;
  };
}
