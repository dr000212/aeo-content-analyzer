export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Category =
  | "Technical SEO"
  | "On-Page SEO"
  | "Links"
  | "Performance"
  | "Structure"
  | "Schema"
  | "Entity"
  | "Readability";
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

export interface GEOResult {
  score: number;
  structure: ModuleResult;
  schema_markup: ModuleResult;
  entity: ModuleResult;
  readability: ModuleResult;
  checks: Check[];
  recommendations: Recommendation[];
}

export interface PageMeta {
  url: string;
  title: string | null;
  title_length: number;
  word_count: number;
  heading_count: number;
  image_count: number;
  images_without_alt: number;
  link_count: number;
  internal_link_count: number;
  external_link_count: number;
  broken_link_count: number;
  schema_types: string[];
  has_meta_description: boolean;
  meta_description_length: number;
  is_https: boolean;
  has_viewport: boolean;
  has_canonical: boolean;
  has_robots_txt: boolean;
  html_size_kb: number;
  load_time_ms: number;
  has_compression: boolean;
  render_blocking_scripts: number;
  render_blocking_styles: number;
}

export interface AnalyzeResponse {
  url: string;
  overall_score: number;
  grade: string;
  // 5 pillars
  technical_seo: ModuleResult;
  onpage_seo: ModuleResult;
  link_analysis: ModuleResult;
  performance: ModuleResult;
  geo_readiness: GEOResult;
  // Aggregated
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
