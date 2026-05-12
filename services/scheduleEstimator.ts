/**
 * ARBA v8.0 — Schedule Estimator
 * محرك تقدير الجدول الزمني — G9: تداخل أنشطة + lag/lead
 */

import { BlueprintConfig, SoilType } from '../types';
import { runCognitiveEngine, CognitiveOutputItem, CognitiveEngineOutput } from './cognitiveCalculations';
import { findActivity, WEATHER_FACTORS, COMPLEXITY_FACTORS } from '../data/laborProductivity';

export interface ScheduleActivity {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  quantity: number;
  unit: string;
  crews: number;
  adjustedOutputPerDay: number;
  durationDays: number;
  predecessors: string[];
  startDay: number;
  endDay: number;
  isCritical: boolean;
}

export interface ScheduleEstimate {
  activities: ScheduleActivity[];
  totalDurationDays: number;
  totalDurationMonths: number;
  criticalPath: string[];
  summary: {
    siteWorkDays: number;
    structureDays: number;
    masonryDays: number;
    finishesDays: number;
    mepDays: number;
    externalDays: number;
  };
}

export interface ScheduleConfig {
  crewsPerActivity?: Partial<Record<string, number>>;
  weatherCondition?: string;
  complexity?: string;
  workingDaysPerMonth?: number;
}

interface ActivityMapping {
  scheduleId: string;
  nameAr: string;
  nameEn: string;
  laborActivityId: string;
  category: string;
  predecessors: string[];
  /** G9: lag (+) أو lead (-) بالأيام مع السابق — يسمح بالتداخل */
  lagDays?: number;
  getQuantity: (cog: CognitiveEngineOutput) => number;
}

function sumQtyByUnit(items: CognitiveOutputItem[], unit: string): number {
  return items.reduce((s, i) => (i.unit === unit ? s + i.grossQty : s), 0);
}
function sumQtyById(items: CognitiveOutputItem[], prefix: string): number {
  return items.reduce((s, i) => (i.id.startsWith(prefix) ? s + i.grossQty : s), 0);
}
function sumQty(items: CognitiveOutputItem[]): number {
  return items.reduce((s, i) => s + i.grossQty, 0);
}

