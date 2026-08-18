import {
  Listing,
  Finding,
  CoverageReport,
  ScanReport,
  Thresholds,
  DEFAULT_THRESHOLDS,
  Verdict,
} from "./types.js";

export class Scanner {
  private thresholds: Thresholds;

  constructor(thresholds: Partial<Thresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  public scan(listings: Listing[]): ScanReport {
    const coverage = this.computeCoverage(listings);
    const findings: Finding[] = [];

    if (listings.length === 0) {
      return {
        verdict: "clear",
        summary: { info: 0, warn: 0, high: 0 },
        coverage,
        findings: [],
        scanned_at: new Date().toISOString(),
        engine_version: "boardcheck-edge/1.0.0",
      };
    }

    // AMS-001: view_application_inversion
    this.checkViewApplicationInversion(listings, findings);

    // AMS-002: batch_creation_clustering
    this.checkBatchCreationClustering(listings, findings);

    // AMS-003: self_advertisement_ratio
    this.checkSelfAdvertisementRatio(listings, findings);

    // AMS-004: unpaid_work_risk
    this.checkUnpaidWorkRisk(listings, findings);

    // AMS-005: high_budget_bait
    this.checkHighBudgetBait(listings, findings);

    const summary = {
      info: findings.filter((f) => f.severity === "info").length,
      warn: findings.filter((f) => f.severity === "warn").length,
      high: findings.filter((f) => f.severity === "high").length,
    };

    let verdict: Verdict = "clear";
    if (summary.high > 0) {
      verdict = "high_risk";
    } else if (summary.warn > 0) {
      verdict = "caution";
    }

    return {
      verdict,
      summary,
      coverage,
      findings,
      scanned_at: new Date().toISOString(),
      engine_version: "boardcheck-edge/1.0.0",
    };
  }

  private computeCoverage(listings: Listing[]): CoverageReport {
    return {
      total_listings: listings.length,
      with_views: listings.filter((l) => typeof l.views === "number").length,
      with_applications: listings.filter((l) => typeof l.applications === "number").length,
      with_created_at: listings.filter((l) => l.created_at !== undefined).length,
      with_budget: listings.filter((l) => typeof l.budget === "number").length,
      with_escrow_info: listings.filter((l) => typeof l.has_escrow === "boolean").length,
      with_self_ad_flag: listings.filter((l) => typeof l.is_self_advertisement === "boolean").length,
    };
  }

  /**
   * AMS-001: view_application_inversion
   * Fires when applications exceed views (e.g. applications > 0 with views == 0).
   */
  private checkViewApplicationInversion(listings: Listing[], findings: Finding[]): void {
    const invertedListings: string[] = [];

    for (const l of listings) {
      if (typeof l.views === "number" && typeof l.applications === "number") {
        if (l.applications > l.views) {
          invertedListings.push(l.id);
        }
      }
    }

    if (invertedListings.length > 0) {
      const isExtreme = invertedListings.some((id) => {
        const item = listings.find((l) => l.id === id);
        return item && (item.views ?? 0) === 0 && (item.applications ?? 0) > 0;
      });

      findings.push({
        id: "AMS-001",
        indicator: "view_application_inversion",
        severity: isExtreme ? "high" : "warn",
        detail: `${invertedListings.length} listing(s) have more reported applications than views (e.g. applications > 0 with 0 views), which is mathematically implausible and indicative of fabricated engagement metrics.`,
        affected_listing_ids: invertedListings,
      });
    }
  }

  /**
   * AMS-002: batch_creation_clustering
   * Detects artificial seeding where multiple listings share exact timestamps.
   */
  private checkBatchCreationClustering(listings: Listing[], findings: Finding[]): void {
    const timestampCounts: Map<number, string[]> = new Map();

    for (const l of listings) {
      if (l.created_at) {
        const d = new Date(l.created_at);
        if (!isNaN(d.getTime())) {
          // Normalize to second
          const sec = Math.floor(d.getTime() / (this.thresholds.clusterWindowSeconds * 1000));
          const list = timestampCounts.get(sec) || [];
          list.push(l.id);
          timestampCounts.set(sec, list);
        }
      }
    }

    const clusteredIds: string[] = [];
    for (const [, ids] of timestampCounts.entries()) {
      if (ids.length >= this.thresholds.minClusterSize) {
        clusteredIds.push(...ids);
      }
    }

    if (clusteredIds.length > 0) {
      findings.push({
        id: "AMS-002",
        indicator: "batch_creation_clustering",
        severity: "high",
        detail: `${clusteredIds.length} listings were created within tight automated bursts (${this.thresholds.minClusterSize}+ listings per ${this.thresholds.clusterWindowSeconds}s window), characteristic of automated batch seeding rather than organic job posting.`,
        affected_listing_ids: clusteredIds,
      });
    }
  }

  /**
   * AMS-003: self_advertisement_ratio
   * Detects boards dominated by agents marketing their own services as fake demand.
   */
  private checkSelfAdvertisementRatio(listings: Listing[], findings: Finding[]): void {
    const withFlag = listings.filter((l) => typeof l.is_self_advertisement === "boolean");
    if (withFlag.length < 3) return;

    const selfAds = withFlag.filter((l) => l.is_self_advertisement === true);
    const ratio = selfAds.length / withFlag.length;

    if (ratio >= this.thresholds.selfAdRatioCutoff) {
      findings.push({
        id: "AMS-003",
        indicator: "self_advertisement_ratio",
        severity: ratio >= 0.8 ? "high" : "warn",
        detail: `${(ratio * 100).toFixed(1)}% of listings are self-advertisements by agents selling services rather than actual paying buyer demand.`,
        affected_listing_ids: selfAds.map((l) => l.id),
      });
    }
  }

  /**
   * AMS-004: unpaid_work_risk
   * Flags priced tasks that require labor delivery with zero escrow or payment proof.
   */
  private checkUnpaidWorkRisk(listings: Listing[], findings: Finding[]): void {
    const riskyListings: string[] = [];

    for (const l of listings) {
      const hasPrice = typeof l.budget === "number" && l.budget > 0;
      const noEscrow = l.has_escrow === false;
      const noEvidence = l.has_payment_evidence === false;

      if (hasPrice && noEscrow && noEvidence) {
        riskyListings.push(l.id);
      }
    }

    if (riskyListings.length > 0) {
      findings.push({
        id: "AMS-004",
        indicator: "unpaid_work_risk",
        severity: "high",
        detail: `${riskyListings.length} listing(s) offer paid compensation with zero escrow backing and no verifiable payment proof. Agents delivering work risk complete non-payment.`,
        affected_listing_ids: riskyListings,
      });
    }
  }

  /**
   * AMS-005: high_budget_bait
   * Flags outlier budgets far above platform median that have suspiciously low views.
   */
  private checkHighBudgetBait(listings: Listing[], findings: Finding[]): void {
    const withBudget = listings.filter((l) => typeof l.budget === "number" && l.budget > 0);
    if (withBudget.length < this.thresholds.minListingsForMedian) return;

    const sortedBudgets = [...withBudget].map((l) => l.budget as number).sort((a, b) => a - b);
    const mid = Math.floor(sortedBudgets.length / 2);
    const medianBudget =
      sortedBudgets.length % 2 !== 0
        ? sortedBudgets[mid]
        : (sortedBudgets[mid - 1] + sortedBudgets[mid]) / 2;

    const baitCutoff = medianBudget * this.thresholds.highBudgetMultiplier;
    const baitListings: string[] = [];

    for (const l of withBudget) {
      if ((l.budget ?? 0) >= baitCutoff && (l.views ?? 0) === 0) {
        baitListings.push(l.id);
      }
    }

    if (baitListings.length > 0) {
      findings.push({
        id: "AMS-005",
        indicator: "high_budget_bait",
        severity: "warn",
        detail: `${baitListings.length} listing(s) advertise budgets significantly above the median ($${medianBudget.toFixed(2)}) with zero views, a common signature of fake high-value bait designed to capture agent bids.`,
        affected_listing_ids: baitListings,
      });
    }
  }
}

export function scanListings(listings: Listing[], thresholds?: Partial<Thresholds>): ScanReport {
  const scanner = new Scanner(thresholds);
  return scanner.scan(listings);
}
