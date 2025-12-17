import { AppState, CalculatedItem, CustomParams, SupplierOption, BaseItem, Language, AreaBreakdownSummary, BlueprintConfig } from '../types';
import { ITEMS_DATABASE, REF_LAND_AREA, REF_BUILD_AREA, SOIL_MULTIPLIERS, EST_COST_PER_SQM } from '../constants';

export interface CalculationResult {
    items: CalculatedItem[];
    totalDirect: number;
    totalOverhead: number;
    totalProfit: number;
    finalPrice: number;
    totalConcreteVolume: number;
    totalLaborCost: number;
    totalMaterialCost: number;
    areaBreakdown: AreaBreakdownSummary;  // Add area breakdown to results
}

// Calculate Area Breakdown from Blueprint
export const calculateAreaBreakdown = (blueprint: BlueprintConfig): AreaBreakdownSummary => {
    let totalBuildArea = 0;
    let roomsArea = 0;
    let commonArea = 0;
    let closedArea = 0;
    let openArea = 0;
    let annexesArea = 0;
    let serviceArea = 0;
    let occupiedArea = 0;
    let availableArea = 0;

    blueprint.floors.forEach(floor => {
        totalBuildArea += floor.area;

        floor.zones.forEach(zone => {
            switch (zone.type) {
                case 'room':
                    roomsArea += zone.area;
                    break;
                case 'common':
                case 'corridor':
                case 'stairwell':
                case 'elevator':
                    commonArea += zone.area;
                    break;
                case 'closed':
                case 'parking':
                    closedArea += zone.area;
                    break;
                case 'open':
                    openArea += zone.area;
                    break;
                case 'annex':
                    annexesArea += zone.area;
                    break;
                case 'service':
                    serviceArea += zone.area;
                    break;
            }

            // Usage tracking
            if (zone.isOccupied) {
                occupiedArea += zone.area;
            }
            if (zone.isAvailable) {
                availableArea += zone.area;
            }
        });
    });

    // If no zones defined, estimate based on floor area
    if (roomsArea === 0 && commonArea === 0 && blueprint.floors.length > 0) {
        // Default breakdown: 60% rooms, 15% common, 10% service, 10% closed, 5% open
        roomsArea = totalBuildArea * 0.60;
        commonArea = totalBuildArea * 0.15;
        serviceArea = totalBuildArea * 0.10;
        closedArea = totalBuildArea * 0.10;
        openArea = totalBuildArea * 0.05;
        occupiedArea = totalBuildArea * 0.75;
        availableArea = totalBuildArea * 0.25;
    }

    // Calculate percentages
    const calcPercent = (val: number) => totalBuildArea > 0 ? Math.round((val / totalBuildArea) * 100) : 0;

    return {
        totalBuildArea,
        floorsCount: blueprint.floors.length,
        roomsArea,
        commonArea,
        closedArea,
        openArea,
        annexesArea,
        serviceArea,
        occupiedArea,
        availableArea,
        roomsPercent: calcPercent(roomsArea),
        commonPercent: calcPercent(commonArea),
        closedPercent: calcPercent(closedArea),
        openPercent: calcPercent(openArea),
        annexesPercent: calcPercent(annexesArea),
        servicePercent: calcPercent(serviceArea),
        occupiedPercent: calcPercent(occupiedArea),
        availablePercent: calcPercent(availableArea),
    };
};