const ACTIVITY_MAPPINGS: ActivityMapping[] = [
  { scheduleId: 'sch_site', nameAr: 'تنظيف الموقع', nameEn: 'Site Clearance', laborActivityId: 'site_clearance', category: 'site', predecessors: [], getQuantity: c => sumQtyById(c.excavation, 'exc_site') },
  { scheduleId: 'sch_exc', nameAr: 'أعمال الحفر', nameEn: 'Excavation', laborActivityId: 'exc_normal', category: 'site', predecessors: ['sch_site'], getQuantity: c => sumQtyByUnit(c.excavation, 'م3') },
  { scheduleId: 'sch_blind', nameAr: 'خرسانة نظافة', nameEn: 'Blinding', laborActivityId: 'concrete_blinding', category: 'structure', predecessors: ['sch_exc'], getQuantity: c => sumQtyById(c.substructure, 'sub_blinding') },
  { scheduleId: 'sch_sub_rebar', nameAr: 'حديد أساسات', nameEn: 'Foundation Rebar', laborActivityId: 'rebar_tying', category: 'structure', predecessors: ['sch_blind'], getQuantity: c => sumQtyById(c.substructure, 'sub_steel') },
  { scheduleId: 'sch_sub_form', nameAr: 'شدة أساسات', nameEn: 'Foundation Formwork', laborActivityId: 'formwork_setup', category: 'structure', predecessors: ['sch_blind'], getQuantity: c => sumQtyById(c.substructure, 'formwork_sub') },
  { scheduleId: 'sch_sub_conc', nameAr: 'صب أساسات', nameEn: 'Foundation Pour', laborActivityId: 'concrete_found', category: 'structure', predecessors: ['sch_sub_rebar', 'sch_sub_form'], getQuantity: c => sumQtyByUnit(c.substructure, 'م3') - sumQtyById(c.substructure, 'sub_blinding') },
  { scheduleId: 'sch_backfill', nameAr: 'ردم ودمك', nameEn: 'Backfill', laborActivityId: 'backfill', category: 'site', predecessors: ['sch_sub_conc'], getQuantity: c => sumQtyById(c.excavation, 'exc_cartaway') * 0.4 },
  { scheduleId: 'sch_sup_form', nameAr: 'شدة العظم', nameEn: 'Super Formwork', laborActivityId: 'formwork_setup', category: 'structure', predecessors: ['sch_sub_conc'], getQuantity: c => sumQtyById(c.superstructure, 'formwork_super') },
  { scheduleId: 'sch_sup_rebar', nameAr: 'حديد العظم', nameEn: 'Super Rebar', laborActivityId: 'rebar_tying', category: 'structure', predecessors: ['sch_sup_form'], getQuantity: c => sumQtyById(c.superstructure, 'super_steel') },
  { scheduleId: 'sch_sup_conc', nameAr: 'صب العظم', nameEn: 'Super Pour', laborActivityId: 'concrete_slabs', category: 'structure', predecessors: ['sch_sup_rebar'], getQuantity: c => sumQtyByUnit(c.superstructure, 'م3') },
  { scheduleId: 'sch_block', nameAr: 'أعمال البلك', nameEn: 'Blockwork', laborActivityId: 'blockwork_20', category: 'masonry', predecessors: ['sch_sup_conc'], getQuantity: c => sumQtyByUnit(c.masonry, 'م2') },
  { scheduleId: 'sch_plaster', nameAr: 'لياسة', nameEn: 'Plastering', laborActivityId: 'plaster_internal', category: 'finishes', predecessors: ['sch_block'], getQuantity: c => sumQtyByUnit(c.finishes, 'م2') * 0.5 },
  { scheduleId: 'sch_plumb', nameAr: 'سباكة', nameEn: 'Plumbing', laborActivityId: 'plumbing_rough', category: 'mep', predecessors: ['sch_block'], lagDays: -3, getQuantity: c => sumQtyByUnit(c.mep, 'نقطة') * 0.4 },
  { scheduleId: 'sch_elec', nameAr: 'كهرباء', nameEn: 'Electrical', laborActivityId: 'electrical_rough', category: 'mep', predecessors: ['sch_block'], lagDays: -3, getQuantity: c => sumQtyByUnit(c.mep, 'نقطة') * 0.6 },
  { scheduleId: 'sch_wp', nameAr: 'عزل مائي', nameEn: 'Waterproofing', laborActivityId: 'waterproof_roof', category: 'external', predecessors: ['sch_sup_conc'], getQuantity: c => sumQtyByUnit(c.waterproofing, 'م2') },
  { scheduleId: 'sch_ins', nameAr: 'عزل حراري', nameEn: 'Insulation', laborActivityId: 'insulation_walls', category: 'external', predecessors: ['sch_block'], lagDays: -5, getQuantity: c => sumQtyByUnit(c.insulation, 'م2') },
  { scheduleId: 'sch_tile', nameAr: 'بلاط', nameEn: 'Tiling', laborActivityId: 'tiling_floor', category: 'finishes', predecessors: ['sch_plaster', 'sch_plumb'], lagDays: -2, getQuantity: c => c.finishes.filter(i => i.id.includes('tile') || i.id.includes('ceramic') || i.id.includes('porcelain')).reduce((s, i) => s + i.grossQty, 0) },
  { scheduleId: 'sch_paint', nameAr: 'دهان', nameEn: 'Painting', laborActivityId: 'painting_interior', category: 'finishes', predecessors: ['sch_plaster'], getQuantity: c => c.finishes.filter(i => i.id.includes('paint')).reduce((s, i) => s + i.grossQty, 0) },
  { scheduleId: 'sch_facade', nameAr: 'واجهات', nameEn: 'Facades', laborActivityId: 'painting_exterior', category: 'external', predecessors: ['sch_block', 'sch_wp'], lagDays: -5, getQuantity: c => sumQtyByUnit(c.facades, 'م2') },
  { scheduleId: 'sch_ext', nameAr: 'أعمال خارجية', nameEn: 'External Works', laborActivityId: 'boundary_wall', category: 'external', predecessors: ['sch_backfill'], getQuantity: c => 40 },
  // v8.0: كمرات ساقطة + درج (متزامن مع العظم)
  { scheduleId: 'sch_beams', nameAr: 'كمرات ساقطة', nameEn: 'Drop Beams', laborActivityId: 'concrete_slabs', category: 'structure', predecessors: ['sch_sup_form'], lagDays: 0, getQuantity: c => sumQtyByUnit(c.dropBeams, 'م3') },
  { scheduleId: 'sch_stairs', nameAr: 'درج', nameEn: 'Stairs', laborActivityId: 'concrete_slabs', category: 'structure', predecessors: ['sch_sup_conc'], lagDays: 0, getQuantity: c => sumQtyByUnit(c.stairs, 'م3') },
];

