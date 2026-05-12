/**
 * ARBA Blueprint Intelligence — محرك التنبؤ الذكي
 * يتعلم من النماذج الـ 25 في blueprintTemplates.ts
 * ويتنبأ بالمواصفات الكاملة لأي مشروع جديد
 * 
 * المدخلات: projectType + plotArea + floorsCount
 * المخرجات: BlueprintConfig كاملة (أساسات، أعمدة، تشطيبات، واجهات، MEP)
 */

import {
  BlueprintConfig, ProjectType, FloorDetails, ExcavationConfig,
  FoundationConfig, RoomFinishSchedule, FacadeSchedule, MEPConfig,
  FoundationType, FinishMaterial, FacadeFinishType, SlabType,
  RoomType, FacadeDirection,
} from '../types';
import { BLUEPRINT_TEMPLATES, BlueprintTemplate } from '../constants/blueprintTemplates';

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface PredictionInput {
  projectType: ProjectType;
  plotArea: number;
  floorsCount: number;
  qualityLevel?: 'economy' | 'standard' | 'premium' | 'luxury';
}

export interface PredictionResult {
  config: BlueprintConfig;
  confidence: number;        // 0-100
  basedOn: string[];          // template IDs used
  warnings: string[];
  costEstimate?: CostEstimate;
}

export interface CostEstimate {
  structureCostPerSqm: number;
  finishingCostPerSqm: number;
  mepCostPerSqm: number;
  siteworksCostPerSqm: number;
  totalCostPerSqm: number;
  totalProjectCost: number;
  breakdown: Record<string, number>;
}

export interface BlueprintError {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  expectedValue: string | number;
  actualValue: string | number;
}

// ═══════════════════════════════════════════════════
// Training Data Extraction (learns from templates)
// ═══════════════════════════════════════════════════

interface TrainedPattern {
  projectType: ProjectType;
  plotAreaRange: [number, number];
  floorsRange: [number, number];
  columnWidth: number;
  columnDepth: number;
  foundationType: FoundationType;
  foundationParams: { footingWidth: number; footingDepth: number; raftThickness: number };
  excavationDepth: number;
  needsShoring: boolean;
  needsDewatering: boolean;
  slabType: SlabType;
  floorHeight: number;
  columnsPerFloor: number;
  mepTier: 'villa' | 'commercial' | 'large';
  facadePattern: { primary: FacadeFinishType; secondary: FacadeFinishType; windowRatio: number };
  roomPatterns: RoomPattern[];
  costPerSqm: number;
}

interface RoomPattern {
  name: string;
  type: RoomType;
  areaRatio: number; // % of floor area
  floor: FinishMaterial;
  wall: FinishMaterial;
  ceiling: FinishMaterial;
  wetHeight?: number;
}

// ═══════════════════════════════════════════════════
// Core Intelligence Engine
// ═══════════════════════════════════════════════════

class BlueprintIntelligenceEngine {
  private patterns: TrainedPattern[] = [];
  private isInitialized = false;

  /** Train from existing templates */
  initialize(): void {
    if (this.isInitialized) return;
    this.patterns = BLUEPRINT_TEMPLATES.map(t => this.extractPattern(t));
    this.isInitialized = true;
  }

