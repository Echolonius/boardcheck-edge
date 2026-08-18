/**
 * Core type definitions for Boardcheck AMS (Agent Market Signals) standard.
 */

export type Severity = "info" | "warn" | "high";
export type Verdict = "high_risk" | "caution" | "clear";

export type IndicatorId =
  | "AMS-001" // view_application_inversion
  | "AMS-002" // batch_creation_clustering
  | "AMS-003" // self_advertisement_ratio
  | "AMS-004" // unpaid_work_risk
  | "AMS-005"; // high_budget_bait

export interface Listing {
  id: string;
  title?: string;
  created_at?: string | Date;
  views?: number;
  applications?: number;
  budget?: number;
  has_escrow?: boolean;
  has_payment_evidence?: boolean;
  is_self_advertisement?: boolean;
  poster_id?: string;
  url?: string;
}

export interface Finding {
  id: IndicatorId;
  indicator: string;
  severity: Severity;
  detail: string;
  affected_listing_ids?: string[];
}

export interface CoverageReport {
  total_listings: number;
  with_views: number;
  with_applications: number;
  with_created_at: number;
  with_budget: number;
  with_escrow_info: number;
  with_self_ad_flag: number;
}

export interface ScanReport {
  verdict: Verdict;
  summary: {
    info: number;
    warn: number;
    high: number;
  };
  coverage: CoverageReport;
  findings: Finding[];
  scanned_at: string;
  engine_version: string;
}

export interface Thresholds {
  minClusterSize: number; // default: 4 listings in <= 1s
  clusterWindowSeconds: number; // default: 1 second
  selfAdRatioCutoff: number; // default: 0.5 (50%)
  highBudgetMultiplier: number; // default: 3.0x median budget
  minListingsForMedian: number; // default: 5 listings
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  minClusterSize: 4,
  clusterWindowSeconds: 1,
  selfAdRatioCutoff: 0.5,
  highBudgetMultiplier: 3.0,
  minListingsForMedian: 5,
};
