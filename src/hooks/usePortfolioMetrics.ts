import { useMemo } from "react";
import type { Cabinet } from "@/types/cabinet";
import { 
  FOP_LIMITS, 
  getFopLimitPercent, 
  getLimitSeverity,
  portfolioChartColors,
  typeLabels,
  generatePortfolioInsights,
  type PortfolioRiskItem,
  type PortfolioDeadline,
  type PortfolioCabinetRank,
  type PortfolioChartDataPoint,
  type PortfolioTypeDistribution,
  type PortfolioInsight,
} from "@/config/portfolioAnalyticsConfig";
import { demoReports } from "@/config/reportsConfig";
import { demoTaxPayments, demoSalaryPayments, taxTypeConfig, salaryTypeConfig } from "@/config/paymentsConfig";
import { demoAudits } from "@/config/taxAuditsConfig";
import { AlertTriangle, Calendar, ShieldAlert, FileSearch, Wallet, FileCheck, Database } from "lucide-react";
import type { HealthScore, HealthScoreCategory, HealthScoreFactor } from "@/components/analytics/HealthScoreCard";

// Re-export types for external use
export type { HealthScore, HealthScoreCategory, HealthScoreFactor };

// Tax breakdown with ratios (Tax Burden Ratio)
export interface TaxBreakdown {
  ep: { amount: number; label: string };
  esv: { amount: number; label: string };
  pdfo: { amount: number; label: string };
  military: { amount: number; label: string };
  total: number;
  percentOfIncome: number; // Tax Burden Ratio
}

// Salary breakdown with context (Labor Cost Ratio)
export interface SalaryBreakdown {
  salary: { amount: number; count: number };
  civil: { amount: number; count: number };
  bonus: { amount: number };
  total: number;
  employeeCount: number;
  percentOfIncome: number; // Labor Cost Ratio
  avgPerEmployee: number;
}

// Nearest deadline with context
export interface NearestDeadline {
  daysLeft: number;
  label: string;
  cabinetName: string;
  type: string;
}

// Audits breakdown with status
export interface AuditsBreakdown {
  total: number;
  responseRequired: number;
  inProgress: number;
  announced: number;
}

// Cabinet-level tax breakdown
export interface CabinetTaxBreakdown {
  cabinetId: string;
  cabinetName: string;
  cabinetType: string;
  total: number;
  breakdown: {
    ep: number;
    esv: number;
    pdfo: number;
    military: number;
  };
  percentOfTotal: number;      // % від загальної суми податків
  percentOfCabinetIncome: number; // Tax Burden Ratio для цього кабінету
}

// Cabinet-level salary breakdown
export interface CabinetSalaryBreakdown {
  cabinetId: string;
  cabinetName: string;
  cabinetType: string;
  total: number;
  employeeCount: number;
  breakdown: {
    salary: { amount: number; count: number };
    civil: { amount: number; count: number };
    bonus: number;
  };
  percentOfTotal: number;      // % від загальної суми виплат
  percentOfCabinetIncome: number; // Labor Cost Ratio для цього кабінету
}

export interface PortfolioMetrics {
  // Finance
  totalMonthlyIncome: number;
  totalYearlyIncome: number;
  incomeTrend: { value: number; direction: "up" | "down" };
  activeCabinets: number;
  archivedCabinets: number;
  attentionRequired: number;
  arpc: number; // Average Revenue Per Cabinet
  
  // Target/Goal Tracking
  quarterlyIncomeTarget: number;
  closestFopLimit: {
    cabinetId: string;
    cabinetName: string;
    fopGroup: number;
    currentIncome: number;
    limit: number;
    percent: number;
  } | null;
  totalReportsExpected: number;
  
  // Charts
  incomeByMonth: PortfolioChartDataPoint[];
  typeDistribution: PortfolioTypeDistribution[];
  cabinetLeaderboard: PortfolioCabinetRank[];
  
  // Compliance
  upcomingDeadlines: PortfolioDeadline[];
  taxPaymentsDue: number;
  salaryPaymentsDue: number;
  reportsStats: {
    accepted: number;
    submitted: number;
    review: number;
    scheduled: number;
    total: number;
  };
  
  // Extended payments analytics
  taxBreakdown: TaxBreakdown;
  salaryBreakdown: SalaryBreakdown;
  nearestDeadline: NearestDeadline | null;
  