  private extractPattern(template: BlueprintTemplate): TrainedPattern {
    const c = template.config;
    const totalBuildArea = c.floors.reduce((s, f) => s + f.area, 0);
    const avgHeight = c.floors.reduce((s, f) => s + f.height, 0) / c.floors.length;
    const avgCols = Math.round(c.floors.reduce((s, f) => s + f.columnsCount, 0) / c.floors.length);

    // Determine MEP tier
    let mepTier: 'villa' | 'commercial' | 'large' = 'villa';
    if (c.mepConfig?.plumbing?.groundTankLiters && c.mepConfig.plumbing.groundTankLiters >= 10000) {
      mepTier = c.mepConfig.plumbing.groundTankLiters >= 20000 ? 'large' : 'commercial';
    }

    // Extract room patterns
    const roomPatterns: RoomPattern[] = (c.roomFinishes || []).map(r => ({
      name: r.roomName,
      type: r.roomType,
      areaRatio: (r.length * r.width) / (totalBuildArea || 1),
      floor: r.floorFinish,
      wall: r.wallFinish,
      ceiling: r.ceilingFinish,
      wetHeight: r.wetAreaWallHeight,
    }));

    // Facade pattern
    const facades = c.facadeSchedules || [];
    const primaryFacade = facades[0]?.finishType || 'plaster_paint';
    const secondaryFacade = facades[1]?.finishType || 'plaster_paint';
    const avgWinRatio = facades.length > 0
      ? facades.reduce((s, f) => s + f.windowDoorRatio, 0) / facades.length
      : 0.15;

    // Cost estimation (SAR/m²) based on project type and quality
    const costPerSqm = this.estimateBaseCost(template.projectType, mepTier);

    return {
      projectType: template.projectType,
      plotAreaRange: [template.plotArea * 0.7, template.plotArea * 1.5],
      floorsRange: [Math.max(1, template.floorsCount - 1), template.floorsCount + 2],
      columnWidth: c.columnWidth_cm || 30,
      columnDepth: c.columnDepth_cm || 50,
      foundationType: c.foundation?.type || 'isolated_footings',
      foundationParams: {
        footingWidth: c.foundation?.footingWidth || 1.2,
        footingDepth: c.foundation?.footingDepth || 0.5,
        raftThickness: c.foundation?.raftThickness || 0,
      },
      excavationDepth: c.excavation?.excavationDepth || 1.5,
      needsShoring: c.excavation?.shoringRequired || false,
      needsDewatering: c.excavation?.dewateringRequired || false,
      slabType: c.floors[0]?.slabType || 'solid',
      floorHeight: avgHeight,
      columnsPerFloor: avgCols,
      mepTier,
      facadePattern: { primary: primaryFacade, secondary: secondaryFacade, windowRatio: avgWinRatio },
      roomPatterns,
      costPerSqm,
    };
  }

  private estimateBaseCost(type: ProjectType, tier: string): number {
    const costs: Record<string, number> = {
      villa: 1800, tower: 2200, residential_building: 1600,
      mosque: 2000, mall: 2500, school: 1500,
      hospital: 3500, clinic: 2000, hotel: 3000,
      restaurant: 2200, gas_station: 1800, factory: 1200,
      warehouse: 900, rest_house: 1600, farm: 800,
      sports_complex: 2800, car_wash: 1500, government: 2000,
    };
    const base = costs[type] || 1800;
    const tierMult = tier === 'large' ? 1.3 : tier === 'commercial' ? 1.15 : 1.0;
    return Math.round(base * tierMult);
  }

  // ═══════════════════════════════════════════════════
  // PREDICTION ENGINE
  // ═══════════════════════════════════════════════════

  predict(input: PredictionInput): PredictionResult {
    this.initialize();
    const { projectType, plotArea, floorsCount, qualityLevel = 'standard' } = input;

    // Find matching patterns
    const matches = this.patterns
      .filter(p => p.projectType === projectType)
      .sort((a, b) => {
        const distA = Math.abs((a.plotAreaRange[0] + a.plotAreaRange[1]) / 2 - plotArea);
        const distB = Math.abs((b.plotAreaRange[0] + b.plotAreaRange[1]) / 2 - plotArea);
        return distA - distB;
      });

    const warnings: string[] = [];
    let confidence = 85;

    // If no exact match, find closest type and reduce confidence
    let basePattern: TrainedPattern;
    if (matches.length > 0) {
      basePattern = matches[0];
      if (plotArea < basePattern.plotAreaRange[0] || plotArea > basePattern.plotAreaRange[1]) {
        confidence -= 15;
        warnings.push(`المساحة ${plotArea}م² خارج النطاق المعتاد لهذا النوع`);
      }
    } else {
      basePattern = this.patterns[0]; // fallback
      confidence = 40;
      warnings.push(`لا توجد بيانات تدريب لنوع المشروع: ${projectType}`);
    }

    // Generate config
    const config = this.generateConfig(basePattern, plotArea, floorsCount, qualityLevel);
    const totalBuildArea = config.floors.reduce((s, f) => s + f.area, 0);

    // Cost estimate
    const qualityMult = { economy: 0.75, standard: 1.0, premium: 1.3, luxury: 1.7 }[qualityLevel];
    const adjustedCostPerSqm = Math.round(basePattern.costPerSqm * qualityMult);
    const costEstimate = this.buildCostEstimate(adjustedCostPerSqm, totalBuildArea, config);

    return {
      config,
      confidence,
      basedOn: matches.slice(0, 3).map((_, i) => BLUEPRINT_TEMPLATES.filter(t => t.projectType === projectType)[i]?.id || ''),
      warnings,
      costEstimate,
    };
  }