export const calculateProjectCosts = (state: AppState): CalculationResult => {
    const language = state.language;

    // Helper for translated dynamic strings
    const tr = (key: string) => {
        const dict: Record<string, Record<Language, string>> = {
            'rocky': { ar: ' (حفر صخري)', en: ' (Rocky Excavation)', fr: ' (Excavation Rocheuse)', zh: ' (岩石挖掘)' },
            'depth': { ar: ' (عمق ', en: ' (Depth ', fr: ' (Profondeur ', zh: ' (深度 ' },
            'm': { ar: 'م)', en: 'm)', fr: 'm)', zh: 'm)' },
            'thick': { ar: ' (سماكة ', en: ' (Thickness ', fr: ' (Épaisseur ', zh: ' (厚度 ' },
            'cm': { ar: 'سم)', en: 'cm)', fr: 'cm)', zh: 'cm)' },
            'grp': { ar: ' (نظام GRP)', en: ' (GRP System)', fr: ' (Système GRP)', zh: ' (GRP 系统)' },
            'optimal': { ar: ' ⚡ سعر أمثل', en: ' ⚡ Optimal Price', fr: ' ⚡ Prix Optimal', zh: ' ⚡ 最优价格' },
            'human_staff': { ar: 'كادر بشري', en: 'Human Staff', fr: 'Personnel', zh: '员工' },
            'month': { ar: 'شهر', en: 'Month', fr: 'Mois', zh: '月' },
            'load_bal': { ar: ' (زيادة حديد للأحمال)', en: ' (Increased Steel for Loads)', fr: ' (Acier accru)', zh: ' (增加钢材)' },
            'exc_depth': { ar: ' (عمق الحفر ', en: ' (Excavation depth ', fr: ' (Profondeur excavation ', zh: ' (挖掘深度 ' },
            'subsidence': { ar: ' | هبوط ', en: ' | Subsidence ', fr: ' | Affaissement ', zh: ' | 沉降 ' },
            'layers': { ar: ' طبقات)', en: ' layers)', fr: ' couches)', zh: ' 层)' },
            'compact': { ar: ' (دمك ', en: ' (Compaction ', fr: ' (Compactage ', zh: ' (压实 ' },
            'density': { ar: ' | كثافة ', en: ' | Density ', fr: ' | Densité ', zh: ' | 密度 ' },
            'kg_m3': { ar: ' كجم/م³)', en: ' kg/m³)', fr: ' kg/m³)', zh: ' kg/m³)' }
        };
        return dict[key]?.[language] || '';
    };

    // --- 1. Calculate Room Aggregates ---
    let totalRoomsArea = 0;
    let totalSockets = 0;
    let totalSwitches = 0;
    let totalACPoints = 0;
    let bathroomsCount = 0;
    let kitchensCount = 0;
    let roomsCount = 0;

    state.rooms.forEach(room => {
        totalRoomsArea += (room.area * room.count);
        totalSockets += (room.sockets * room.count);
        totalSwitches += (room.switches * room.count);
        totalACPoints += (room.acPoints * room.count);
        roomsCount += room.count;
        if (room.type === 'bathroom') bathroomsCount += room.count;
        if (room.type === 'kitchen') kitchensCount += room.count;
    });

    // --- 2. Calculate Facade Aggregates ---
    const facadeAreas = {
        stone: 0,
        glass: 0,
        paint: 0,
        cladding: 0
    };
    state.facades.forEach(f => {
        if (f.material === 'stone') facadeAreas.stone += f.area;
        else if (f.material === 'glass') facadeAreas.glass += f.area;
        else if (f.material === 'cladding') facadeAreas.cladding += f.area;
        else facadeAreas.paint += f.area;
    });

    const estimatedWireLength = (totalSockets + totalSwitches) * 8 + (state.rooms.length * 15);
    const calculatedFinishArea = totalRoomsArea * 1.05;
    const calculatedPaintArea = totalRoomsArea * 3.0;

    const landScale = state.landArea / REF_LAND_AREA;
    const buildScale = state.buildArea / REF_BUILD_AREA;
    const estimatedProjectValue = state.buildArea * (EST_COST_PER_SQM[state.projectType] || 1800);

    // --- 3. Prepare Items List ---
    let activeItems = ITEMS_DATABASE.filter(
        (item) => item.type === 'all' || item.type === state.projectType
    );
    activeItems = activeItems.filter(item => item.category !== 'manpower');

    // Generate Dynamic Manpower Items
    const teamItems: BaseItem[] = state.team.map((member, idx) => ({
        id: `team-${idx}`,
        category: 'manpower',
        type: 'all',
        name: { ar: member.role, en: member.role, fr: member.role, zh: member.role },
        unit: tr('month'),
        qty: member.durationMonths,
        baseMaterial: 0,
        baseLabor: member.monthlyCost * member.count,
        waste: 0,
        suppliers: [{ id: 'hr_1', name: { ar: 'كادر بشري', en: 'Staff', fr: 'Personnel', zh: '员工' }, tier: 'standard', priceMultiplier: 1.0 }],
        sbc: 'HR-Dyn',
        soilFactor: false,
        dependency: 'fixed'
    }));

    activeItems = [...activeItems, ...teamItems, ...state.customItems];


    let totalDirect = 0;
    let totalFinalPrice = 0;
    let totalConcreteVolume = 0;
    let totalLaborCost = 0;
    let totalMaterialCost = 0;

    // --- PRE-CALCULATE STRUCTURAL QUANTITIES FROM BLUEPRINT ---
    let calculatedConcreteStruct = 0;
    let calculatedSteelStruct = 0;

    if (state.blueprint) {
        state.blueprint.floors.forEach(floor => {
            let slabFactor = 0.22; // solid
            if (floor.slabType === 'flat') slabFactor = 0.32;
            if (floor.slabType === 'hordi') slabFactor = 0.28;
            if (floor.slabType === 'waffle') slabFactor = 0.35;

            calculatedConcreteStruct += (floor.area * slabFactor);
            calculatedConcreteStruct += (floor.columnsCount * floor.height * 0.3 * 0.5);

            let steelFactor = 25;
            if (floor.slabType === 'flat') steelFactor = 35;
            if (floor.slabType === 'hordi') steelFactor = 30;
            calculatedSteelStruct += (floor.area * steelFactor) / 1000;
        });

        calculatedConcreteStruct *= 1.4;
        calculatedSteelStruct *= 1.3;
    }

    // --- 4. Calculate Items ---
    const intermediateItems = activeItems.map(item => {
        let qty = item.qty;

        // --- Dependency Logic ---
        if (!item.isCustom) {
            if (item.dependency === 'land_area') {
                if (item.id === "08.01") qty = Math.sqrt(state.landArea) * 4;
                else if (item.id === "08.03") qty = Math.max(0, state.landArea - (state.buildArea / state.floors));
                else qty *= landScale;
            }
            else if (item.dependency === 'build_area') {
                if (state.blueprint && item.category === 'structure' && item.unit === 'م3') {
                    if (item.id === "02.02" || item.id === "02.03") qty = calculatedConcreteStruct / 2;
                    else qty *= buildScale;
                }
                else if (state.blueprint && item.category === 'structure' && item.unit === 'طن') {
                    qty = calculatedSteelStruct;
                }
                else if (item.id === "02.06") qty = state.buildArea * 1.5;
                else if (item.id === "04.02") qty = state.buildArea;
                else if (item.id === "04.07") qty = state.buildArea * 1.1;
                else if (item.id === "04.09") qty = roomsCount + bathroomsCount;
                else if (item.id === "04.11") qty = state.buildArea * 0.15;
                else if (item.id === "06.07") qty = Math.ceil(state.buildArea / 4);
                else if (item.id === "07.01") qty = roomsCount * 12;
                else qty *= buildScale;
            }
            else if (item.dependency === 'rooms_area') {
                if (item.id.includes('paint') || item.id === "04.01") qty = calculatedPaintArea;
                else if (item.id === "04.04") qty = totalRoomsArea * 0.4;
                else if (item.id === "04.05") qty = totalRoomsArea * 0.6;
                else if (item.id === "04.06") qty = (bathroomsCount + kitchensCount) * 25;
                else if (item.id === "05.01" || item.id === "05.02") qty = (bathroomsCount + kitchensCount) * 8;
                else qty = calculatedFinishArea;
            }
            else if (item.dependency === 'sockets_count') qty = totalSockets;
            else if (item.dependency === 'switches_count') qty = totalSwitches;
            else if (item.dependency === 'wire_length') qty = estimatedWireLength;
            else if (item.dependency === 'fixed') {
                if (item.id === "05.06") qty = bathroomsCount + kitchensCount;
                if (item.id === "05.07") qty = bathroomsCount;
                if (item.id === "05.08") qty = Math.ceil(Math.sqrt(state.landArea) / 5);
                if (item.id === "07.02") qty = state.rooms.reduce((acc, r) => acc + r.acPoints * r.count, 0);
                if (item.id === "07.03") qty = bathroomsCount + kitchensCount;
            }
            else if (item.dependency === 'facade_stone') qty = facadeAreas.stone;
            else if (item.dependency === 'facade_glass') qty = facadeAreas.glass;
            else if (item.dependency === 'facade_cladding') qty = facadeAreas.cladding;
            else if (item.dependency === 'facade_paint') qty = facadeAreas.paint;
        }

        // Custom Params Logic
        const activeParams: CustomParams = { ...item.defaultParams, ...state.itemOverrides[item.id] };

        // --- MANUAL QUANTITY OVERRIDE ---
        if (activeParams.manualQty !== undefined && activeParams.manualQty >= 0) {
            qty = activeParams.manualQty;
        }

        const defaultSupplierIndex = item.suppliers.findIndex(s => s.tier === 'standard');
        const defaultSupplier = defaultSupplierIndex > -1 ? item.suppliers[defaultSupplierIndex] : item.suppliers[0];

        const selectedSupplier = activeParams.supplierId
            ? (item.suppliers.find(s => s.id === activeParams.supplierId) || defaultSupplier)
            : defaultSupplier;

        // --- EXCAVATION DEPTH CALCULATION ---
        // For excavation items (01.01), calculate volume based on land area and depth
        if (activeParams.excavationDepth !== undefined && item.category === 'site' && item.id === '01.01') {
            const baseDepth = item.defaultParams?.excavationDepth || 2.5;
            qty = qty * (activeParams.excavationDepth / baseDepth);
        }
        // Legacy depth support
        if (activeParams.depth !== undefined && item.category === 'site' && activeParams.excavationDepth === undefined) {
            qty = qty * (activeParams.depth / (item.defaultParams?.depth || 2.5));
        }

        // --- SUBSIDENCE RATIO CALCULATION ---
        // For backfill items (01.02), add extra volume based on subsidenceRatio
        // Subsidence means soil settles after compaction, so we need more material
        if (activeParams.subsidenceRatio !== undefined && item.category === 'site' && item.id === '01.02') {
            const subsidenceFactor = 1 + activeParams.subsidenceRatio;
            qty = qty * subsidenceFactor;
        }

        // --- COMPACTION LAYERS CALCULATION ---
        // More layers = more work = higher cost (for 01.02b)
        if (activeParams.compactionLayers !== undefined && item.id === '01.02b') {
            const baseLayers = item.defaultParams?.compactionLayers || 3;
            qty = qty * (activeParams.compactionLayers / baseLayers);
        }

        if (['عدد', 'نقطة', 'طقم', 'مجموعة', 'طلعة', 'رخصة', 'بوليصة', 'زيارة', 'حبة', 'شهر', 'يومية', 'لفة'].includes(item.unit)) qty = Math.ceil(qty);
        else qty = Math.round(qty * 100) / 100;

        if (item.category === 'structure' && item.unit === 'م3') {
            totalConcreteVolume += qty;
        }

        let matCost = item.baseMaterial;
        let labCost = item.baseLabor;

        matCost = matCost * selectedSupplier.priceMultiplier;

        if (state.location === 'jeddah' && (item.category === 'structure' || item.category === 'site')) matCost *= 1.02;
        if (item.soilFactor) labCost *= SOIL_MULTIPLIERS[state.soilType];
        if (item.id === "00.02") matCost = estimatedProjectValue * 0.015;

        // Param overrides
        if (activeParams.thickness !== undefined && item.unit === 'م2') {
            matCost *= (activeParams.thickness / (item.defaultParams?.thickness || 15));
        }
        if (activeParams.cementContent !== undefined) {
            matCost += ((activeParams.cementContent - (item.defaultParams?.cementContent || 5)) * 18);
        }

        // --- LOAD BALANCING (Steel Ratio) ---
        // If steelRatio is present (usually for concrete items), we increase the cost 
        // to simulate the extra steel required for higher loads within that concrete item price
        // OR if this is the steel item itself, we might adjust based on ratio. 
        // NOTE: In this DB, steel is a separate item (02.04). 
        // So for "Concrete" items, steelRatio might imply reinforcement additives or heavier mix.
        // However, usually "balancing with loads" implies changing the amount of steel. 
        // If the item is "Reinforced Concrete" (02.02), we can simulate extra cost here.
        if (activeParams.steelRatio !== undefined) {
            // Base ratio assumption: 80kg/m3. 
            // If user puts 120kg/m3, we add cost. 
            // Steel price approx 3 SAR/kg
            const baseRatio = 80;
            const diff = activeParams.steelRatio - baseRatio;
            if (diff > 0) {
                matCost += (diff * 3); // Add cost of extra steel to the concrete item directly
            }
        }

        // --- EXECUTION METHOD ADJUSTMENTS ---
        if (state.executionMethod === 'subcontractor' && item.category !== 'manpower') {
            labCost *= 1.20;
        }
        if (state.executionMethod === 'turnkey') {
            labCost *= 1.10;
            matCost *= 1.10;
        }

        const wasteCost = matCost * item.waste;
        const directUnitCost = matCost + wasteCost + labCost;

        totalLaborCost += (labCost * qty);
        totalMaterialCost += ((matCost + wasteCost) * qty);

        return {
            ...item,
            qty,
            matCost,
            labCost,
            wasteCost,
            directUnitCost,
            activeParams,
            selectedSupplier,
            isManualQty: activeParams.manualQty !== undefined
        };
    });

    totalDirect = intermediateItems.reduce((acc, item) => acc + (item.directUnitCost * item.qty), 0);
    const totalProjectCost = totalDirect + state.fixedOverhead;

    let globalProfitPercentage = 0;
    if (state.pricingStrategy === 'target_roi') {
        const targetProfitAmount = state.totalInvestment * (state.targetROI / 100);
        if (totalProjectCost > 0) {
            globalProfitPercentage = targetProfitAmount / totalProjectCost;
        }
    } else {
        globalProfitPercentage = state.profitMargin / 100;
    }

    const overheadPerItem = activeItems.length > 0 ? state.fixedOverhead / activeItems.length : 0;

    const finalItems: CalculatedItem[] = intermediateItems.map(item => {
        let displayName = item.name[language] || item.name['ar'] || 'Item';

        if (state.soilType === 'rocky_hard' && item.soilFactor) displayName += tr('rocky');
        if (item.activeParams?.depth) displayName += `${tr('depth')}${item.activeParams.depth}${tr('m')}`;
        if (item.activeParams?.thickness) displayName += `${tr('thick')}${item.activeParams.thickness}${tr('cm')}`;
        if (item.activeParams?.tankType === 'grp') displayName += tr('grp');
        // Add visual indicator for load balancing
        if (item.activeParams?.steelRatio && item.activeParams.steelRatio > 80) displayName += tr('load_bal');

        // Excavation depth display
        if (item.activeParams?.excavationDepth && item.id === '01.01') {
            displayName += `${tr('exc_depth')}${item.activeParams.excavationDepth}${tr('m')}`;
            if (item.activeParams?.subsidenceRatio) {
                displayName += `${tr('subsidence')}${Math.round(item.activeParams.subsidenceRatio * 100)}%`;
            }
        }

        // Backfill subsidence display
        if (item.activeParams?.subsidenceRatio && item.id === '01.02') {
            displayName += `${tr('subsidence')}${Math.round(item.activeParams.subsidenceRatio * 100)}%`;
            if (item.activeParams?.backfillDensity) {
                displayName += `${tr('density')}${item.activeParams.backfillDensity}${tr('kg_m3')}`;
            }
        }

        // Compaction layers display
        if (item.activeParams?.compactionLayers && item.id === '01.02b') {
            displayName += `${tr('compact')}${item.activeParams.compactionLayers}${tr('layers')}`;
        }

        const overheadUnitShare = item.qty > 0 ? (overheadPerItem / (item.qty || 1)) : 0;
        const totalUnitCost = item.directUnitCost + overheadUnitShare;

        let itemProfitAmount = 0;
        let isOptimal = false;

        if (item.activeParams?.elasticity !== undefined && !item.excludeProfit) {
            const Ed = item.activeParams.elasticity;
            if (Ed < -1) {
                const optimalMarkup = -1 / (1 + Ed);
                const optimalPrice = item.directUnitCost * (1 + optimalMarkup);
                itemProfitAmount = optimalPrice - totalUnitCost;
                isOptimal = true;
                displayName += tr('optimal');
            } else {
                itemProfitAmount = item.excludeProfit ? 0 : (totalUnitCost * globalProfitPercentage);
            }
        } else {
            itemProfitAmount = item.excludeProfit ? 0 : (totalUnitCost * globalProfitPercentage);
        }

        let calculatedFinalUnitPrice = totalUnitCost + itemProfitAmount;

        if (state.globalPriceAdjustment !== 0) {
            calculatedFinalUnitPrice *= (1 + (state.globalPriceAdjustment / 100));
        }

        let usedUnitPrice = calculatedFinalUnitPrice;
        let isManual = false;

        if (item.activeParams?.manualPrice !== undefined && item.activeParams.manualPrice > 0) {
            usedUnitPrice = item.activeParams.manualPrice;
            isManual = true;
        }

        const totalLinePrice = usedUnitPrice * item.qty;
        totalFinalPrice += totalLinePrice;

        return {
            ...item,
            displayName,
            overheadUnitShare,
            totalUnitCost,
            profitAmount: itemProfitAmount,
            finalUnitPrice: calculatedFinalUnitPrice,
            usedPrice: usedUnitPrice,
            totalLinePrice,
            isOptimalPrice: isOptimal,
            isManualPrice: isManual
        };
    });

    const totalProfit = totalFinalPrice - totalDirect - state.fixedOverhead;

    // Calculate area breakdown from blueprint
    const areaBreakdown = calculateAreaBreakdown(state.blueprint);

    return {
        items: finalItems,
        totalDirect,
        totalOverhead: state.fixedOverhead,
        totalProfit,
        finalPrice: totalFinalPrice,
        totalConcreteVolume,
        totalLaborCost,
        totalMaterialCost,
        areaBreakdown
    };
};