  // Cabinet-level breakdowns
  taxByCabinet: CabinetTaxBreakdown[];
  salaryByCabinet: CabinetSalaryBreakdown[];
  
  // Risks
  riskItems: PortfolioRiskItem[];
  limitAlerts: {
    cabinetId: string;
    cabinetName: string;
    fopGroup: number;
    yearlyIncome: number;
    limit: number;
    percent: number;
    severity: "high" | "medium" | "low";
  }[];
  activeAudits: number;
  auditsBreakdown: AuditsBreakdown;
  
  // Insights
  insights: PortfolioInsight[];
  
  // Health Score
  healthScore: HealthScore;
}

export function usePortfolioMetrics(cabinets: Cabinet[]): PortfolioMetrics {
  return useMemo(() => {
    const active = cabinets.filter(c => c.status === "active");
    const archived = cabinets.filter(c => c.status === "archived");
    
    // ========== FINANCE ==========
    const totalMonthlyIncome = active.reduce((sum, c) => sum + (c.monthlyIncome || 0), 0);
    const totalYearlyIncome = active.reduce((sum, c) => sum + (c.yearlyIncome || (c.monthlyIncome || 0) * 12), 0);
    
    // ARPC - Average Revenue Per Cabinet
    const arpc = active.length > 0 ? totalMonthlyIncome / active.length : 0;
    
    // Type distribution
    const typeGroups: Record<string, { count: number; income: number }> = {};
    active.forEach(c => {
      const type = c.type;
      if (!typeGroups[type]) {
        typeGroups[type] = { count: 0, income: 0 };
      }
      typeGroups[type].count++;
      typeGroups[type].income += c.monthlyIncome || 0;
    });
    
    const typeDistribution: PortfolioTypeDistribution[] = Object.entries(typeGroups).map(([type, data]) => ({
      type,
      label: typeLabels[type] || type,
      value: data.income,
      count: data.count,
      color: portfolioChartColors[type as keyof typeof portfolioChartColors] || "hsl(var(--chart-5))",
    }));
    
    // Cabinet leaderboard
    const cabinetLeaderboard: PortfolioCabinetRank[] = active
      .sort((a, b) => (b.monthlyIncome || 0) - (a.monthlyIncome || 0))
      .map((cabinet, index) => {
        // Count risks for this cabinet
        let riskCount = 0;
        if (cabinet.reportStatus === "tasks") riskCount++;
        const limitPercent = getFopLimitPercent(cabinet);
        if (limitPercent && limitPercent >= 85) riskCount++;
        
        return {
          cabinet,
          rank: index + 1,
          monthlyIncome: cabinet.monthlyIncome || 0,
          trend: { value: Math.floor(Math.random() * 15) + 1, direction: Math.random() > 0.3 ? "up" : "down" as const },
          riskCount,
        };
      });
    
    // Mock monthly chart data (would be aggregated from real data)
    const incomeByMonth: PortfolioChartDataPoint[] = [
      { month: "Лип", income: totalMonthlyIncome * 0.85 },
      { month: "Сер", income: totalMonthlyIncome * 0.88 },
      { month: "Вер", income: totalMonthlyIncome * 0.92 },
      { month: "Жов", income: totalMonthlyIncome * 0.95 },
      { month: "Лис", income: totalMonthlyIncome * 0.98 },
      { month: "Гру", income: totalMonthlyIncome },
    ];
    
    // ========== COMPLIANCE ==========
    
    // Deadlines from cabinets
    const upcomingDeadlines: PortfolioDeadline[] = active
      .filter(c => c.nextDeadline)
      .map(c => {
        const deadline = new Date(c.nextDeadline!);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const urgency: "urgent" | "warning" | "normal" = daysLeft <= 3 ? "urgent" : daysLeft <= 7 ? "warning" : "normal";
        return {
          id: `deadline-${c.id}`,
          cabinetId: c.id,
          cabinetName: c.name,
          date: c.nextDeadline!,
          label: c.deadlineLabel || "Дедлайн",
          type: "other" as const,
          urgency,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Nearest deadline with context
    const nearestDeadline: NearestDeadline | null = upcomingDeadlines.length > 0 
      ? {
          daysLeft: Math.ceil((new Date(upcomingDeadlines[0].date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          label: upcomingDeadlines[0].label,
          cabinetName: upcomingDeadlines[0].cabinetName,
          type: upcomingDeadlines[0].type,
        }
      : null;
    
    // ========== TAX BREAKDOWN (Tax Burden Ratio) ==========
    const pendingTaxPayments = demoTaxPayments.filter(p => p.status !== "paid" && p.status !== "cancelled");
    
    const taxBreakdown: TaxBreakdown = {
      ep: { 
        amount: pendingTaxPayments.filter(p => p.taxType === "ep").reduce((sum, p) => sum + p.amountToPay, 0),
        label: taxTypeConfig.ep.shortLabel,
      },
      esv: { 
        amount: pendingTaxPayments.filter(p => p.taxType === "esv").reduce((sum, p) => sum + p.amountToPay, 0),
        label: taxTypeConfig.esv.shortLabel,
      },
      pdfo: { 
        amount: pendingTaxPayments.filter(p => p.taxType === "pdfo").reduce((sum, p) => sum + p.amountToPay, 0),
        label: taxTypeConfig.pdfo.shortLabel,
      },
      military: { 
        amount: pendingTaxPayments.filter(p => p.taxType === "military").reduce((sum, p) => sum + p.amountToPay, 0),
        label: taxTypeConfig.military.shortLabel,
      },
      total: pendingTaxPayments.reduce((sum, p) => sum + p.amountToPay, 0),
      percentOfIncome: totalMonthlyIncome > 0 
        ? Math.round((pendingTaxPayments.reduce((sum, p) => sum + p.amountToPay, 0) / totalMonthlyIncome) * 100 * 10) / 10
        : 0,
    };
    
    // Tax payments due (from demo data)
    const taxPaymentsDue = taxBreakdown.total;
    
    // ========== SALARY BREAKDOWN (Labor Cost Ratio) ==========
    const scheduledSalaryPayments = demoSalaryPayments.filter(p => p.status === "scheduled");
    
    // Get unique employees
    const uniqueEmployees = new Set(scheduledSalaryPayments.map(p => p.employeeId));
    const employeeCount = uniqueEmployees.size;
    
    // Breakdown by type
    const salaryAmount = scheduledSalaryPayments.filter(p => p.salaryType === "salary" || p.salaryType === "advance").reduce((sum, p) => sum + p.amount, 0);
    const salaryCount = new Set(scheduledSalaryPayments.filter(p => p.salaryType === "salary" || p.salaryType === "advance").map(p => p.employeeId)).size;
    
    const civilAmount = scheduledSalaryPayments.filter(p => p.salaryType === "civil-reward").reduce((sum, p) => sum + p.amount, 0);
    const civilCount = new Set(scheduledSalaryPayments.filter(p => p.salaryType === "civil-reward").map(p => p.employeeId)).size;
    
    const bonusAmount = scheduledSalaryPayments.filter(p => p.salaryType === "bonus").reduce((sum, p) => sum + p.amount, 0);
    
    const totalSalary = scheduledSalaryPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const salaryBreakdown: SalaryBreakdown = {
      salary: { amount: salaryAmount, count: salaryCount },
      civil: { amount: civilAmount, count: civilCount },
      bonus: { amount: bonusAmount },
      total: totalSalary,
      employeeCount,
      percentOfIncome: totalMonthlyIncome > 0 
        ? Math.round((totalSalary / totalMonthlyIncome) * 100 * 10) / 10
        : 0,
      avgPerEmployee: employeeCount > 0 ? Math.round(totalSalary / employeeCount) : 0,
    };
    
    // Salary payments due
    const salaryPaymentsDue = salaryBreakdown.total;
    
    // ========== CABINET-LEVEL TAX BREAKDOWN ==========
    const taxByCabinet: CabinetTaxBreakdown[] = [];
    const cabinetTaxTotals: Record<string, { ep: number; esv: number; pdfo: number; military: number; total: number }> = {};
    
    pendingTaxPayments.forEach(p => {
      if (!cabinetTaxTotals[p.cabinetId]) {
        cabinetTaxTotals[p.cabinetId] = { ep: 0, esv: 0, pdfo: 0, military: 0, total: 0 };
      }
      cabinetTaxTotals[p.cabinetId][p.taxType === "other" ? "ep" : p.taxType] += p.amountToPay;
      cabinetTaxTotals[p.cabinetId].total += p.amountToPay;
    });
    
    Object.entries(cabinetTaxTotals).forEach(([cabinetId, data]) => {
      const cabinet = active.find(c => c.id === cabinetId);
      if (cabinet && data.total > 0) {
        const cabinetIncome = cabinet.monthlyIncome || 0;
        taxByCabinet.push({
          cabinetId,
          cabinetName: cabinet.name,
          cabinetType: cabinet.type,
          total: data.total,
          breakdown: {
            ep: data.ep,
            esv: data.esv,
            pdfo: data.pdfo,
            military: data.military,
          },
          percentOfTotal: taxBreakdown.total > 0 ? (data.total / taxBreakdown.total) * 100 : 0,
          percentOfCabinetIncome: cabinetIncome > 0 ? (data.total / cabinetIncome) * 100 : 0,
        });
      }
    });
    
    // Sort by total amount descending
    taxByCabinet.sort((a, b) => b.total - a.total);
    
    // ========== CABINET-LEVEL SALARY BREAKDOWN ==========
    const salaryByCabinet: CabinetSalaryBreakdown[] = [];
    const cabinetSalaryTotals: Record<string, { 
      salary: number; salaryCount: Set<string>; 
      civil: number; civilCount: Set<string>; 
      bonus: number; 
      total: number; 
      employees: Set<string>;
    }> = {};
    
    scheduledSalaryPayments.forEach(p => {
      if (!cabinetSalaryTotals[p.cabinetId]) {
        cabinetSalaryTotals[p.cabinetId] = { 
          salary: 0, salaryCount: new Set(), 
          civil: 0, civilCount: new Set(), 
          bonus: 0, 
          total: 0, 
          employees: new Set(),
        };
      }
      const data = cabinetSalaryTotals[p.cabinetId];
      data.total += p.amount;
      data.employees.add(p.employeeId);
      
      if (p.salaryType === "salary" || p.salaryType === "advance") {
        data.salary += p.amount;
        data.salaryCount.add(p.employeeId);
      } else if (p.salaryType === "civil-reward") {
        data.civil += p.amount;
        data.civilCount.add(p.employeeId);
      } else if (p.salaryType === "bonus") {
        data.bonus += p.amount;
      }
    });
    
    Object.entries(cabinetSalaryTotals).forEach(([cabinetId, data]) => {
      const cabinet = active.find(c => c.id === cabinetId);
      if (cabinet && data.total > 0) {
        const cabinetIncome = cabinet.monthlyIncome || 0;
        salaryByCabinet.push({
          cabinetId,
          cabinetName: cabinet.name,
          cabinetType: cabinet.type,
          total: data.total,
          employeeCount: data.employees.size,
          breakdown: {
            salary: { amount: data.salary, count: data.salaryCount.size },
            civil: { amount: data.civil, count: data.civilCount.size },
            bonus: data.bonus,
          },
          percentOfTotal: salaryBreakdown.total > 0 ? (data.total / salaryBreakdown.total) * 100 : 0,
          percentOfCabinetIncome: cabinetIncome > 0 ? (data.total / cabinetIncome) * 100 : 0,
        });
      }
    });
    
    // Sort by total amount descending
    salaryByCabinet.sort((a, b) => b.total - a.total);
    
    // Reports stats (using new autonomous status system)
    const accepted = demoReports.filter(r => r.status === "accepted").length;
    const submitted = demoReports.filter(r => r.status === "submitted").length;
    const review = demoReports.filter(r => r.status === "review").length;
    const scheduled = demoReports.filter(r => r.status === "scheduled").length;
    const reportsStats = {
      accepted,
      submitted,
      review,
      scheduled,
      total: accepted + submitted + review + scheduled,
    };
    
    // ========== RISKS ==========
    
    const riskItems: PortfolioRiskItem[] = [];
    
    // FOP limit risks
    active.forEach(c => {
      const percent = getFopLimitPercent(c);
      if (percent !== null && percent >= 75) {
        riskItems.push({
          id: `limit-${c.id}`,
          cabinetId: c.id,
          cabinetName: c.name,
          type: "limit",
          severity: getLimitSeverity(percent),
          title: `Наближення до ліміту ${c.fopGroup} групи`,
          value: `${percent}%`,
          icon: AlertTriangle,
        });
      }
    });
    
    // Deadline risks (urgent)
    upcomingDeadlines
      .filter(d => d.urgency === "urgent")
      .forEach(d => {
        riskItems.push({
          id: d.id,
          cabinetId: d.cabinetId,
          cabinetName: d.cabinetName,
          type: "deadline",
          severity: "high",
          title: d.label,
          value: `до ${new Date(d.date).toLocaleDateString("uk-UA")}`,
          icon: Calendar,
        });
      });
    
    // Active audits as risks
    const activeAuditsList = demoAudits.filter(a => 
      a.status === "in-progress" || a.status === "response-required" || a.status === "announced"
    );
    
    // Audits breakdown with status
    const auditsBreakdown: AuditsBreakdown = {
      total: activeAuditsList.length,
      responseRequired: demoAudits.filter(a => a.status === "response-required").length,
      inProgress: demoAudits.filter(a => a.status === "in-progress").length,
      announced: demoAudits.filter(a => a.status === "announced").length,
    };
    
    activeAuditsList.forEach(audit => {
      riskItems.push({
        id: `audit-${audit.id}`,
        cabinetId: "2", // Demo - would be linked properly
        cabinetName: "ФОП Іваненко І.І.",
        type: "audit",
        severity: audit.status === "response-required" ? "high" : "medium",
        title: `Перевірка ДПС: ${audit.period}`,
        value: audit.status === "response-required" ? "Очікує відповіді" : "В процесі",
        icon: audit.status === "response-required" ? ShieldAlert : FileSearch,
      });
    });
    
    // Sort risks by severity
    riskItems.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    });
    
    // Limit alerts (detailed for FOP section)
    const limitAlerts = active
      .filter(c => c.type === "fop" && c.fopGroup && c.yearlyIncome)
      .map(c => {
        const percent = getFopLimitPercent(c)!;
        const limit = FOP_LIMITS[c.fopGroup as keyof typeof FOP_LIMITS];
        return {
          cabinetId: c.id,
          cabinetName: c.name,
          fopGroup: c.fopGroup!,
          yearlyIncome: c.yearlyIncome!,
          limit,
          percent,
          severity: getLimitSeverity(percent),
        };
      })
      .filter(a => a.percent >= 50)
      .sort((a, b) => b.percent - a.percent);
    
    // Active audits count
    const activeAudits = activeAuditsList.length;
    
    // ========== INSIGHTS ==========
    const insights = generatePortfolioInsights(cabinets);
    
    // ========== HEALTH SCORE ==========
    const healthScore = calculateHealthScore({
      reportsStats,
      upcomingDeadlines,
      auditsBreakdown,
      taxBreakdown,
      salaryBreakdown,
      riskItems,
      limitAlerts,
      cabinets: active,
      incomeTrend: { value: 12, direction: "up" as const },
    });
    
    // ========== TARGET/GOAL TRACKING ==========
    // Quarterly income target: auto-calculated as current × 1.1 (+10% growth)
    const quarterlyIncomeTarget = Math.round(totalMonthlyIncome * 3 * 1.1);
    
    // Find cabinet closest to FOP limit
    const closestFopLimit = limitAlerts.length > 0 
      ? {
          cabinetId: limitAlerts[0].cabinetId,
          cabinetName: limitAlerts[0].cabinetName,
          fopGroup: limitAlerts[0].fopGroup,
          currentIncome: limitAlerts[0].yearlyIncome,
          limit: limitAlerts[0].limit,
          percent: limitAlerts[0].percent,
        }
      : null;
    
    // Expected reports per year: (4 quarters × 2 report types per FOP) × active FOP count
    const fopCount = active.filter(c => c.type === "fop").length;
    const totalReportsExpected = fopCount * 4 * 2; // 4 quarters × (EP + ESV)
    
    return {
      totalMonthlyIncome,
      totalYearlyIncome,
      incomeTrend: { value: 12, direction: "up" },
      activeCabinets: active.length,
      archivedCabinets: archived.length,
      attentionRequired: active.filter(c => c.reportStatus === "tasks").length,
      arpc,
      
      // Target/Goal tracking
      quarterlyIncomeTarget,
      closestFopLimit,
      totalReportsExpected,
      
      incomeByMonth,
      typeDistribution,
      cabinetLeaderboard,
      
      upcomingDeadlines,
      taxPaymentsDue,
      salaryPaymentsDue,
      reportsStats,
      
      taxBreakdown,
      salaryBreakdown,
      nearestDeadline,
      
      taxByCabinet,
      salaryByCabinet,
      
      riskItems,
      limitAlerts,
      activeAudits,
      auditsBreakdown,
      
      insights,
      healthScore,
    };
  }, [cabinets]);
}

// ========== HEALTH SCORE CALCULATION ==========
interface HealthScoreInput {
  reportsStats: { accepted: number; submitted: number; review: number; scheduled: number; total: number };
  upcomingDeadlines: PortfolioDeadline[];
  auditsBreakdown: AuditsBreakdown;
  taxBreakdown: TaxBreakdown;
  salaryBreakdown: SalaryBreakdown;
  riskItems: PortfolioRiskItem[];
  limitAlerts: { percent: number }[];
  cabinets: Cabinet[];
  incomeTrend: { value: number; direction: "up" | "down" };
}

function calculateHealthScore(input: HealthScoreInput): HealthScore {
  const { reportsStats, upcomingDeadlines, auditsBreakdown, taxBreakdown, salaryBreakdown, riskItems, limitAlerts, cabinets, incomeTrend } = input;
  
  // === COMPLIANCE (30%) ===
  // Factor 1: Reports acceptance rate
  const reportsAcceptanceRate = reportsStats.total > 0 
    ? Math.round(((reportsStats.accepted + reportsStats.submitted) / reportsStats.total) * 100) 
    : 100;
  
  // Factor 2: Deadline safety (% of deadlines > 7 days)
  const safeDeadlines = upcomingDeadlines.filter(d => {
    const daysLeft = Math.ceil((new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 7;
  }).length;
  const deadlineSafetyRate = upcomingDeadlines.length > 0 
    ? Math.round((safeDeadlines / upcomingDeadlines.length) * 100)
    : 100;
  
  // Factor 3: Audit safety
  const auditSafetyScore = auditsBreakdown.responseRequired === 0 ? 100 : 50;
  
  const complianceScore = Math.round(
    reportsAcceptanceRate * 0.5 + 
    deadlineSafetyRate * 0.3 + 
    auditSafetyScore * 0.2
  );
  
  const complianceFactors: HealthScoreFactor[] = [
    { label: "Звіти прийнято/подано", value: reportsAcceptanceRate, status: reportsAcceptanceRate >= 80 ? "good" : reportsAcceptanceRate >= 60 ? "warning" : "critical" },
    { label: "Безпечні дедлайни (>7 дн.)", value: deadlineSafetyRate, status: deadlineSafetyRate >= 80 ? "good" : deadlineSafetyRate >= 50 ? "warning" : "critical" },
    { label: "Без термінових перевірок", value: auditSafetyScore, status: auditSafetyScore >= 80 ? "good" : "warning" },
  ];
  
  // === FINANCE (25%) ===
  // Factor 1: Tax Burden Ratio (optimal < 7%)
  const taxBurdenScore = taxBreakdown.percentOfIncome < 7 ? 100 : taxBreakdown.percentOfIncome < 10 ? 70 : 40;
  
  // Factor 2: Labor Cost Ratio (optimal < 30%)
  const laborCostScore = salaryBreakdown.percentOfIncome < 30 ? 100 : salaryBreakdown.percentOfIncome < 50 ? 70 : 40;
  
  // Factor 3: Revenue trend
  const revenueTrendScore = incomeTrend.direction === "up" ? 100 : 60;
  
  const financeScore = Math.round(
    taxBurdenScore * 0.4 + 
    laborCostScore * 0.3 + 
    revenueTrendScore * 0.3
  );
  
  const financeFactors: HealthScoreFactor[] = [
    { label: `Податкове навантаження (${taxBreakdown.percentOfIncome}%)`, value: taxBurdenScore, status: taxBurdenScore >= 80 ? "good" : taxBurdenScore >= 60 ? "warning" : "critical" },
    { label: `Витрати на персонал (${salaryBreakdown.percentOfIncome}%)`, value: laborCostScore, status: laborCostScore >= 80 ? "good" : laborCostScore >= 60 ? "warning" : "critical" },
    { label: "Тренд доходу", value: revenueTrendScore, status: revenueTrendScore >= 80 ? "good" : "warning" },
  ];
  
  // === RISKS (25%) ===
  // Factor 1: FOP Limit Safety
  const maxLimitPercent = limitAlerts.length > 0 ? Math.max(...limitAlerts.map(a => a.percent)) : 0;
  const limitSafetyScore = Math.max(0, 100 - maxLimitPercent);
  
  // Factor 2: High risks count
  const highRisksCount = riskItems.filter(r => r.severity === "high").length;
  const highRisksScore = highRisksCount === 0 ? 100 : highRisksCount <= 2 ? 70 : 40;
  
  // Factor 3: Attention required
  const attentionCount = cabinets.filter(c => c.reportStatus === "tasks").length;
  const attentionScore = attentionCount === 0 ? 100 : attentionCount <= 2 ? 80 : 50;
  
  const riskScore = Math.round(
    limitSafetyScore * 0.4 + 
    highRisksScore * 0.3 + 
    attentionScore * 0.3
  );
  
  const riskFactors: HealthScoreFactor[] = [
    { label: `Запас до ліміту (${100 - maxLimitPercent}%)`, value: Math.round(limitSafetyScore), status: limitSafetyScore >= 50 ? "good" : limitSafetyScore >= 25 ? "warning" : "critical" },
    { label: `Критичних ризиків (${highRisksCount})`, value: highRisksScore, status: highRisksScore >= 80 ? "good" : highRisksScore >= 60 ? "warning" : "critical" },
    { label: `Потребують уваги (${attentionCount})`, value: attentionScore, status: attentionScore >= 80 ? "good" : attentionScore >= 60 ? "warning" : "critical" },
  ];
  
  // === DATA QUALITY (20%) ===
  // Factor 1: Profile completeness (check taxId presence)
  const profileCompletenessScore = cabinets.length > 0 
    ? Math.round((cabinets.filter(c => c.taxId).length / cabinets.length) * 100)
    : 100;
  
  // Factor 2: Integration status (check if cabinet has income data)
  const integratedCabinets = cabinets.filter(c => c.monthlyIncome !== undefined).length;
  const integrationScore = cabinets.length > 0 
    ? Math.round((integratedCabinets / cabinets.length) * 100)
    : 100;
  
  // Factor 3: Sync freshness (mock - would calculate based on actual sync times)
  const syncFreshnessScore = 85;
  
  const dataQualityScore = Math.round(
    profileCompletenessScore * 0.5 + 
    integrationScore * 0.3 + 
    syncFreshnessScore * 0.2
  );
  
  const dataQualityFactors: HealthScoreFactor[] = [
    { label: "Заповненість профілів", value: profileCompletenessScore, status: profileCompletenessScore >= 80 ? "good" : profileCompletenessScore >= 60 ? "warning" : "critical" },
    { label: "Активні інтеграції", value: integrationScore, status: integrationScore >= 80 ? "good" : integrationScore >= 50 ? "warning" : "critical" },
    { label: "Свіжість даних", value: syncFreshnessScore, status: syncFreshnessScore >= 80 ? "good" : syncFreshnessScore >= 60 ? "warning" : "critical" },
  ];
  
  // === TOTAL SCORE ===
  const totalScore = Math.round(
    complianceScore * 0.30 +
    financeScore * 0.25 +
    riskScore * 0.25 +
    dataQualityScore * 0.20
  );
  
  // Grade calculation
  const grade: HealthScore["grade"] = 
    totalScore >= 90 ? "A" :
    totalScore >= 80 ? "B" :
    totalScore >= 70 ? "C" :
    totalScore >= 60 ? "D" : "F";
  
  return {
    total: totalScore,
    grade,
    trend: { value: 3, direction: "up" }, // Mock trend - would calculate from historical data
    categories: {
      compliance: {
        score: complianceScore,
        weight: 0.30,
        label: "Compliance",
        icon: FileCheck,
        color: "bg-success/10 text-success",
        factors: complianceFactors,
      },
      finance: {
        score: financeScore,
        weight: 0.25,
        label: "Фінанси",
        icon: Wallet,
        color: "bg-blue-500/10 text-blue-500",
        factors: financeFactors,
      },
      risks: {
        score: riskScore,
        weight: 0.25,
        label: "Ризики",
        icon: AlertTriangle,
        color: "bg-amber-500/10 text-amber-500",
        factors: riskFactors,
      },
      dataQuality: {
        score: dataQualityScore,
        weight: 0.20,
        label: "Відповідність",
        icon: Database,
        color: "bg-purple-500/10 text-purple-500",
        factors: dataQualityFactors,
      },
    },
  };
}