  private generateConfig(
    pattern: TrainedPattern, plotArea: number, floorsCount: number, quality: string
  ): BlueprintConfig {
    // Calculate plot dimensions (assume roughly rectangular, ~1.3:1 ratio)
    const ratio = 1.3;
    const plotWidth = Math.round(Math.sqrt(plotArea / ratio));
    const plotLength = Math.round(plotArea / plotWidth);

    // Setbacks scale with plot size
    const setbackFront = plotArea < 400 ? 3 : plotArea < 1000 ? 4 : plotArea < 3000 ? 5 : 8;
    const setbackSide = plotArea < 400 ? 1.5 : plotArea < 1000 ? 2 : plotArea < 3000 ? 3 : 5;
    const setbackRear = plotArea < 400 ? 2 : plotArea < 1000 ? 3 : plotArea < 3000 ? 3 : 5;

    // Build area per floor
    const buildLength = plotLength - setbackFront - setbackRear;
    const buildWidth = plotWidth - 2 * setbackSide;
    const floorArea = Math.max(50, Math.round(buildLength * buildWidth));

    // Columns
    const { columnWidth, columnDepth } = this.predictColumns(plotArea, floorsCount, pattern);

    // Foundation
    const foundation = this.predictFoundation(plotArea, floorsCount, pattern);

    // Excavation
    const excavation = this.predictExcavation(plotArea, floorsCount, pattern);

    // Floors
    const floors = this.generateFloors(floorArea, floorsCount, pattern);

    // Room finishes
    const roomFinishes = this.generateRoomFinishes(pattern, quality, floorArea);

    // Facades
    const totalHeight = floors.reduce((s, f) => s + f.height, 0);
    const facadeSchedules = this.generateFacades(buildLength, buildWidth, totalHeight, pattern, quality);

    // MEP
    const mepConfig = this.predictMEP(plotArea, floorsCount, pattern);

    return {
      plotLength, plotWidth, setbackFront, setbackSide, setbackRear,
      columnWidth_cm: columnWidth, columnDepth_cm: columnDepth,
      floors, excavation, foundation, roomFinishes, facadeSchedules, mepConfig,
    };
  }

  private predictColumns(plotArea: number, floors: number, pattern: TrainedPattern) {
    const load = plotArea * floors;
    if (load < 600) return { columnWidth: 25, columnDepth: 40 };
    if (load < 2000) return { columnWidth: 30, columnDepth: 50 };
    if (load < 5000) return { columnWidth: 30, columnDepth: 60 };
    return { columnWidth: 40, columnDepth: 70 };
  }

  private predictFoundation(plotArea: number, floors: number, pattern: TrainedPattern): FoundationConfig {
    const load = plotArea * floors;
    if (load < 800) {
      return { type: 'isolated_footings', neckColumnHeight: 0.5, tieBeamDepth: 0.6, tieBeamWidth: 0.3, footingDepth: 0.5, footingWidth: 1.2, raftThickness: 0 };
    }
    if (load < 2500) {
      return { type: 'strip_footings', neckColumnHeight: 0.5, tieBeamDepth: 0.6, tieBeamWidth: 0.3, footingDepth: 0.5, footingWidth: 0.9, raftThickness: 0 };
    }
    if (load < 8000) {
      return { type: 'raft', neckColumnHeight: 0.5, tieBeamDepth: 0.6, tieBeamWidth: 0.3, footingDepth: 0, footingWidth: 0, raftThickness: 0.7 };
    }
    return { type: 'piles', neckColumnHeight: 0.8, tieBeamDepth: 0.8, tieBeamWidth: 0.4, footingDepth: 0, footingWidth: 0, raftThickness: 0 };
  }