export function estimateSchedule(
  blueprint: BlueprintConfig, soilType: SoilType, config: ScheduleConfig = {}
): ScheduleEstimate {
  const cogOutput = runCognitiveEngine(blueprint, soilType);
  const wF = WEATHER_FACTORS[config.weatherCondition || 'normal']?.factor || 1.0;
  const cF = COMPLEXITY_FACTORS[config.complexity || 'standard']?.factor || 1.0;
  const dpm = config.workingDaysPerMonth || 26;
  const crewsCfg = config.crewsPerActivity || {};

  const activities: ScheduleActivity[] = [];
  for (const m of ACTIVITY_MAPPINGS) {
    const qty = m.getQuantity(cogOutput);
    if (qty <= 0) continue;
    const lab = findActivity(m.laborActivityId);
    const adjOut = (lab?.outputPerDay || 10) * wF * cF;
    const crews = crewsCfg[m.scheduleId] || 1;
    const dur = Math.max(1, Math.ceil(qty / (adjOut * crews)));
    activities.push({
      id: m.scheduleId, nameAr: m.nameAr, nameEn: m.nameEn, category: m.category,
      quantity: Math.round(qty * 100) / 100, unit: lab?.unit || 'وحدة',
      crews, adjustedOutputPerDay: Math.round(adjOut * 100) / 100,
      durationDays: dur, predecessors: m.predecessors,
      startDay: 0, endDay: 0, isCritical: false,
    });
  }

  // Forward pass
  const aMap = new Map<string, ScheduleActivity>();
  activities.forEach(a => aMap.set(a.id, a));
  const resolved = new Set<string>();
  let itr = 0;
  while (resolved.size < activities.length && itr < activities.length * activities.length) {
    itr++;
    for (const a of activities) {
      if (resolved.has(a.id)) continue;
      if (a.predecessors.every(p => !aMap.has(p) || resolved.has(p))) {
        let latest = 0;
        for (const p of a.predecessors) { const pr = aMap.get(p); if (pr && pr.endDay > latest) latest = pr.endDay; }
        // G9: تطبيق lag/lead — القيمة السالبة = lead (تداخل)
        const mapping = ACTIVITY_MAPPINGS.find(m => m.scheduleId === a.id);
        const lag = mapping?.lagDays || 0;
        a.startDay = Math.max(0, latest + lag);
        a.endDay = a.startDay + a.durationDays;
        resolved.add(a.id);
      }
    }
  }

  const totalDays = Math.max(...activities.map(a => a.endDay), 0);
  const criticalPath: string[] = [];
  const markCritical = (end: number) => {
    for (const a of activities) {
      if (a.endDay === end && !criticalPath.includes(a.id)) {
        a.isCritical = true; criticalPath.push(a.id);
        for (const p of a.predecessors) { const pr = aMap.get(p); if (pr && pr.endDay === a.startDay) markCritical(pr.endDay); }
      }
    }
  };
  markCritical(totalDays);

  const sumD = (cat: string) => activities.filter(a => a.category === cat).reduce((s, a) => s + a.durationDays, 0);

  return {
    activities, totalDurationDays: totalDays,
    totalDurationMonths: Math.round((totalDays / dpm) * 10) / 10,
    criticalPath,
    summary: { siteWorkDays: sumD('site'), structureDays: sumD('structure'), masonryDays: sumD('masonry'), finishesDays: sumD('finishes'), mepDays: sumD('mep'), externalDays: sumD('external') },
  };
}