  private predictExcavation(plotArea: number, floors: number, pattern: TrainedPattern): ExcavationConfig {
    const needsDeep = floors > 4 || plotArea > 2000;
    const needsShallow = plotArea < 400 && floors <= 1;

    if (needsDeep) {
      return {
        excavationDepth: 2.5, soilReplacementNeeded: true, soilReplacementThickness: 0.5, zeroLevel: 0.50,
        siteClearanceRequired: true, topsoilStrippingDepth: 0.20,
        shoringRequired: true, shoringType: 'steel_sheet', shoringDepth: 2.5,
        dewateringRequired: true, dewateringType: 'wellpoint', waterTableDepth: 2.0,
        rockExcavationPercent: 0, importedFillRequired: false, importedFillPercent: 0,
      };
    }
    if (needsShallow) {
      return {
        excavationDepth: 1.0, soilReplacementNeeded: false, soilReplacementThickness: 0, zeroLevel: 0.20,
        siteClearanceRequired: true, topsoilStrippingDepth: 0.15,
        shoringRequired: false, shoringType: 'none',
        dewateringRequired: false, dewateringType: 'none',
        rockExcavationPercent: 0, importedFillRequired: false, importedFillPercent: 0,
      };
    }
    return {
      excavationDepth: 1.5, soilReplacementNeeded: true, soilReplacementThickness: 0.3, zeroLevel: 0.30,
      siteClearanceRequired: true, topsoilStrippingDepth: 0.15,
      shoringRequired: false, shoringType: 'none',
      dewateringRequired: false, dewateringType: 'none',
      rockExcavationPercent: 0, importedFillRequired: false, importedFillPercent: 0,
    };
  }

  private generateFloors(floorArea: number, count: number, pattern: TrainedPattern): FloorDetails[] {
    let _fid = 0;
    const mkId = () => `pred_flr_${++_fid}`;
    const slab = pattern.slabType;
    const colsPerFloor = Math.max(6, Math.round(floorArea / 30));
    const perim = Math.round(Math.sqrt(floorArea) * 4);
    const internal = Math.round(Math.sqrt(floorArea) * 2);

    return Array.from({ length: count }, (_, i) => ({
      id: mkId(),
      name: i === 0 ? 'الأرضي' : `الدور ${i}`,
      area: floorArea,
      height: i === 0 ? pattern.floorHeight + 0.3 : pattern.floorHeight,
      slabType: slab,
      columnsCount: colsPerFloor,
      zones: [],
      perimeterWallLength: perim,
      internalWallLength: internal,
    }));
  }

  private generateRoomFinishes(pattern: TrainedPattern, quality: string, floorArea: number): RoomFinishSchedule[] {
    let _rid = 0;
    const mkId = () => `pred_rm_${++_rid}`;

    // Quality-based finish upgrades
    const upgradeFloor = (base: FinishMaterial): FinishMaterial => {
      if (quality === 'luxury') return base === 'ceramic_60x60' ? 'marble' : base === 'porcelain_120x60' ? 'marble' : base;
      if (quality === 'premium') return base === 'ceramic_60x60' ? 'porcelain_120x60' : base;
      if (quality === 'economy') return base === 'porcelain_120x60' ? 'ceramic_60x60' : base === 'marble' ? 'porcelain_120x60' : base;
      return base;
    };
    const upgradeWall = (base: FinishMaterial): FinishMaterial => {
      if (quality === 'luxury') return base === 'paint_plastic' ? 'paint_velvet' : base;
      if (quality === 'economy') return base === 'paint_velvet' ? 'paint_plastic' : base;
      return base;
    };

    if (pattern.roomPatterns.length === 0) {
      // Fallback: generate basic rooms
      return [
        { id: mkId(), roomName: 'صالة', roomType: 'living', length: 6, width: 5, height: 3.2, floorFinish: upgradeFloor('ceramic_60x60'), wallFinish: upgradeWall('paint_plastic'), ceilingFinish: 'gypsum_board', windowDoorRatio: 0.15, floorId: '' },
        { id: mkId(), roomName: 'مطبخ', roomType: 'kitchen', length: 4, width: 3, height: 3.0, floorFinish: 'ceramic_60x60', wallFinish: 'ceramic_30x60', ceilingFinish: 'paint_plastic', windowDoorRatio: 0.10, floorId: '', wetAreaWallHeight: 1.5 },
        { id: mkId(), roomName: 'حمام', roomType: 'bathroom', length: 2.5, width: 2, height: 2.8, floorFinish: 'ceramic_30x60', wallFinish: 'ceramic_30x60', ceilingFinish: 'paint_plastic', windowDoorRatio: 0.05, floorId: '', wetAreaWallHeight: 2.4 },
      ];
    }

    // Scale room dimensions based on area ratio
    const scaleFactor = Math.sqrt(floorArea / 200); // normalize to ~200m² base

    return pattern.roomPatterns.map(rp => ({
      id: mkId(),
      roomName: rp.name,
      roomType: rp.type,
      length: Math.round(Math.sqrt(rp.areaRatio * floorArea * 2) * 10) / 10 || 4,
      width: Math.round(Math.sqrt(rp.areaRatio * floorArea / 2) * 10) / 10 || 3,
      height: rp.type === 'bathroom' ? 2.8 : rp.type === 'storage' ? 3.0 : pattern.floorHeight,
      floorFinish: upgradeFloor(rp.floor),
      wallFinish: upgradeWall(rp.wall),
      ceilingFinish: rp.ceiling,
      windowDoorRatio: rp.type === 'bathroom' ? 0.05 : rp.type === 'corridor' ? 0.05 : 0.15,
      floorId: '',
      wetAreaWallHeight: rp.wetHeight,
    }));
  }

  private generateFacades(
    buildLength: number, buildWidth: number, totalHeight: number,
    pattern: TrainedPattern, quality: string
  ): FacadeSchedule[] {
    let _fid = 0;
    const mkId = () => `pred_fcd_${++_fid}`;

    const p = pattern.facadePattern;
    const primary = quality === 'luxury' ? 'stone_mechanical' as FacadeFinishType : p.primary;
    const secondary = quality === 'economy' ? 'plaster_paint' as FacadeFinishType : p.secondary;

    const dirs: Array<{ dir: FacadeDirection; w: number; finish: FacadeFinishType; wr: number }> = [
      { dir: 'north', w: buildWidth, finish: primary, wr: Math.min(0.50, p.windowRatio + 0.05) },
      { dir: 'south', w: buildWidth, finish: secondary, wr: p.windowRatio },
      { dir: 'east', w: buildLength, finish: secondary, wr: p.windowRatio },
      { dir: 'west', w: buildLength, finish: primary, wr: Math.min(0.50, p.windowRatio + 0.05) },
    ];

    return dirs.map(d => ({
      id: mkId(),
      direction: d.dir,
      width: Math.max(3, d.w),
      totalHeight: Math.max(3, totalHeight),
      finishType: d.finish,
      windowDoorRatio: d.wr,
    }));
  }

  private predictMEP(plotArea: number, floors: number, pattern: TrainedPattern): MEPConfig {
    const load = plotArea * floors;

    if (load < 800) {
      return {
        plumbing: { supplyPipeMaterial: 'ppr', drainPipeMaterial: 'upvc', waterHeaterType: 'central', mainLineSize_mm: 25, hasGroundTank: true, groundTankLiters: 2000, hasRoofTank: true, roofTankLiters: 1000 },
        electrical: { phaseType: 'single_220v', mainBreakerAmps: 63, hasBackupGenerator: false },
        hvac: { systemType: 'split', condenserLocation: 'roof' },
      };
    }
    if (load < 5000) {
      return {
        plumbing: { supplyPipeMaterial: 'ppr', drainPipeMaterial: 'upvc', waterHeaterType: 'central', mainLineSize_mm: 50, hasGroundTank: true, groundTankLiters: 10000, hasRoofTank: true, roofTankLiters: 5000 },
        electrical: { phaseType: 'three_phase_380v', mainBreakerAmps: 100, hasBackupGenerator: true },
        hvac: { systemType: 'central_ducted', condenserLocation: 'roof' },
      };
    }
    return {
      plumbing: { supplyPipeMaterial: 'ppr', drainPipeMaterial: 'hdpe', waterHeaterType: 'central', mainLineSize_mm: 63, hasGroundTank: true, groundTankLiters: 30000, hasRoofTank: true, roofTankLiters: 10000 },
      electrical: { phaseType: 'three_phase_380v', mainBreakerAmps: 100, hasBackupGenerator: true },
      hvac: { systemType: 'central_ducted', condenserLocation: 'roof' },
    };
  }

  private buildCostEstimate(costPerSqm: number, totalArea: number, config: BlueprintConfig): CostEstimate {
    const structure = Math.round(costPerSqm * 0.35);
    const finishing = Math.round(costPerSqm * 0.30);
    const mep = Math.round(costPerSqm * 0.25);
    const site = Math.round(costPerSqm * 0.10);

    return {
      structureCostPerSqm: structure,
      finishingCostPerSqm: finishing,
      mepCostPerSqm: mep,
      siteworksCostPerSqm: site,
      totalCostPerSqm: costPerSqm,
      totalProjectCost: costPerSqm * totalArea,
      breakdown: {
        'هيكل إنشائي': structure * totalArea,
        'تشطيبات': finishing * totalArea,
        'كهروميكانيك': mep * totalArea,
        'أعمال موقع': site * totalArea,
      },
    };
  }

  // ═══════════════════════════════════════════════════
  // VALIDATION & ERROR DETECTION (AI CHECKER)
  // ═══════════════════════════════════════════════════

  analyzeBlueprint(current: BlueprintConfig, projectType: ProjectType, plotArea: number): BlueprintError[] {
    const errors: BlueprintError[] = [];
    const prediction = this.predict({ projectType, plotArea, floorsCount: current.floors.length || 1 });
    const expected = prediction.config;

    // 1. Check Foundation
    if (current.foundation?.type !== expected.foundation?.type) {
        errors.push({
            type: 'warning',
            field: 'Foundation Type',
            message: `نوع الأساس المختار (${current.foundation?.type}) قد لا يتناسب مع حجم ونوع المشروع. الدماغ المعرفي يقترح استخدام (${expected.foundation?.type}) بناءً على الأحمال المتوقعة.`,
            expectedValue: expected.foundation?.type || '',
            actualValue: current.foundation?.type || ''
        });
    }

    // 2. Check Excavation Depth
    if (current.excavation && expected.excavation) {
        if (current.excavation.excavationDepth < expected.excavation.excavationDepth - 0.5) {
            errors.push({
                type: 'error',
                field: 'Excavation Depth',
                message: `عمق الحفر المدخل (${current.excavation.excavationDepth}م) غير كافٍ. بناءً على نوع المشروع وعدد الأدوار، المتوقع هو (${expected.excavation.excavationDepth}م) كحد أدنى.`,
                expectedValue: expected.excavation.excavationDepth,
                actualValue: current.excavation.excavationDepth
            });
        }
        if (expected.excavation.shoringRequired && !current.excavation.shoringRequired) {
             errors.push({
                type: 'error',
                field: 'Shoring',
                message: 'المشروع يحتاج إلى (سند جوانب حفر) بسبب العمق لتجنب انهيار التربة على المباني المجاورة.',
                expectedValue: 'مطلوب',
                actualValue: 'غير مطلوب'
            });
        }
    }

    // 3. Check Columns
    if ((current.columnWidth_cm || 0) < expected.columnWidth_cm || (current.columnDepth_cm || 0) < expected.columnDepth_cm) {
        errors.push({
            type: 'warning',
            field: 'Columns',
            message: `أبعاد الأعمدة الحالية (${current.columnWidth_cm}x${current.columnDepth_cm} سم) تبدو صغيرة على الأحمال المتوقعة للمشروع. يوصى بـ (${expected.columnWidth_cm}x${expected.columnDepth_cm} سم).`,
            expectedValue: `${expected.columnWidth_cm}x${expected.columnDepth_cm}`,
            actualValue: `${current.columnWidth_cm}x${current.columnDepth_cm}`
        });
    }

    // 4. Check Floor Heights
    if (current.floors && current.floors.length > 0) {
        const avgHeight = current.floors.reduce((acc, f) => acc + f.height, 0) / current.floors.length;
        if (avgHeight < 2.8) {
             errors.push({
                type: 'error',
                field: 'Floor Height',
                message: `متوسط ارتفاع السقف (${avgHeight.toFixed(1)}م) يعتبر منخفض جداً ومخالف لمتطلبات الكود (الحد الأدنى المقبول هندسياً 2.8م).`,
                expectedValue: '>= 2.8',
                actualValue: avgHeight.toFixed(1)
            });
        } else if (avgHeight > 5 && projectType === 'villa') {
             errors.push({
                type: 'warning',
                field: 'Floor Height',
                message: `ارتفاع السقف (${avgHeight.toFixed(1)}م) مرتفع جداً لفيلا سكنية، مما سيزيد من تكاليف التكييف بشكل غير مبرر.`,
                expectedValue: '<= 4.0',
                actualValue: avgHeight.toFixed(1)
            });
        }
    }

    return errors;
  }

  validateAccuracy(): { type: string; accuracy: number; details: string }[] {
    this.initialize();
    return BLUEPRINT_TEMPLATES.map(template => {
      const prediction = this.predict({
        projectType: template.projectType,
        plotArea: template.plotArea,
        floorsCount: template.floorsCount,
      });

      let score = 0;
      let total = 0;

      // Check foundation type
      total++; if (prediction.config.foundation?.type === template.config.foundation?.type) score++;
      // Check column width
      total++; if (prediction.config.columnWidth_cm === template.config.columnWidth_cm) score++;
      // Check excavation depth range
      total++;
      const predDepth = prediction.config.excavation?.excavationDepth || 0;
      const actDepth = template.config.excavation?.excavationDepth || 0;
      if (Math.abs(predDepth - actDepth) <= 0.5) score++;
      // Check MEP tier (generator)
      total++;
      if ((prediction.config.mepConfig?.electrical?.hasBackupGenerator || false) ===
          (template.config.mepConfig?.electrical?.hasBackupGenerator || false)) score++;
      // Check slab type
      total++;
      if (prediction.config.floors[0]?.slabType === template.config.floors[0]?.slabType) score++;

      const accuracy = Math.round((score / total) * 100);
      return {
        type: `${template.name.ar} (${template.id})`,
        accuracy,
        details: `${score}/${total} معايير صحيحة`,
      };
    });
  }

  /** Get training data summary */
  getTrainingSummary() {
    this.initialize();
    const types = [...new Set(this.patterns.map(p => p.projectType))];
    return {
      totalPatterns: this.patterns.length,
      projectTypes: types.length,
      types: types.map(t => ({
        type: t,
        count: this.patterns.filter(p => p.projectType === t).length,
        areaRange: [
          Math.min(...this.patterns.filter(p => p.projectType === t).map(p => p.plotAreaRange[0])),
          Math.max(...this.patterns.filter(p => p.projectType === t).map(p => p.plotAreaRange[1])),
        ],
      })),
    };
  }
}

// Singleton
export const blueprintIntelligence = new BlueprintIntelligenceEngine();
