/**
 * ARBA-Ops v8.0 — Engineering Drawings Panel (Full Overhaul)
 * 16 لوحة هندسية شاملة — تغطي معمارية + إنشائية + MEP + جداول
 *
 * ✅ Title Block موحد لكل لوحة
 * ✅ Zone-based floor plans مع جدران/أبواب/نوافذ/سلالم
 * ✅ 4 واجهات (أمامية + خلفية + يمنى + يسرى)
 * ✅ MEP كامل على المسقط (كل الغرف + مواسير + كابلات + وحدات)
 * ✅ لوحات جديدة: سطح + جدول أبواب + جدول تشطيبات
 */

import React, { useMemo, createContext, useContext } from 'react';
import {
  Download, FileText, MapPin, Layers, ArrowDown, Columns3,
  Wrench, Droplets, Zap, Thermometer, Grid3X3, Building2, Ruler,
  Sun, Table2, PaintBucket
} from 'lucide-react';
import { BlueprintConfig, FloorDetails, RoomFinishSchedule, Language } from '../types';
import { downloadDxf } from '../services/dxfExportService';
import {
  getColumnSpec, BEAM_SPECS, FOOTING_SPECS, SLAB_REBAR_SPECS,
  NECK_COLUMN_SPEC, REBAR_WEIGHT_KG_PER_M,
  calculateBarBendingSchedule, BarBendingItem,
  PLUMBING_FIXTURE_DATA, DEFAULT_FIXTURES_BY_ROOM,
  ELECTRICAL_LOADS, CIRCUIT_SPECS, DEFAULT_LIGHT_POINTS,
  COOLING_LOAD_BTU_PER_M2, HVAC_CONSTANTS,
  FORMWORK_DETAILS, ColumnSpec, BeamSpec,
} from '../services/engineeringConstants';

interface DrawingsPanelProps {
  blueprint: BlueprintConfig;
  language: Language;
  /** بيانات المشروع والمالك — Title Block metadata */
  projectMeta?: {
    ownerName?: string;    // اسم المالك
    projectName?: string;  // اسم المشروع
    planNumber?: string;   // رقم المخطط
    companyName?: string;  // اسم الشركة
    permitNumber?: string; // رقم الرخصة
  };
}

// =================== Helpers ===================

/** Distribute rooms to floors smart: by floorId or index fallback */
function getRoomsForFloor(rooms: RoomFinishSchedule[], floors: FloorDetails[], floorIdx: number): RoomFinishSchedule[] {
  const floor = floors[floorIdx];
  if (!floor) return [];
  // Try exact floorId match first
  const byId = rooms.filter(r => r.floorId === floor.id);
  if (byId.length > 0) return byId;
  // Fallback: split rooms evenly across floors
  const perFloor = Math.ceil(rooms.length / floors.length);
  return rooms.slice(floorIdx * perFloor, (floorIdx + 1) * perFloor);
}

/** Zone-based room layout for professional floor plans */
interface LayoutRoom {
  x: number; y: number; w: number; h: number;
  room: RoomFinishSchedule;
}

function layoutRoomsZoneBased(rooms: RoomFinishSchedule[], W: number, H: number, sc: number): LayoutRoom[] {
  if (rooms.length === 0) return [];
  const zones: Record<string, RoomFinishSchedule[]> = { front: [], middle: [], back: [] };
  rooms.forEach(r => {
    if (['majlis', 'living', 'office'].includes(r.roomType)) zones.front.push(r);
    else if (['kitchen', 'corridor', 'storage'].includes(r.roomType)) zones.middle.push(r);
    else zones.back.push(r);
  });
  const allZones = [zones.front, zones.middle, zones.back].filter(z => z.length > 0);
  const result: LayoutRoom[] = [];
  const zoneH = H / allZones.length;
  allZones.forEach((zoneRooms, zi) => {
    const totalArea = zoneRooms.reduce((s, r) => s + r.length * r.width, 0);
    let cx = 0;
    zoneRooms.forEach(room => {
      const fraction = (room.length * room.width) / totalArea;
      const rw = Math.max(W * fraction, 30);
      result.push({ x: cx, y: zi * zoneH, w: rw, h: zoneH, room });
      cx += rw;
    });
    // normalize widths to fill W
    const totalW = result.filter((_, i) => i >= result.length - zoneRooms.length).reduce((s, r) => s + r.w, 0);
    if (totalW > 0) {
      const scale = W / totalW;
      let nx = 0;
      for (let i = result.length - zoneRooms.length; i < result.length; i++) {
        result[i].w *= scale;
        result[i].x = nx;
        nx += result[i].w;
      }
    }
  });
  return result;
}

// =================== Title Block Context ===================
interface TitleBlockMeta {
  owner: string;
  project: string;
  plan: string;
  company: string;
  permit: string;
  date: string;
}
const TitleBlockContext = createContext<TitleBlockMeta>({
  owner: '', project: '', plan: '', company: '', permit: '', date: '',
});

const DrawingsPanel: React.FC<DrawingsPanelProps> = ({ blueprint: bp, language, projectMeta }) => {
  const isAr = language === 'ar';

  // Title block metadata — available to all sheets via context
  const tbMeta: TitleBlockMeta = useMemo(() => ({
    owner: projectMeta?.ownerName || '',
    project: projectMeta?.projectName || (isAr ? 'مشروع أربا' : 'ARBA Project'),
    plan: projectMeta?.planNumber || '',
    company: projectMeta?.companyName || (isAr ? 'أربا للتسعير الهندسي' : 'ARBA Engineering'),
    permit: projectMeta?.permitNumber || '',
    date: new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US'),
  }), [projectMeta, isAr]);

  const floorsCount = bp.floors.length;
  const colSpec = getColumnSpec(floorsCount);
  const beamSpec = BEAM_SPECS.tie_beam;
  const buildableW = bp.plotWidth - bp.setbackSide * 2;
  const buildableL = bp.plotLength - bp.setbackFront - (bp.setbackRear || 2);
  const buildableArea = buildableW * buildableL;
  const colCount = bp.floors[0]?.columnsCount || Math.ceil(buildableArea / 16);
  const rooms = bp.roomFinishes || [];
  const colW_cm = bp.columnWidth_cm || colSpec.width_cm;
  const colD_cm = bp.columnDepth_cm || colSpec.depth_cm;

  const bbs = useMemo(() => {
    if (!bp.floors[0] || !bp.foundation) return [];
    const floorHeight = bp.floors[0].height || 3.0;
    const footingW = bp.foundation.footingWidth || 1.2;
    const footingD = bp.foundation.footingDepth || 0.5;
    const perimLen = bp.floors[0].perimeterWallLength || Math.sqrt(buildableArea) * 4;
    const intLen = bp.floors[0].internalWallLength || perimLen * 0.5;
    const slabType = bp.floors[0].slabType || 'solid';
    return calculateBarBendingSchedule({
      columnsCount: colCount, columnSpec: colSpec, columnHeight_m: floorHeight, beamSpec,
      beamTotalLength_m: perimLen + intLen,
      footingSpec: FOOTING_SPECS[bp.foundation.type === 'raft' ? 'raft' : bp.foundation.type === 'strip_footings' ? 'strip' : 'isolated'],
      footingWidth_m: footingW, footingDepth_m: footingD, footingsCount: colCount,
      neckHeight_m: bp.foundation.neckColumnHeight || 0.5,
      slabSpec: SLAB_REBAR_SPECS[slabType] || SLAB_REBAR_SPECS.solid, slabArea_m2: bp.floors[0].area,
    });
  }, [bp]);
  const totalSteelKg = bbs.reduce((s, b) => s + b.totalWeight_kg, 0);

  let sheetNum = 0;
  const nextSheet = () => ++sheetNum;

  return (
    <TitleBlockContext.Provider value={tbMeta}>
    <div className="space-y-6">
      {/* ============ HEADER ============ */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl text-white">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <FileText className="w-6 h-6 text-rose-400" />
            {isAr ? 'الرسومات الهندسية — 16 لوحة شاملة' : 'Engineering Drawings — 16 Complete Sheets'}
          </h2>
          <button onClick={() => downloadDxf(bp, 'ARBA_Project')}
            className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            {isAr ? 'تحميل DXF كامل للأوتوكاد' : 'Download Full DXF for AutoCAD'}
          </button>
        </div>
        <p className="text-slate-400 text-sm">
          {isAr ? '16 لوحة: موقع، حفر، أساسات، أعمدة، حديد، شدة، مساقط، قطاع، واجهات، سطح، سباكة، كهرباء، تكييف، أبواب، تشطيبات' : '16 sheets covering architectural, structural, and MEP drawings'}
        </p>
      </div>

      {/* 1. SITE PLAN */}
      <DrawingCard title={isAr ? 'مخطط الموقع العام' : 'Site Plan'} icon={<MapPin />} number={nextSheet()} sheetId="A-01">
        <SvgSitePlan bp={bp} />
      </DrawingCard>

      {/* 2. EXCAVATION */}
      <DrawingCard title={isAr ? 'مخطط الحفر والمناسيب' : 'Excavation Plan'} icon={<ArrowDown />} number={nextSheet()} sheetId="S-01">
        <SvgExcavationPlan bp={bp} />
      </DrawingCard>

      {/* 3. FOUNDATION */}
      <DrawingCard title={isAr ? 'مخطط الأساسات' : 'Foundation Plan'} icon={<Grid3X3 />} number={nextSheet()} sheetId="S-02">
        <SvgFoundationPlan bp={bp} colSpec={colSpec} colW={colW_cm} colD={colD_cm} />
      </DrawingCard>

      {/* 4. COLUMN LAYOUT */}
      <DrawingCard title={isAr ? 'مخطط الأعمدة' : 'Column Layout'} icon={<Columns3 />} number={nextSheet()} sheetId="S-03">
        <SvgColumnLayout bp={bp} colSpec={colSpec} colW={colW_cm} colD={colD_cm} />
      </DrawingCard>

      {/* 5. REBAR + BBS */}
      <DrawingCard title={isAr ? 'تفاصيل حديد التسليح + جدول الحصر' : 'Rebar Details + BBS'} icon={<Wrench />} number={nextSheet()} sheetId="S-04">
        <SvgRebarDetails colSpec={colSpec} beamSpec={beamSpec} colW={colW_cm} colD={colD_cm} />
        <BarBendingTable bbs={bbs} totalKg={totalSteelKg} isAr={isAr} />
      </DrawingCard>

      {/* 6. FORMWORK */}
      <DrawingCard title={isAr ? 'مخطط الشدة الخشبية' : 'Formwork Plan'} icon={<Layers />} number={nextSheet()} sheetId="S-05">
        <SvgFormworkPlan bp={bp} />
      </DrawingCard>

      {/* 7. FLOOR PLANS */}
      {bp.floors.map((floor, idx) => (
        <DrawingCard key={floor.id} title={`${floor.name} — ${floor.area} ${isAr ? 'م²' : 'm²'}`} icon={<Building2 />} number={nextSheet()} sheetId={`A-${String(idx + 2).padStart(2, '0')}`}>
          <SvgFloorPlanV2 bp={bp} floor={floor} floorIdx={idx} allRooms={rooms} colW={colW_cm} colD={colD_cm} />
        </DrawingCard>
      ))}

      {/* 8. ROOF PLAN (NEW!) */}
      <DrawingCard title={isAr ? 'مخطط السطح' : 'Roof Plan'} icon={<Sun />} number={nextSheet()} sheetId="A-10">
        <SvgRoofPlan bp={bp} />
      </DrawingCard>

      {/* 9. CROSS SECTION */}
      <DrawingCard title={isAr ? 'القطاع الرأسي' : 'Cross Section'} icon={<Ruler />} number={nextSheet()} sheetId="A-11">
        <SvgCrossSection bp={bp} colSpec={colSpec} />
      </DrawingCard>

      {/* 10. ELEVATIONS (4) */}
      <DrawingCard title={isAr ? 'الواجهات — 4 واجهات' : 'Elevations — 4 Views'} icon={<Building2 />} number={nextSheet()} sheetId="A-12">
        <SvgElevations bp={bp} />
      </DrawingCard>

      {/* 11. PLUMBING */}
      <DrawingCard title={isAr ? 'مخطط السباكة' : 'Plumbing Plan'} icon={<Droplets />} number={nextSheet()} sheetId="M-01">
        <SvgPlumbingPlan bp={bp} rooms={rooms} />
      </DrawingCard>

      {/* 12. ELECTRICAL */}
      <DrawingCard title={isAr ? 'مخطط الكهرباء' : 'Electrical Plan'} icon={<Zap />} number={nextSheet()} sheetId="E-01">
        <SvgElectricalPlan bp={bp} rooms={rooms} />
      </DrawingCard>

      {/* 13. HVAC */}
      <DrawingCard title={isAr ? 'مخطط التكييف' : 'HVAC Plan'} icon={<Thermometer />} number={nextSheet()} sheetId="M-02">
        <SvgHVACPlan bp={bp} rooms={rooms} />
      </DrawingCard>

      {/* 14. DOOR & WINDOW SCHEDULE (NEW!) */}
      <DrawingCard title={isAr ? 'جدول الأبواب والنوافذ' : 'Door & Window Schedule'} icon={<Table2 />} number={nextSheet()} sheetId="A-13">
        <DoorWindowSchedule rooms={rooms} isAr={isAr} />
      </DrawingCard>

      {/* 15. FINISH SCHEDULE (NEW!) */}
      <DrawingCard title={isAr ? 'جدول التشطيبات' : 'Finish Schedule'} icon={<PaintBucket />} number={nextSheet()} sheetId="A-14">
        <FinishSchedule rooms={rooms} isAr={isAr} />
      </DrawingCard>
    </div>
    </TitleBlockContext.Provider>
  );
};

// =================== Title Block — Professional ===================
/**
 * إطار رسمي موحد لجميع اللوحات — Title Block
 * يعرض: اسم المالك، اسم المشروع، رقم المخطط، رقم اللوحة، المقياس، اسم الشركة
 */
const TitleBlock: React.FC<{
  width: number; y: number; title: string; titleEn: string;
  sheetId?: string; scale?: string;
  meta?: {
    owner?: string; project?: string; plan?: string;
    company?: string; permit?: string; date?: string;
  };
}> = ({ width, y, title, titleEn, sheetId, scale, meta: metaProp }) => {
  const ctxMeta = useContext(TitleBlockContext);
  const meta = metaProp || ctxMeta;
  const tbH = 60; // taller for professional data
  const hasOwner = meta?.owner && meta.owner.length > 0;
  const midX = width / 2;
  const col1 = 15;
  const col2 = width * 0.38;
  const col3 = width * 0.72;
  return (
    <g transform={`translate(0,${y})`}>
      {/* Background */}
      <rect x={0} y={0} width={width} height={tbH} fill="#0f172a" rx={0} />
      <rect x={0} y={0} width={width} height={tbH} fill="none" stroke="#334155" strokeWidth="2" />
      {/* Horizontal dividers */}
      <line x1={0} y1={20} x2={width} y2={20} stroke="#334155" strokeWidth="0.8" />
      <line x1={0} y1={40} x2={width} y2={40} stroke="#334155" strokeWidth="0.8" />
      {/* Vertical dividers */}
      <line x1={width * 0.35} y1={0} x2={width * 0.35} y2={40} stroke="#334155" strokeWidth="0.8" />
      <line x1={width * 0.70} y1={0} x2={width * 0.70} y2={40} stroke="#334155" strokeWidth="0.8" />

      {/* ─── Row 1: Sheet Title (large) ─── */}
      <text x={midX} y={14} textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="Arial">{title}</text>
      <text x={col1} y={14} fontSize="8" fill="#94a3b8" fontFamily="Arial">Sheet: {sheetId || '--'}</text>
      <text x={width - 15} y={14} textAnchor="end" fontSize="8" fill="#94a3b8" fontFamily="Arial">{titleEn}</text>

      {/* ─── Row 2: Project Info ─── */}
      {/* Cell 1: Owner */}
      <text x={col1} y={28} fontSize="7" fill="#64748b" fontFamily="Arial">{hasOwner ? 'المالك:' : ''}</text>
      <text x={col1} y={36} fontSize="8" fontWeight="bold" fill="#e2e8f0" fontFamily="Arial">{meta?.owner || ''}</text>
      {/* Cell 2: Project Name */}
      <text x={col2} y={28} fontSize="7" fill="#64748b" fontFamily="Arial">المشروع:</text>
      <text x={col2} y={36} fontSize="8" fontWeight="bold" fill="#e2e8f0" fontFamily="Arial">{meta?.project || ''}</text>
      {/* Cell 3: Plan + Permit */}
      <text x={col3} y={28} fontSize="7" fill="#64748b" fontFamily="Arial">رقم المخطط: {meta?.plan || '---'}</text>
      <text x={col3} y={36} fontSize="7" fill="#64748b" fontFamily="Arial">الرخصة: {meta?.permit || '---'}</text>

      {/* ─── Row 3: Company + Scale + Date ─── */}
      <text x={col1} y={52} fontSize="9" fontWeight="bold" fill="#6366f1" fontFamily="Arial">
        {meta?.company || 'ARBA Engineering Platform — أربا'}
      </text>
      {scale && <text x={midX} y={52} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="Arial">المقياس: {scale}</text>}
      <text x={width - 15} y={52} textAnchor="end" fontSize="7" fill="#475569" fontFamily="Arial">{meta?.date || ''}</text>
    </g>
  );
};

// =================== Drawing Card ===================
const DrawingCard: React.FC<{ title: string; icon: React.ReactNode; number: number; sheetId?: string; children: React.ReactNode }> = ({ title, icon, number, sheetId, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
      <span className="bg-slate-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">{number}</span>
      <span className="text-rose-600 w-5 h-5">{icon}</span>
      <h3 className="font-bold text-slate-700 text-lg flex-1">{title}</h3>
      {sheetId && <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{sheetId}</span>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// =================== Dimension line helper ===================
const DimLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; label: string; offset?: number; color?: string }> = ({ x1, y1, x2, y2, label, offset = 0, color = '#475569' }) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const isH = Math.abs(y1 - y2) < 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.6" />
      <line x1={x1} y1={y1 - 3} x2={x1} y2={y1 + 3} stroke={color} strokeWidth="0.8" />
      <line x1={x2} y1={y2 - 3} x2={x2} y2={y2 + 3} stroke={color} strokeWidth="0.8" />
      <text x={mx} y={isH ? my - 3 + offset : my} textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">{label}</text>
    </g>
  );
};

// =================== Scale Bar ===================
const ScaleBar: React.FC<{ x: number; y: number; sc: number }> = ({ x, y, sc }) => (
  <g transform={`translate(${x},${y})`}>
    {[0, 1, 2, 3, 4, 5].map(i => (
      <rect key={i} x={i * sc} y={0} width={sc} height={4} fill={i % 2 === 0 ? '#1e293b' : '#fff'} stroke="#1e293b" strokeWidth="0.5" />
    ))}
    {[0, 1, 2, 3, 4, 5].map(i => (
      <text key={`t${i}`} x={i * sc} y={14} textAnchor="middle" fontSize="7" fill="#475569">{i}m</text>
    ))}
  </g>
);

// =================== North Arrow ===================
const NorthArrow: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={12} fill="none" stroke="#6366f1" strokeWidth="1" />
    <polygon points="0,-10 -4,4 4,4" fill="#6366f1" />
    <text x={0} y={-14} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#6366f1">N</text>
  </g>
);

// =================== SVG 1: Site Plan ===================
const SvgSitePlan: React.FC<{ bp: BlueprintConfig }> = ({ bp }) => {
  const sc = 10, m = 60;
  const W = bp.plotWidth * sc, L = bp.plotLength * sc;
  const ss = bp.setbackSide * sc, sf = bp.setbackFront * sc, sr = (bp.setbackRear || 2) * sc;
  const bW = W - ss * 2, bL = L - sf - sr;
  const svgW = W + m * 2 + 10, svgH = L + m * 2 + 55;
  const gateW = 4 * sc;
  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-slate-50 rounded-lg" style={{ maxHeight: 550 }}>
      <defs>
        <pattern id="g1" width={sc} height={sc} patternUnits="userSpaceOnUse"><path d={`M ${sc} 0 L 0 0 0 ${sc}`} fill="none" stroke="#e2e8f0" strokeWidth="0.3" /></pattern>
        <pattern id="grass" width={6} height={6} patternUnits="userSpaceOnUse"><circle cx={3} cy={3} r={1} fill="#86efac" opacity="0.4" /></pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#g1)" />
      {/* Street */}
      <rect x={m} y={m + L} width={W} height={20} fill="rgba(148,163,184,0.15)" stroke="#94a3b8" strokeWidth="1" />
      <text x={m + W / 2} y={m + L + 14} textAnchor="middle" fontSize="9" fill="#64748b">شارع {(bp.plotWidth >= 20 ? 20 : 15)}م | Street</text>
      {/* Plot boundary (fence/wall) */}
      <rect x={m} y={m} width={W} height={L} fill="none" stroke="#1e293b" strokeWidth="2.5" />
      {/* Neighbors */}
      <text x={m - 8} y={m + L / 2} textAnchor="middle" fontSize="8" fill="#64748b" transform={`rotate(-90,${m - 8},${m + L / 2})`}>جار | Neighbor</text>
      <text x={m + W + 8} y={m + L / 2} textAnchor="middle" fontSize="8" fill="#64748b" transform={`rotate(90,${m + W + 8},${m + L / 2})`}>جار | Neighbor</text>
      <text x={m + W / 2} y={m - 5} textAnchor="middle" fontSize="8" fill="#64748b">جار خلفي | Rear Neighbor</text>
      {/* Setback lines */}
      <rect x={m + ss} y={m + sr} width={bW} height={bL} fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="5,3" />
      {/* Building footprint */}
      <rect x={m + ss + 5} y={m + sr + 5} width={bW - 10} height={bL - 10} fill="rgba(99,102,241,0.08)" stroke="#4f46e5" strokeWidth="2" />
      <text x={m + ss + bW / 2} y={m + sr + bL / 2} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4f46e5">المبنى | Building</text>
      {/* Gate */}
      <rect x={m + W / 2 - gateW / 2} y={m + L - 2} width={gateW} height={4} fill="#f59e0b" />
      <text x={m + W / 2} y={m + L + 8} textAnchor="middle" fontSize="7" fill="#92400e">بوابة 4م | Gate</text>
      {/* Driveway */}
      <rect x={m + W / 2 - 15} y={m + sf + bL - 5} width={30} height={L - sf - bL + 5} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,2" />
      {/* Parking */}
      <text x={m + W / 2 - 25} y={m + sf + bL + 15} fontSize="8" fill="#64748b">P ×2</text>
      {/* Green areas */}
      <rect x={m + 5} y={m + 5} width={ss - 10} height={L - 10} fill="url(#grass)" rx="3" />
      <rect x={m + W - ss + 5} y={m + 5} width={ss - 10} height={L - 10} fill="url(#grass)" rx="3" />
      {/* Water tank */}
      <rect x={m + W - ss - 20} y={m + sr + 5} width={15} height={10} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1" rx="2" />
      <text x={m + W - ss - 12} y={m + sr + 13} textAnchor="middle" fontSize="5" fill="#3b82f6">خزان</text>
      {/* Meter */}
      <rect x={m + 5} y={m + L - 15} width={12} height={10} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1" rx="1" />
      <text x={m + 11} y={m + L - 8} textAnchor="middle" fontSize="5" fill="#ef4444">عداد</text>
      {/* Utility lines */}
      <line x1={m + 11} y1={m + L} x2={m + ss + 20} y2={m + sr + bL / 2} stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
      <line x1={m + W / 2 + 20} y1={m + L} x2={m + W - ss - 12} y2={m + sr + 15} stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
      {/* Setback dimensions */}
      <DimLine x1={m} y1={m + L + 25} x2={m + ss} y2={m + L + 25} label={`${bp.setbackSide}م`} />
      <DimLine x1={m + ss} y1={m + L + 35} x2={m + W - ss} y2={m + L + 35} label={`${(bW / sc).toFixed(1)}م`} color="#4f46e5" />
      <DimLine x1={m} y1={m + L + 45} x2={m + W} y2={m + L + 45} label={`${bp.plotWidth}م`} />
      {/* Level marks */}
      <text x={m + ss + 10} y={m + sr + bL - 5} fontSize="7" fill="#16a34a">±0.00</text>
      <text x={m + 10} y={m + L - 25} fontSize="7" fill="#16a34a">-0.15</text>
      {/* Scale bar + North */}
      <ScaleBar x={m} y={svgH - 25} sc={sc} />
      <NorthArrow x={svgW - 30} y={m + 20} />
      {/* Title */}
      <TitleBlock width={svgW} y={svgH - 65} title="مخطط الموقع العام" titleEn="SITE PLAN" sheetId="A-01" scale="1:100" />
    </svg>
  );
};

// =================== SVG 2: Excavation Plan ===================
const SvgExcavationPlan: React.FC<{ bp: BlueprintConfig }> = ({ bp }) => {
  const sc = 10, m = 60;
  const exc = bp.excavation;
  const depth = exc?.excavationDepth || 1.5;
  const zero = exc?.zeroLevel || 0.3;
  const bw = (bp.plotWidth - bp.setbackSide * 2);
  const bl = (bp.plotLength - bp.setbackFront - (bp.setbackRear || 2));
  const W = bw * sc, H = bl * sc;
  const slopeW = depth * sc;
  const svgW = W + slopeW * 2 + m * 2, svgH = H + slopeW * 2 + m * 2 + 80;
  const colRows = Math.ceil(Math.sqrt((bp.floors[0]?.columnsCount || 12) * (bl / bw)));
  const colCols = Math.ceil((bp.floors[0]?.columnsCount || 12) / colRows);
  const fw = (bp.foundation?.footingWidth || 1.2) * sc;

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-amber-50/30 rounded-lg" style={{ maxHeight: 550 }}>
      {/* Safety slopes */}
      <polygon points={`${m},${m} ${m + slopeW},${m + slopeW} ${m + slopeW + W},${m + slopeW} ${m + slopeW * 2 + W},${m} ${m + slopeW * 2 + W},${m + slopeW * 2 + H} ${m + slopeW + W},${m + slopeW + H} ${m + slopeW},${m + slopeW + H} ${m},${m + slopeW * 2 + H}`}
        fill="rgba(217,119,6,0.1)" stroke="#d97706" strokeWidth="1.5" strokeDasharray="6,3" />
      {/* Excavation bottom */}
      <rect x={m + slopeW} y={m + slopeW} width={W} height={H} fill="rgba(139,92,42,0.12)" stroke="#92400e" strokeWidth="2" />
      {/* Lean concrete */}
      <rect x={m + slopeW + 5} y={m + slopeW + 5} width={W - 10} height={H - 10} fill="rgba(148,163,184,0.15)" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
      <text x={m + slopeW + W / 2} y={m + slopeW + 20} textAnchor="middle" fontSize="8" fill="#94a3b8">خرسانة نظافة 10سم | Blinding</text>
      {/* Footing locations */}
      {Array.from({ length: bp.floors[0]?.columnsCount || 12 }).map((_, i) => {
        const r = Math.floor(i / colCols), c = i % colCols;
        if (r >= colRows) return null;
        const x = m + slopeW + 15 + (c / Math.max(colCols - 1, 1)) * (W - 30);
        const y = m + slopeW + 15 + (r / Math.max(colRows - 1, 1)) * (H - 30);
        return (
          <g key={i}>
            <rect x={x - fw / 2} y={y - fw / 2} width={fw} height={fw} fill="rgba(139,92,42,0.2)" stroke="#92400e" strokeWidth="1" strokeDasharray="3,2" />
            <text x={x} y={y + 3} textAnchor="middle" fontSize="6" fill="#92400e">ق{i + 1}</text>
          </g>
        );
      })}
      {/* Ramp */}
      <polygon points={`${m},${m + slopeW * 2 + H} ${m + slopeW},${m + slopeW + H} ${m + slopeW + 30},${m + slopeW + H} ${m + 30},${m + slopeW * 2 + H}`}
        fill="rgba(217,119,6,0.2)" stroke="#d97706" strokeWidth="1" />
      <text x={m + 15} y={m + slopeW * 2 + H + 15} fontSize="9" fill="#92400e">↗ منحدر شاحنات (3م)</text>
      {/* BM point */}
      <circle cx={m + slopeW * 2 + W + 15} cy={m + 15} r={5} fill="none" stroke="#dc2626" strokeWidth="1.5" />
      <line x1={m + slopeW * 2 + W + 10} y1={m + 15} x2={m + slopeW * 2 + W + 20} y2={m + 15} stroke="#dc2626" strokeWidth="1" />
      <text x={m + slopeW * 2 + W + 25} y={m + 18} fontSize="9" fill="#dc2626" fontWeight="bold">BM ±0.00</text>
      {/* Safety barrier */}
      <rect x={m - 5} y={m - 5} width={slopeW * 2 + W + 10} height={slopeW * 2 + H + 10} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="8,4" />
      <text x={m + slopeW + W / 2} y={m - 10} textAnchor="middle" fontSize="8" fill="#f59e0b">⚠️ سياج أمان | Safety Barrier</text>
      {/* Soil info */}
      <text x={m + slopeW * 2 + W + 10} y={m + slopeW + 40} fontSize="8" fill="#92400e">نوع التربة: رملية</text>
      <text x={m + slopeW * 2 + W + 10} y={m + slopeW + 55} fontSize="8" fill="#92400e">قدرة تحمل: 1.5 كجم/سم²</text>
      {/* Levels */}
      <text x={m + slopeW + W / 2} y={m + slopeW + H / 2} textAnchor="middle" fontSize="11" fill="#92400e" fontWeight="bold">قاع الحفر: -{depth}م</text>
      <text x={m + slopeW + W / 2} y={m + slopeW + H / 2 + 15} textAnchor="middle" fontSize="9" fill="#64748b">صفر معماري: +{zero}م</text>
      {/* Dimensions */}
      <DimLine x1={m + slopeW} y1={m - 20} x2={m + slopeW + W} y2={m - 20} label={`${bw.toFixed(1)}م`} />
      <DimLine x1={m + slopeW + W + 10} y1={m + slopeW} x2={m + slopeW + W + 10} y2={m + slopeW + H} label={`${bl.toFixed(1)}م`} />
      {/* Section mark */}
      <line x1={m + slopeW + W / 2} y1={m - 15} x2={m + slopeW + W / 2} y2={m + slopeW * 2 + H + 15} stroke="#dc2626" strokeWidth="1" strokeDasharray="8,4,2,4" />
      <text x={m + slopeW + W / 2 - 5} y={m - 18} fontSize="9" fontWeight="bold" fill="#dc2626">A</text>
      <text x={m + slopeW + W / 2 - 5} y={m + slopeW * 2 + H + 22} fontSize="9" fontWeight="bold" fill="#dc2626">A</text>
      <TitleBlock width={svgW} y={svgH - 65} title="مخطط الحفر والمناسيب" titleEn="EXCAVATION PLAN" sheetId="S-01" scale="1:100" />
    </svg>
  );
};

// =================== SVG 3: Foundation Plan ===================
const SvgFoundationPlan: React.FC<{ bp: BlueprintConfig; colSpec: ColumnSpec; colW: number; colD: number }> = ({ bp, colSpec, colW, colD }) => {
  const sc = 12, m = 55;
  const f = bp.floors[0]; const fdn = bp.foundation;
  if (!f || !fdn) return <p className="text-slate-400 text-center py-8">أدخل بيانات الأساسات أولاً</p>;
  const bw = bp.plotWidth - bp.setbackSide * 2, bl = bp.plotLength - bp.setbackFront - (bp.setbackRear || 2);
  const W = bw * sc, H = bl * sc;
  const svgW = W + m * 2 + 160, svgH = H + m * 2 + 60;
  const cols = f.columnsCount || 12;
  const colRows = Math.ceil(Math.sqrt(cols * (bl / bw)));
  const colCols = Math.ceil(cols / colRows);
  const fw = (fdn.footingWidth || 1.2) * sc;
  const tbw = (fdn.tieBeamWidth || 0.3) * sc;
  const cw = colW / 100 * sc, cd = colD / 100 * sc;

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-slate-50 rounded-lg" style={{ maxHeight: 550 }}>
      {/* Lean concrete boundary */}
      <rect x={m - 3} y={m - 3} width={W + 6} height={H + 6} fill="rgba(148,163,184,0.1)" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,2" />
      {/* Grid axes with circles */}
      {Array.from({ length: colCols }).map((_, c) => {
        const x = m + (c / Math.max(colCols - 1, 1)) * (W - 6) + 3;
        return (<g key={`ax${c}`}>
          <line x1={x} y1={m - 25} x2={x} y2={m + H + 10} stroke="#e2e8f0" strokeWidth="0.4" strokeDasharray="3,3" />
          <circle cx={x} cy={m - 30} r={8} fill="none" stroke="#6366f1" strokeWidth="1" />
          <text x={x} y={m - 27} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6366f1">{String.fromCharCode(65 + c)}</text>
        </g>);
      })}
      {Array.from({ length: colRows }).map((_, r) => {
        const y = m + (r / Math.max(colRows - 1, 1)) * (H - 8) + 4;
        return (<g key={`ay${r}`}>
          <line x1={m - 20} y1={y} x2={m + W + 10} y2={y} stroke="#e2e8f0" strokeWidth="0.4" strokeDasharray="3,3" />
          <circle cx={m - 30} cy={y} r={8} fill="none" stroke="#6366f1" strokeWidth="1" />
          <text x={m - 30} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6366f1">{r + 1}</text>
        </g>);
      })}
      {/* Tie beams */}
      {Array.from({ length: colRows }).map((_, r) => {
        const y = m + (r / Math.max(colRows - 1, 1)) * (H - 8) + 4;
        return <rect key={`tbh${r}`} x={m} y={y - tbw / 2} width={W} height={tbw} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="0.8" />;
      })}
      {Array.from({ length: colCols }).map((_, c) => {
        const x = m + (c / Math.max(colCols - 1, 1)) * (W - 6) + 3;
        return <rect key={`tbv${c}`} x={x - tbw / 2} y={m} width={tbw} height={H} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="0.8" />;
      })}
      {/* Footings + Columns + Labels */}
      {Array.from({ length: cols }).map((_, i) => {
        const r = Math.floor(i / colCols), c = i % colCols;
        if (r >= colRows) return null;
        const x = m + (c / Math.max(colCols - 1, 1)) * (W - 6) + 3;
        const y = m + (r / Math.max(colRows - 1, 1)) * (H - 8) + 4;
        return (
          <g key={i}>
            {fdn.type === 'isolated_footings' && <rect x={x - fw / 2} y={y - fw / 2} width={fw} height={fw} fill="rgba(139,92,42,0.15)" stroke="#92400e" strokeWidth="1" rx="1" />}
            <rect x={x - cw / 2} y={y - cd / 2} width={cw} height={cd} fill="#334155" rx="1" />
            <text x={x} y={y + fw / 2 + 10} textAnchor="middle" fontSize="6" fill="#92400e" fontWeight="bold">ق{i + 1}</text>
          </g>
        );
      })}
      {fdn.type === 'raft' && <rect x={m - 6} y={m - 6} width={W + 12} height={H + 12} fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="6,3" />}
      {/* Dimension chains */}
      {colCols > 1 && <DimLine x1={m + 3} y1={m + H + 20} x2={m + (1 / Math.max(colCols - 1, 1)) * (W - 6) + 3} y2={m + H + 20} label={`${(bw / Math.max(colCols - 1, 1)).toFixed(2)}م`} />}
      <DimLine x1={m} y1={m + H + 35} x2={m + W} y2={m + H + 35} label={`${bw.toFixed(1)}م`} />
      {/* Footing schedule */}
      <g transform={`translate(${m + W + 20}, ${m})`}>
        <rect width={130} height={22} fill="#1e293b" rx={3} />
        <text x={65} y={15} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">جدول القواعد</text>
        {[
          ['النوع', fdn.type === 'raft' ? 'لبشة' : fdn.type === 'strip_footings' ? 'شريطية' : 'منفصلة'],
          ['أبعاد القاعدة', `${fdn.footingWidth || 1.2}×${fdn.footingWidth || 1.2}م`],
          ['عمق القاعدة', `${fdn.footingDepth || 0.5}م`],
          ['ميدة ربط', `${(fdn.tieBeamWidth || 0.3) * 100}×${(fdn.tieBeamDepth || 0.6) * 100}سم`],
          ['عمود', `${colW}×${colD}سم`],
          ['رقبة عمود', `${(fdn.neckColumnHeight || 0.5)}م`],
          ['عدد القواعد', `${cols}`],
          ['خرسانة', 'C30 (350 كجم/سم²)'],
          ['حديد', 'Grade 60 (420 Mpa)'],
          ['غطاء', '75 مم'],
        ].map(([k, v], idx) => (
          <g key={idx}>
            <rect y={22 + idx * 18} width={130} height={18} fill={idx % 2 === 0 ? '#f8fafc' : '#f1f5f9'} stroke="#e2e8f0" />
            <text x={125} y={22 + idx * 18 + 13} textAnchor="end" fontSize="7" fill="#475569">{k}</text>
            <text x={5} y={22 + idx * 18 + 13} fontSize="7" fontWeight="bold" fill="#1e293b">{v}</text>
          </g>
        ))}
      </g>
      <TitleBlock width={svgW} y={svgH - 65} title="مخطط الأساسات" titleEn="FOUNDATION PLAN" sheetId="S-02" scale="1:100" />
    </svg>
  );
};

// =================== SVG 4: Column Layout ===================
const SvgColumnLayout: React.FC<{ bp: BlueprintConfig; colSpec: ColumnSpec; colW: number; colD: number }> = ({ bp, colSpec, colW, colD }) => {
  const sc = 12, m = 55;
  const bw = bp.plotWidth - bp.setbackSide * 2, bl = bp.plotLength - bp.setbackFront - (bp.setbackRear || 2);
  const W = bw * sc, H = bl * sc;
  const svgW = W + m * 2 + 150, svgH = H + m * 2 + 60;
  const cols = bp.floors[0]?.columnsCount || 12;
  const colRows = Math.ceil(Math.sqrt(cols * (bl / bw)));
  const colCols = Math.ceil(cols / colRows);
  const cw = colW / 100 * sc * 2.5, cd = colD / 100 * sc * 2.5;

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-slate-50 rounded-lg" style={{ maxHeight: 550 }}>
      {/* Building outline */}
      <rect x={m} y={m} width={W} height={H} fill="none" stroke="#1e293b" strokeWidth="2" />
      {/* Grid lines with axis circles */}
      {Array.from({ length: colCols }).map((_, c) => {
        const x = m + (c / Math.max(colCols - 1, 1)) * W;
        return (<g key={`gx${c}`}>
          <line x1={x} y1={m - 25} x2={x} y2={m + H + 10} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3" />
          <circle cx={x} cy={m - 28} r={9} fill="none" stroke="#6366f1" strokeWidth="1" />
          <text x={x} y={m - 24} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#6366f1">{String.fromCharCode(65 + c)}</text>
        </g>);
      })}
      {Array.from({ length: colRows }).map((_, r) => {
        const y = m + (r / Math.max(colRows - 1, 1)) * H;
        return (<g key={`gy${r}`}>
          <line x1={m - 20} y1={y} x2={m + W + 10} y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3" />
          <circle cx={m - 28} cy={y} r={9} fill="none" stroke="#6366f1" strokeWidth="1" />
          <text x={m - 28} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#6366f1">{r + 1}</text>
        </g>);
      })}
      {/* Beams between columns */}
      {Array.from({ length: colRows }).map((_, r) => {
        const y = m + (r / Math.max(colRows - 1, 1)) * H;
        return <line key={`bh${r}`} x1={m} y1={y} x2={m + W} y2={y} stroke="#94a3b8" strokeWidth="2" />;
      })}
      {Array.from({ length: colCols }).map((_, c) => {
        const x = m + (c / Math.max(colCols - 1, 1)) * W;
        return <line key={`bv${c}`} x1={x} y1={m} x2={x} y2={m + H} stroke="#94a3b8" strokeWidth="2" />;
      })}
      {/* Columns with real dimensions */}
      {Array.from({ length: cols }).map((_, i) => {
        const r = Math.floor(i / colCols), c = i % colCols;
        if (r >= colRows) return null;
        const x = m + (c / Math.max(colCols - 1, 1)) * W;
        const y = m + (r / Math.max(colRows - 1, 1)) * H;
        const isCorner = (r === 0 || r === colRows - 1) && (c === 0 || c === colCols - 1);
        return (<g key={i}>
          <rect x={x - cw / 2} y={y - cd / 2} width={cw} height={cd} fill={isCorner ? '#4f46e5' : '#1e293b'} rx="1" />
          <text x={x} y={y + cd / 2 + 10} textAnchor="middle" fontSize="6" fill="#475569" fontWeight="bold">C{i + 1}</text>
        </g>);
      })}
      {/* Spacing dims */}
      {colCols > 1 && <DimLine x1={m} y1={m + H + 20} x2={m + W / (colCols - 1)} y2={m + H + 20} label={`${(bw / (colCols - 1)).toFixed(2)}م`} />}
      <DimLine x1={m} y1={m + H + 35} x2={m + W} y2={m + H + 35} label={`${bw.toFixed(1)}م`} />
      {/* Column schedule — v7.0 wider table with better alignment */}
      <g transform={`translate(${m + W + 20}, ${m})`}>
        <rect width={160} height={26} fill="#1e293b" rx={4} />
        <text x={80} y={17} textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="Segoe UI, Tahoma, sans-serif">جدول الأعمدة</text>
        {[
          ['المقاس', `${colW}×${colD} سم`],
          ['التسليح', `${colSpec.mainBars}Ø${colSpec.mainDia_mm}`],
          ['الكانات', `Ø${colSpec.stirrupDia_mm}@${colSpec.stirrupSpacing_cm} سم`],
          ['الغطاء', `${colSpec.coverDepth_mm} مم`],
          ['النسبة', `${colSpec.rebarRatio}%`],
          ['العدد', `${cols} عمود`],
          ['زاوية', '■ بنفسجي'],
          ['وسط', '● أسود'],
        ].map(([k, v], idx) => (
          <g key={idx}>
            <rect y={26 + idx * 22} width={160} height={22} fill={idx % 2 === 0 ? '#f8fafc' : '#f1f5f9'} stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1={80} y1={26 + idx * 22} x2={80} y2={26 + idx * 22 + 22} stroke="#e2e8f0" strokeWidth="0.5" />
            <text x={150} y={26 + idx * 22 + 15} textAnchor="end" fontSize="9" fill="#475569" fontFamily="Segoe UI, Tahoma, sans-serif">{k}</text>
            <text x={10} y={26 + idx * 22 + 15} fontSize="9" fontWeight="bold" fill="#1e293b" fontFamily="Segoe UI, Tahoma, sans-serif">{v}</text>
          </g>
        ))}
      </g>
      {/* Column detail — v7.0 with proper spacing */}
      <g transform={`translate(${m + W + 20}, ${m + 210})`}>
        <text x={80} y={0} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b" fontFamily="Segoe UI, Tahoma, sans-serif">تفصيل العمود</text>
        <rect x={30} y={10} width={100} height={65} fill="rgba(148,163,184,0.15)" stroke="#475569" strokeWidth="1.5" rx="2" />
        <rect x={37} y={17} width={86} height={51} fill="none" stroke="#dc2626" strokeWidth="1" rx="1" />
        {[50, 70, 90, 110].map((x, i) => <circle key={`dt${i}`} cx={x} cy={24} r={3.5} fill="#dc2626" />)}
        {[50, 70, 90, 110].map((x, i) => <circle key={`db${i}`} cx={x} cy={61} r={3.5} fill="#dc2626" />)}
        <text x={80} y={90} textAnchor="middle" fontSize="9" fill="#475569" fontFamily="Segoe UI, Tahoma, sans-serif">{colW}×{colD} سم</text>
      </g>
      <TitleBlock width={svgW} y={svgH - 65} title="مخطط الأعمدة" titleEn="COLUMN LAYOUT" sheetId="S-03" scale="1:100" />
    </svg>
  );
};

// =================== SVG 5: Rebar Details — v7.0 FIXED LAYOUT ===================
const SvgRebarDetails: React.FC<{ colSpec: ColumnSpec; beamSpec: BeamSpec; colW: number; colD: number }> = ({ colSpec, beamSpec, colW, colD }) => {
  const svgW = 780, svgH = 440;
  const ff = 'Segoe UI, Tahoma, sans-serif';
  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-slate-50 rounded-lg" style={{ maxHeight: 480 }}>
      {/* === Column Section === */}
      <g transform="translate(40, 40)">
        <text x={70} y={-12} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b" fontFamily={ff}>مقطع عمود</text>
        <rect width={140} height={180} fill="rgba(148,163,184,0.1)" stroke="#475569" strokeWidth="2" rx="3" />
        <rect x={12} y={12} width={116} height={156} fill="none" stroke="#dc2626" strokeWidth="1.5" rx="2" />
        {/* Rebar circles - top */}
        {[26, 54, 82, 110].map((x, i) => <circle key={`ct${i}`} cx={x} cy={24} r={5} fill="#dc2626" />)}
        {/* Rebar circles - bottom */}
        {[26, 54, 82, 110].map((x, i) => <circle key={`cb${i}`} cx={x} cy={156} r={5} fill="#dc2626" />)}
        {/* Stirrup rectangle */}
        <rect x={16} y={16} width={108} height={148} fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="4,2" rx="1" />
        {/* Labels below */}
        <text x={70} y={200} textAnchor="middle" fontSize="10" fill="#475569" fontFamily={ff}>{colW}×{colD} سم</text>
        <text x={70} y={218} textAnchor="middle" fontSize="9" fill="#dc2626" fontFamily={ff}>
          {colSpec.mainBars}Ø{colSpec.mainDia_mm}
        </text>
        <text x={70} y={234} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily={ff}>
          كانة Ø{colSpec.stirrupDia_mm}@{colSpec.stirrupSpacing_cm} سم
        </text>
        <text x={70} y={250} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={ff}>
          غطاء {colSpec.coverDepth_mm} مم | Ld=60Ø
        </text>
      </g>

      {/* === Beam Section === */}
      <g transform="translate(230, 40)">
        <text x={65} y={-12} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b" fontFamily={ff}>مقطع ميدة</text>
        <rect width={130} height={180} fill="rgba(148,163,184,0.1)" stroke="#475569" strokeWidth="2" rx="3" />
        <rect x={12} y={12} width={106} height={156} fill="none" stroke="#dc2626" strokeWidth="1.5" rx="2" />
        {/* Top bars - blue */}
        {[28, 65, 102].map((x, i) => <circle key={`bt${i}`} cx={x} cy={24} r={4.5} fill="#3b82f6" />)}
        {/* Bottom bars - red */}
        {[28, 65, 102].map((x, i) => <circle key={`bb${i}`} cx={x} cy={156} r={5} fill="#dc2626" />)}
        {/* Labels below */}
        <text x={65} y={200} textAnchor="middle" fontSize="10" fill="#475569" fontFamily={ff}>{beamSpec.width_cm}×{beamSpec.depth_cm} سم</text>
        <text x={65} y={218} textAnchor="middle" fontSize="9" fill="#3b82f6" fontFamily={ff}>
          علوي: {beamSpec.topBars}Ø{beamSpec.topDia_mm}
        </text>
        <text x={65} y={234} textAnchor="middle" fontSize="9" fill="#dc2626" fontFamily={ff}>
          سفلي: {beamSpec.bottomBars}Ø{beamSpec.bottomDia_mm}
        </text>
        <text x={65} y={250} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={ff}>
          كانة Ø{beamSpec.stirrupDia_mm}@{beamSpec.stirrupSpacing_middle_cm}/{beamSpec.stirrupSpacing_support_cm} سم
        </text>
      </g>

      {/* === Footing Section === */}
      <g transform="translate(420, 55)">
        <text x={90} y={-25} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b" fontFamily={ff}>مقطع قاعدة</text>
        {/* Neck column */}
        <rect x={65} y={-20} width={50} height={25} fill="#475569" rx="1" />
        <text x={90} y={-3} textAnchor="middle" fontSize="8" fill="white" fontFamily={ff}>رقبة</text>
        {/* Footing body */}
        <rect width={180} height={90} fill="rgba(139,92,42,0.12)" stroke="#92400e" strokeWidth="2" rx="3" />
        {/* Horizontal rebars */}
        {Array.from({ length: 7 }).map((_, i) => <line key={`fh${i}`} x1={10} y1={75 - i * 10} x2={170} y2={75 - i * 10} stroke="#dc2626" strokeWidth="1" />)}
        {/* Vertical rebars */}
        {Array.from({ length: 11 }).map((_, i) => <line key={`fv${i}`} x1={10 + i * 16} y1={8} x2={10 + i * 16} y2={82} stroke="#dc2626" strokeWidth="0.8" opacity="0.5" />)}
        {/* Labels below */}
        <text x={90} y={110} textAnchor="middle" fontSize="9" fill="#92400e" fontFamily={ff}>حديد Ø12@12 سم الإتجاهين</text>
        <text x={90} y={126} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={ff}>غطاء 75 مم | نظافة 10 سم</text>
      </g>

      {/* === Slab Section === */}
      <g transform="translate(420, 210)">
        <text x={90} y={-5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b" fontFamily={ff}>مقطع بلاطة</text>
        <rect x={0} y={8} width={180} height={40} fill="rgba(148,163,184,0.1)" stroke="#475569" strokeWidth="1.5" rx="2" />
        {/* Bottom bars */}
        {Array.from({ length: 11 }).map((_, i) => <line key={`sh${i}`} x1={8 + i * 16} y1={38} x2={8 + i * 16} y2={46} stroke="#dc2626" strokeWidth="1.5" />)}
        {/* Top bars */}
        {Array.from({ length: 11 }).map((_, i) => <line key={`st${i}`} x1={8 + i * 16} y1={10} x2={8 + i * 16} y2={18} stroke="#3b82f6" strokeWidth="1" />)}
        <line x1={0} y1={42} x2={180} y2={42} stroke="#dc2626" strokeWidth="1" />
        <line x1={0} y1={14} x2={180} y2={14} stroke="#3b82f6" strokeWidth="0.8" />
        {/* Labels below */}
        <text x={90} y={68} textAnchor="middle" fontSize="9" fill="#dc2626" fontFamily={ff}>سفلي: Ø10@15 سم | علوي: Ø8@20 سم</text>
        <text x={90} y={84} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily={ff}>سمك 15 سم | غطاء 25 مم</text>
      </g>

      {/* === Legend — v7.0 corrected values === */}
      <g transform="translate(30, 330)">
        {/* Color legend */}
        <circle cx={8} cy={8} r={5} fill="#dc2626" />
        <text x={20} y={12} fontSize="10" fill="#475569" fontFamily={ff}>حديد رئيسي / سفلي</text>
        <circle cx={170} cy={8} r={5} fill="#3b82f6" />
        <text x={182} y={12} fontSize="10" fill="#475569" fontFamily={ff}>حديد علوي</text>
        <line x1={310} y1={8} x2={334} y2={8} stroke="#dc2626" strokeWidth="1.5" />
        <text x={340} y={12} fontSize="10" fill="#475569" fontFamily={ff}>كانة / شبكة</text>
        {/* Engineering notes box */}
        <rect x={420} y={-8} width={330} height={50} fill="#fffbeb" stroke="#fbbf24" strokeWidth="1" rx="5" />
        <text x={435} y={10} fontSize="10" fontWeight="bold" fill="#92400e" fontFamily={ff}>ملاحظات هندسية:</text>
        <text x={435} y={28} fontSize="9" fill="#64748b" fontFamily={ff}>
          خرسانة C30 | حديد G60 (420MPa) | Ld=60Ø | Lap=60Ø
        </text>
        <text x={435} y={40} fontSize="8" fill="#94a3b8" fontFamily={ff}>Hook 135° | SBC 304 / ACI 318-19</text>
      </g>
      <TitleBlock width={svgW} y={svgH - 65} title="تفاصيل حديد التسليح" titleEn="REBAR DETAILS" sheetId="S-04" scale="NTS" />
    </svg>
  );
};

// =================== BBS Table ===================
const BarBendingTable: React.FC<{ bbs: BarBendingItem[]; totalKg: number; isAr: boolean }> = ({ bbs, totalKg, isAr }) => {
  if (bbs.length === 0) return <p className="text-slate-400 text-center py-4 text-sm">أدخل بيانات الأساسات لتوليد جدول الحصر</p>;
  return (
    <div className="mt-4 overflow-x-auto">
      <h4 className="font-bold text-sm text-slate-700 mb-2">📋 {isAr ? 'جدول حصر الحديد (Bar Bending Schedule)' : 'Bar Bending Schedule'}</h4>
      <table className="w-full text-xs border-collapse">
        <thead><tr className="bg-slate-800 text-white">
          <th className="p-2 text-right">العنصر</th><th className="p-2">الرمز</th><th className="p-2">القطر</th><th className="p-2">الشكل</th>
          <th className="p-2">الطول (م)</th><th className="p-2">العدد</th><th className="p-2">وزن/قضيب</th><th className="p-2 text-left">الإجمالي (كجم)</th>
        </tr></thead>
        <tbody>
          {bbs.map((b, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
              <td className="p-2 text-right font-medium">{b.memberAr}</td>
              <td className="p-2 text-center font-mono text-xs">{b.barMark}</td>
              <td className="p-2 text-center font-bold text-red-600">Ø{b.diameter_mm}</td>
              <td className="p-2 text-center">{b.shape}</td>
              <td className="p-2 text-center">{b.length_m}</td>
              <td className="p-2 text-center font-bold">{b.count}</td>
              <td className="p-2 text-center">{b.weightPerBar_kg}</td>
              <td className="p-2 text-left font-bold">{b.totalWeight_kg.toLocaleString()}</td>
            </tr>
          ))}
          <tr className="bg-slate-900 text-white font-bold">
            <td colSpan={7} className="p-2 text-right">إجمالي الحديد</td>
            <td className="p-2 text-left">{totalKg.toLocaleString()} كجم = {(totalKg / 1000).toFixed(2)} طن</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// =================== SVG 6: Formwork ===================
const SvgFormworkPlan: React.FC<{ bp: BlueprintConfig }> = ({ bp }) => {
  const f = bp.floors[0];
  if (!f) return <p className="text-slate-400 text-center py-8">لا توجد بيانات طوابق</p>;
  const sc = 8, m = 40;
  const side = Math.sqrt(f.area);
  const W = side * sc, H = W;
  const svgW = W + m * 2 + 130, svgH = H + m * 2 + 60;
  const pw = FORMWORK_DETAILS.plywood_width_m * sc;
  const pl = FORMWORK_DETAILS.plywood_length_m * sc;
  const cols = Math.ceil(W / pw), rows = Math.ceil(H / pl);
  const totalSheets = Math.ceil(f.area / FORMWORK_DETAILS.plywood_area_m2);
  const totalProps = Math.ceil(f.area / (FORMWORK_DETAILS.prop_spacing_m * FORMWORK_DETAILS.prop_spacing_m));

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-amber-50/20 rounded-lg" style={{ maxHeight: 450 }}>
      <rect x={m} y={m} width={W} height={H} fill="none" stroke="#1e293b" strokeWidth="2" />
      {/* Plywood sheets */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <rect key={`p${r}${c}`} x={m + c * pw + 1} y={m + r * pl + 1} width={Math.min(pw - 2, W - c * pw - 2)} height={Math.min(pl - 2, H - r * pl - 2)} fill="rgba(217,119,6,0.08)" stroke="#d97706" strokeWidth="0.5" rx="1" />
        ))
      )}
      {/* Props */}
      {Array.from({ length: Math.ceil(side) }).map((_, r) =>
        Array.from({ length: Math.ceil(side) }).map((_, c) => (
          <g key={`pr${r}${c}`}>
            <line x1={m + c * sc + sc / 2 - 2} y1={m + r * sc + sc / 2 - 2} x2={m + c * sc + sc / 2 + 2} y2={m + r * sc + sc / 2 + 2} stroke="#475569" strokeWidth="0.8" />
            <line x1={m + c * sc + sc / 2 + 2} y1={m + r * sc + sc / 2 - 2} x2={m + c * sc + sc / 2 - 2} y2={m + r * sc + sc / 2 + 2} stroke="#475569" strokeWidth="0.8" />
          </g>
        ))
      )}
      {/* Stair opening */}
      <rect x={m + W / 2 - 15} y={m + H / 2 - 10} width={30} height={20} fill="white" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x={m + W / 2} y={m + H / 2 + 3} textAnchor="middle" fontSize="6" fill="#dc2626">فتحة سلم</text>
      {/* Direction arrow */}
      <line x1={m + 10} y1={m + 10} x2={m + 40} y2={m + 10} stroke="#d97706" strokeWidth="1" markerEnd="url(#arrow)" />
      <text x={m + 50} y={m + 14} fontSize="7" fill="#d97706">اتجاه التركيب</text>
      {/* Info */}
      <g transform={`translate(${m + W + 15}, ${m})`}>
        <rect width={110} height={22} fill="#1e293b" rx={3} />
        <text x={55} y={15} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">بيانات الشدة</text>
        {[
          ['المساحة', `${f.area} م²`],
          ['الألواح', `${totalSheets} لوح`],
          ['الجكات', `${totalProps} جك`],
          ['سماكة', `${FORMWORK_DETAILS.plywood_thickness_mm}مم`],
          ['استخدام', `${FORMWORK_DETAILS.reuse_cycles} مرات`],
          ['المسافة', `${FORMWORK_DETAILS.prop_spacing_m}م بين الجكات`],
        ].map(([k, v], i) => (
          <g key={i}><rect y={22 + i * 18} width={110} height={18} fill={i % 2 === 0 ? '#fefce8' : '#fef9c3'} stroke="#e2e8f0" />
            <text x={105} y={22 + i * 18 + 13} textAnchor="end" fontSize="7" fill="#475569">{k}</text>
            <text x={5} y={22 + i * 18 + 13} fontSize="7" fontWeight="bold" fill="#1e293b">{v}</text></g>
        ))}
      </g>
      <TitleBlock width={svgW} y={svgH - 65} title="مخطط الشدة الخشبية" titleEn="FORMWORK PLAN" sheetId="S-05" scale="1:100" />
    </svg>
  );
};

// =================== SVG 7: Floor Plan V2 (COMPLETE REWRITE) ===================
const SvgFloorPlanV2: React.FC<{ bp: BlueprintConfig; floor: FloorDetails; floorIdx: number; allRooms: RoomFinishSchedule[]; colW: number; colD: number }> = ({ bp, floor, floorIdx, allRooms, colW, colD }) => {
  const sc = 12, m = 65;
  const bw = bp.plotWidth - bp.setbackSide * 2;
  const bl = bp.plotLength - bp.setbackFront - (bp.setbackRear || 2);
  const W = bw * sc, H = bl * sc;
  const svgW = W + m * 2 + 20, svgH = H + m * 2 + 70;
  const wallExt = 3, wallInt = 2;

  const floorRooms = getRoomsForFloor(allRooms, bp.floors, floorIdx);
  const layoutRooms = layoutRoomsZoneBased(floorRooms, W - wallExt * 2, H - wallExt * 2, sc);

  const roomColors: Record<string, string> = {
    majlis: '#dbeafe', living: '#fef3c7', bedroom: '#ede9fe', kitchen: '#dcfce7',
    bathroom: '#ccfbf1', office: '#fce7f3', corridor: '#f1f5f9', storage: '#e2e8f0'
  };

  const colRows = Math.ceil(Math.sqrt((floor.columnsCount || 12) * (bl / bw)));
  const colCols = Math.ceil((floor.columnsCount || 12) / colRows);

  const floorLevel = bp.floors.slice(0, floorIdx).reduce((s, f) => s + f.height, 0) + (bp.excavation?.zeroLevel || 0.3);

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-white rounded-lg border" style={{ maxHeight: 600 }}>
      {/* Axis grid */}
      {Array.from({ length: colCols }).map((_, c) => {
        const x = m + wallExt + (c / Math.max(colCols - 1, 1)) * (W - wallExt * 2);
        return (<g key={`ax${c}`}>
          <line x1={x} y1={m - 20} x2={x} y2={m + H + 10} stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="3,5" />
          <circle cx={x} cy={m - 25} r={7} fill="none" stroke="#6366f1" strokeWidth="0.8" />
          <text x={x} y={m - 22} textAnchor="middle" fontSize="8" fill="#6366f1">{String.fromCharCode(65 + c)}</text>
        </g>);
      })}
      {Array.from({ length: colRows }).map((_, r) => {
        const y = m + wallExt + (r / Math.max(colRows - 1, 1)) * (H - wallExt * 2);
        return (<g key={`ay${r}`}>
          <line x1={m - 15} y1={y} x2={m + W + 10} y2={y} stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="3,5" />
          <circle cx={m - 22} cy={y} r={7} fill="none" stroke="#6366f1" strokeWidth="0.8" />
          <text x={m - 22} y={y + 3} textAnchor="middle" fontSize="8" fill="#6366f1">{r + 1}</text>
        </g>);
      })}
      {/* External walls (thick) */}
      <rect x={m} y={m} width={W} height={H} fill="none" stroke="#1e293b" strokeWidth={wallExt} />
      <rect x={m + wallExt / 2} y={m + wallExt / 2} width={W - wallExt} height={H - wallExt} fill="#fafafa" stroke="#475569" strokeWidth="0.5" />
      {/* Rooms with walls, doors, windows */}
      {layoutRooms.map((lr, idx) => {
        const rx = m + wallExt + lr.x, ry = m + wallExt + lr.y;
        const rw = lr.w, rh = lr.h;
        const isBath = lr.room.roomType === 'bathroom';
        const isKitchen = lr.room.roomType === 'kitchen';
        const area = lr.room.length * lr.room.width;
        return (
          <g key={lr.room.id}>
            {/* Room fill */}
            <rect x={rx} y={ry} width={rw} height={rh} fill={roomColors[lr.room.roomType] || '#f8fafc'} stroke="#64748b" strokeWidth={wallInt} />
            {/* Bathroom hatching */}
            {isBath && Array.from({ length: Math.ceil(rw / 4) }).map((_, i) => (
              <line key={`bh${i}`} x1={rx + i * 4} y1={ry} x2={rx + i * 4 + 4} y2={ry + Math.min(4, rh)} stroke="#94a3b8" strokeWidth="0.3" />
            ))}
            {/* Room name */}
            <text x={rx + rw / 2} y={ry + rh / 2 - 5} textAnchor="middle" fontSize={rw > 60 ? "9" : "7"} fontWeight="bold" fill="#334155">{lr.room.roomName}</text>
            <text x={rx + rw / 2} y={ry + rh / 2 + 6} textAnchor="middle" fontSize="7" fill="#64748b">{lr.room.length}×{lr.room.width}م</text>
            <text x={rx + rw / 2} y={ry + rh / 2 + 16} textAnchor="middle" fontSize="6" fill="#94a3b8">{area.toFixed(1)}م²</text>
            {/* Door swing */}
            {idx > 0 && (
              <g>
                <line x1={rx} y1={ry + rh / 2 - 8} x2={rx} y2={ry + rh / 2 + 8} stroke="white" strokeWidth={wallInt + 1} />
                <path d={`M ${rx} ${ry + rh / 2 - 8} A 16 16 0 0 1 ${rx - 12} ${ry + rh / 2 + 4}`} fill="none" stroke="#92400e" strokeWidth="0.8" />
                <line x1={rx} y1={ry + rh / 2 - 8} x2={rx - 12} y2={ry + rh / 2 + 4} stroke="#92400e" strokeWidth="0.5" />
              </g>
            )}
            {/* Windows (exterior rooms) */}
            {lr.y === 0 && rw > 40 && (
              <g>
                <line x1={rx + rw * 0.3} y1={ry} x2={rx + rw * 0.7} y2={ry} stroke="#60a5fa" strokeWidth="3" />
                <line x1={rx + rw * 0.3} y1={ry - 1} x2={rx + rw * 0.7} y2={ry - 1} stroke="#60a5fa" strokeWidth="1" />
              </g>
            )}
            {/* Bathroom fixtures */}
            {isBath && <>
              <rect x={rx + 5} y={ry + rh - 12} width={8} height={10} fill="white" stroke="#475569" strokeWidth="0.8" rx="1" />
              <circle cx={rx + rw - 10} cy={ry + 10} r={5} fill="white" stroke="#475569" strokeWidth="0.8" />
              <text x={rx + 7} y={ry + rh - 4} fontSize="4" fill="#475569">WC</text>
            </>}
            {/* Kitchen counter */}
            {isKitchen && <rect x={rx + 3} y={ry + 3} width={rw - 6} height={8} fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="0.8" rx="1" />}
          </g>
        );
      })}
      {/* Columns */}
      {Array.from({ length: floor.columnsCount || 12 }).map((_, i) => {
        const r = Math.floor(i / colCols), c = i % colCols;
        if (r >= colRows) return null;
        const x = m + wallExt + (c / Math.max(colCols - 1, 1)) * (W - wallExt * 2);
        const y = m + wallExt + (r / Math.max(colRows - 1, 1)) * (H - wallExt * 2);
        return <rect key={`col${i}`} x={x - 3} y={y - 4} width={6} height={8} fill="#1e293b" rx="0.5" />;
      })}
      {/* Stairs */}
      <g transform={`translate(${m + W - 45}, ${m + H - 35})`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={i} x={0} y={i * 5} width={25} height={4} fill="rgba(148,163,184,0.2)" stroke="#94a3b8" strokeWidth="0.5" />
        ))}
        <text x={12} y={-3} textAnchor="middle" fontSize="6" fill="#64748b">↑ UP</text>
      </g>
      {/* Dimension chains */}
      <DimLine x1={m} y1={m + H + 20} x2={m + W} y2={m + H + 20} label={`${bw.toFixed(1)}م`} />
      <DimLine x1={m - 15} y1={m} x2={m - 15} y2={m + H} label={`${bl.toFixed(1)}م`} />
      {/* Level + North + Scale */}
      <text x={m + 5} y={m + H + 40} fontSize="8" fill="#16a34a" fontWeight="bold">+{floorLevel.toFixed(2)}</text>
      <NorthArrow x={svgW - 25} y={m - 10} />
      <ScaleBar x={m} y={svgH - 65} sc={sc} />
      <TitleBlock width={svgW} y={svgH - 65} title={`${floor.name} — مسقط أفقي`} titleEn={`FLOOR PLAN — ${floor.area}m²`} sheetId={`A-${String(floorIdx + 2).padStart(2, '0')}`} scale="1:100" />
    </svg>
  );
};

// =================== SVG 8: Roof Plan (NEW!) ===================
const SvgRoofPlan: React.FC<{ bp: BlueprintConfig }> = ({ bp }) => {
  const sc = 10, m = 50;
  const bw = bp.plotWidth - bp.setbackSide * 2, bl = bp.plotLength - bp.setbackFront - (bp.setbackRear || 2);
  const W = bw * sc, H = bl * sc;
  const svgW = W + m * 2 + 20, svgH = H + m * 2 + 60;
  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-slate-50 rounded-lg" style={{ maxHeight: 450 }}>
      {/* Parapet */}
      <rect x={m} y={m} width={W} height={H} fill="rgba(148,163,184,0.08)" stroke="#1e293b" strokeWidth="3" />
      <rect x={m + 4} y={m + 4} width={W - 8} height={H - 8} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
      <text x={m + 10} y={m + 18} fontSize="8" fill="#64748b">بارابيت ارتفاع 0.9م</text>
      {/* Slope arrows (drainage) */}
      {[0.25, 0.5, 0.75].map(f => (
        <g key={`sa${f}`}>
          <line x1={m + W * f} y1={m + 20} x2={m + W * f} y2={m + H - 20} stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="4,3" />
          <polygon points={`${m + W * f - 3},${m + H - 25} ${m + W * f},${m + H - 15} ${m + W * f + 3},${m + H - 25}`} fill="#3b82f6" />
        </g>
      ))}
      <text x={m + W / 2} y={m + H / 2} textAnchor="middle" fontSize="9" fill="#3b82f6">ميول 1% → الصرف | Slope 1%</text>
      {/* Roof drains */}
      <circle cx={m + W * 0.25} cy={m + H - 15} r={5} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
      <circle cx={m + W * 0.75} cy={m + H - 15} r={5} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
      <text x={m + W * 0.25} y={m + H - 5} textAnchor="middle" fontSize="6" fill="#3b82f6">بلاعة</text>
      <text x={m + W * 0.75} y={m + H - 5} textAnchor="middle" fontSize="6" fill="#3b82f6">بلاعة</text>
      {/* AC outdoor units */}
      {Array.from({ length: Math.min(5, bp.floors.length * 3) }).map((_, i) => (
        <g key={`ac${i}`}>
          <rect x={m + W - 25} y={m + 20 + i * 25} width={18} height={18} fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="1" rx="2" />
          <text x={m + W - 16} y={m + 32 + i * 25} textAnchor="middle" fontSize="5" fill="#0891b2">AC{i + 1}</text>
        </g>
      ))}
      {/* Water tank */}
      <rect x={m + 10} y={m + 10} width={25} height={18} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1" rx="2" />
      <text x={m + 22} y={m + 22} textAnchor="middle" fontSize="6" fill="#3b82f6">خزان علوي</text>
      {/* Stair access */}
      <rect x={m + W / 2 - 12} y={m + 10} width={24} height={18} fill="rgba(148,163,184,0.2)" stroke="#475569" strokeWidth="1" rx="2" />
      <text x={m + W / 2} y={m + 22} textAnchor="middle" fontSize="6" fill="#475569">سلم سطح</text>
      <NorthArrow x={svgW - 25} y={m - 5} />
      <DimLine x1={m} y1={m + H + 15} x2={m + W} y2={m + H + 15} label={`${bw.toFixed(1)}م`} />
      <TitleBlock width={svgW} y={svgH - 65} title="مخطط السطح" titleEn="ROOF PLAN" sheetId="A-10" scale="1:100" />
    </svg>
  );
};

// =================== SVG 9: Cross Section ===================
const SvgCrossSection: React.FC<{ bp: BlueprintConfig; colSpec: ColumnSpec }> = ({ bp, colSpec }) => {
  const sc = 22, m = 60;
  const excD = bp.excavation?.excavationDepth || 1.5;
  const zl = bp.excavation?.zeroLevel || 0.3;
  const totalH = bp.floors.reduce((s, f) => s + f.height, 0) + excD + zl + 2;
  const sW = bp.plotWidth - bp.setbackSide * 2;
  const W = sW * sc, H = totalH * sc;
  const svgW = W + m * 2 + 150, svgH = H + m * 2 + 10;
  const gnd = m + (zl + 1.5) * sc;
  const wallThick = 5;

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-white rounded-lg border" style={{ maxHeight: 500 }}>
      {/* Ground */}
      <line x1={m - 15} y1={gnd} x2={m + W + 15} y2={gnd} stroke="#22c55e" strokeWidth="2" strokeDasharray="6,3" />
      <text x={m + W + 20} y={gnd + 4} fontSize="9" fill="#22c55e" fontWeight="bold">±0.00</text>
      {/* Earth hatching */}
      <rect x={m - 10} y={gnd} width={W + 20} height={excD * sc + 10} fill="rgba(139,92,42,0.06)" />
      {Array.from({ length: Math.ceil(W / 10) }).map((_, i) => (
        <circle key={`dot${i}`} cx={m + i * 10 + 5} cy={gnd + 5} r={1} fill="#8b5c2a" opacity="0.3" />
      ))}
      {/* Excavation */}
      <rect x={m} y={gnd} width={W} height={excD * sc} fill="none" stroke="#8b5c2a" strokeWidth="1" strokeDasharray="4,2" />
      <text x={m + W + 20} y={gnd + excD * sc / 2} fontSize="8" fill="#8b5c2a">حفر {excD}م</text>
      {/* === v8.0: Shoring (سند جوانب) === */}
      {bp.excavation?.shoringRequired && bp.excavation?.shoringType !== 'none' && (() => {
        const shDepth = (bp.excavation?.shoringDepth || excD) * sc;
        const shoringColor = bp.excavation?.shoringType === 'steel_sheet' ? '#1e40af' :
          bp.excavation?.shoringType === 'concrete_piles' ? '#6b7280' :
          bp.excavation?.shoringType === 'soldier_piles' ? '#7c3aed' : '#92400e';
        const lineW = bp.excavation?.shoringType === 'timber' ? 2 : 3;
        return <>
          {/* Left shoring */}
          <rect x={m - 4} y={gnd} width={lineW + 1} height={shDepth} fill={shoringColor} opacity="0.7" />
          {/* Right shoring */}
          <rect x={m + W + 1} y={gnd} width={lineW + 1} height={shDepth} fill={shoringColor} opacity="0.7" />
          {/* Cross bracing */}
          {bp.excavation?.shoringType !== 'timber' && <>
            <line x1={m - 2} y1={gnd + shDepth * 0.3} x2={m + 10} y2={gnd + shDepth * 0.3} stroke={shoringColor} strokeWidth="1.5" />
            <line x1={m + W - 10} y1={gnd + shDepth * 0.3} x2={m + W + 3} y2={gnd + shDepth * 0.3} stroke={shoringColor} strokeWidth="1.5" />
            <line x1={m - 2} y1={gnd + shDepth * 0.7} x2={m + 10} y2={gnd + shDepth * 0.7} stroke={shoringColor} strokeWidth="1.5" />
            <line x1={m + W - 10} y1={gnd + shDepth * 0.7} x2={m + W + 3} y2={gnd + shDepth * 0.7} stroke={shoringColor} strokeWidth="1.5" />
          </>}
          {/* Label */}
          <text x={m - 12} y={gnd + shDepth / 2} fontSize="7" fill={shoringColor} textAnchor="end"
            transform={`rotate(-90,${m - 12},${gnd + shDepth / 2})`}>
            سند جوانب | Shoring
          </text>
        </>;
      })()}
      {/* === v8.0: Dewatering (نزح مياه جوفية) === */}
      {bp.excavation?.dewateringRequired && bp.excavation?.dewateringType !== 'none' && (() => {
        const wtDepth = (bp.excavation?.waterTableDepth || excD * 0.7) * sc;
        return <>
          {/* Water table line */}
          <line x1={m - 15} y1={gnd + wtDepth} x2={m + W + 15} y2={gnd + wtDepth}
            stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="8,3,2,3" />
          <text x={m + W + 20} y={gnd + wtDepth + 4} fontSize="7" fill="#0ea5e9" fontWeight="bold">💧 منسوب مياه جوفية</text>
          {/* Water waves */}
          {Array.from({ length: Math.ceil(W / 20) }).map((_, i) => (
            <path key={`wave${i}`} d={`M ${m + i * 20} ${gnd + wtDepth + 3} q 5,-3 10,0 t 10,0`}
              fill="none" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.4" />
          ))}
          {/* Pump symbol */}
          <circle cx={m + W + 8} cy={gnd + wtDepth - 5} r={4} fill="#0ea5e9" opacity="0.3" stroke="#0ea5e9" strokeWidth="1" />
          <text x={m + W + 8} y={gnd + wtDepth - 3} textAnchor="middle" fontSize="5" fill="#0ea5e9">P</text>
        </>;
      })()}
      {/* Foundation */}
      {bp.foundation && <>
        <rect x={m + 15} y={gnd + (excD - 0.1) * sc} width={W - 30} height={3} fill="#94a3b8" />
        <text x={m + W + 20} y={gnd + (excD - 0.05) * sc} fontSize="7" fill="#94a3b8">نظافة 10سم</text>
        <rect x={m + 30} y={gnd + (excD - 0.1 - (bp.foundation.footingDepth || 0.5)) * sc} width={(bp.foundation.footingWidth || 1.2) * sc} height={(bp.foundation.footingDepth || 0.5) * sc} fill="rgba(99,102,241,0.25)" stroke="#6366f1" strokeWidth="1.5" />
        {/* Neck column */}
        <rect x={m + 35} y={gnd - (bp.foundation.neckColumnHeight || 0.5) * sc} width={8} height={(bp.foundation.neckColumnHeight || 0.5) * sc} fill="#475569" />
        {/* DPC */}
        <line x1={m - 5} y1={gnd - 3} x2={m + W + 5} y2={gnd - 3} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="2,2" />
        <text x={m + W + 20} y={gnd - 1} fontSize="7" fill="#dc2626">DPC</text>
      </>}
      {/* Zero level */}
      <line x1={m - 10} y1={gnd - zl * sc} x2={m + W + 10} y2={gnd - zl * sc} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x={m + W + 20} y={gnd - zl * sc + 4} fontSize="9" fill="#ef4444" fontWeight="bold">+{zl.toFixed(2)}</text>
      {/* Floors */}
      {(() => {
        let cy = gnd - zl * sc;
        return bp.floors.map((floor, i) => {
          const fh = floor.height * sc;
          const y = cy - fh;
          const level = bp.floors.slice(0, i + 1).reduce((s, f) => s + f.height, 0) + zl;
          cy = y;
          return (
            <g key={floor.id}>
              {/* Floor space */}
              <rect x={m} y={y} width={W} height={fh} fill={`rgba(99,102,241,${0.03 + i * 0.02})`} stroke="none" />
              {/* Walls (double line) */}
              <rect x={m} y={y} width={wallThick} height={fh} fill="#475569" />
              <rect x={m + W - wallThick} y={y} width={wallThick} height={fh} fill="#475569" />
              {/* Column */}
              <rect x={m + 50} y={y} width={8} height={fh} fill="#334155" />
              {/* Slab */}
              <rect x={m} y={y} width={W} height={5} fill="#475569" />
              {/* Floor finish */}
              <rect x={m + wallThick} y={y + fh - 2} width={W - wallThick * 2} height={2} fill="#d97706" opacity="0.3" />
              {/* Ceiling finish */}
              <rect x={m + wallThick} y={y + 5} width={W - wallThick * 2} height={2} fill="#94a3b8" opacity="0.3" />
              {/* Windows */}
              <rect x={m + W - wallThick} y={y + fh * 0.3} width={wallThick} height={fh * 0.4} fill="#93c5fd" />
              {/* Labels */}
              <text x={m + W + 20} y={y + fh / 2} fontSize="8" fill="#475569">{floor.name} ({floor.height}م)</text>
              <text x={m + W + 20} y={y + 4} fontSize="8" fill="#16a34a" fontWeight="bold">+{level.toFixed(2)}</text>
            </g>
          );
        });
      })()}
      {/* Stairs */}
      {(() => {
        let cy = gnd - zl * sc;
        if (bp.floors.length < 2) return null;
        const fh = bp.floors[0].height * sc;
        return <line x1={m + W * 0.6} y1={cy} x2={m + W * 0.75} y2={cy - fh} stroke="#475569" strokeWidth="2" strokeDasharray="3,2" />;
      })()}
      {/* Parapet */}
      {(() => {
        const topY = gnd - zl * sc - bp.floors.reduce((s, f) => s + f.height, 0) * sc;
        return <>
          <rect x={m} y={topY - 18} width={wallThick} height={18} fill="#475569" />
          <rect x={m + W - wallThick} y={topY - 18} width={wallThick} height={18} fill="#475569" />
          <text x={m + W + 20} y={topY - 8} fontSize="7" fill="#475569">بارابيت 0.9م</text>
          {/* Roof waterproofing */}
          <line x1={m} y1={topY - 1} x2={m + W} y2={topY - 1} stroke="#3b82f6" strokeWidth="1.5" />
          <text x={m + W + 20} y={topY + 3} fontSize="6" fill="#3b82f6">عزل مائي+حراري</text>
        </>;
      })()}
      <TitleBlock width={svgW} y={svgH - 65} title="القطاع الرأسي" titleEn="CROSS SECTION A-A" sheetId="A-11" scale="1:50" />
    </svg>
  );
};

// =================== SVG 10: Elevations (4 views) ===================
const SvgElevations: React.FC<{ bp: BlueprintConfig }> = ({ bp }) => {
  const sc = 10, m = 30;
  const totalH = bp.floors.reduce((s, f) => s + f.height, 0) + 1;
  const mainW = (bp.plotWidth - bp.setbackSide * 2);
  const sideW = (bp.plotLength - bp.setbackFront - (bp.setbackRear || 2));
  const views = [
    { label: 'الواجهة الأمامية', labelEn: 'FRONT', facW: mainW },
    { label: 'الواجهة الخلفية', labelEn: 'REAR', facW: mainW },
    { label: 'الواجهة اليمنى', labelEn: 'RIGHT', facW: sideW },
    { label: 'الواجهة اليسرى', labelEn: 'LEFT', facW: sideW },
  ];
  const eachH = totalH * sc + 30;
  const svgW = 750, svgH = eachH * 2 + m * 3 + 50;

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-sky-50/20 rounded-lg border" style={{ maxHeight: 700 }}>
      {views.map((v, vi) => {
        const col = vi % 2, row = Math.floor(vi / 2);
        const ox = m + col * 370, oy = m + row * (eachH + 20);
        const W = v.facW * sc, H = totalH * sc;
        return (
          <g key={vi} transform={`translate(${ox},${oy})`}>
            {/* Building */}
            <rect x={0} y={0} width={W} height={H} fill="rgba(241,245,249,0.8)" stroke="#1e293b" strokeWidth="1.5" />
            {/* Stone base (bottom 1/3) */}
            <rect x={0} y={H * 0.65} width={W} height={H * 0.35} fill="rgba(217,119,6,0.08)" stroke="none" />
            {Array.from({ length: Math.ceil(W / 12) }).map((_, i) => (
              <line key={`stone${i}`} x1={i * 12} y1={H * 0.65} x2={i * 12} y2={H} stroke="#d97706" strokeWidth="0.3" />
            ))}
            {/* Floors & windows */}
            {(() => {
              let cy = H;
              return bp.floors.map((floor, i) => {
                const fh = floor.height * sc;
                cy -= fh;
                const windowCount = Math.max(2, Math.floor(v.facW / 3.5));
                const winW = (W - 30) / windowCount * 0.55;
                const winH = fh * 0.4;
                return (<g key={i}>
                  <line x1={0} y1={cy} x2={W} y2={cy} stroke="#94a3b8" strokeWidth="0.8" />
                  {Array.from({ length: windowCount }).map((_, w) => {
                    const wx = 15 + w * ((W - 30) / windowCount);
                    return <rect key={w} x={wx} y={cy + fh * 0.25} width={winW} height={winH} fill="rgba(147,197,253,0.4)" stroke="#60a5fa" strokeWidth="0.8" rx="1" />;
                  })}
                  {i === 0 && vi === 0 && <rect x={W / 2 - 10} y={cy + fh * 0.3} width={20} height={fh * 0.65} fill="rgba(139,92,42,0.3)" stroke="#92400e" strokeWidth="0.8" rx="1" />}
                  {/* Cornice */}
                  <line x1={0} y1={cy} x2={W} y2={cy} stroke="#94a3b8" strokeWidth="0.5" />
                  <rect x={-2} y={cy - 2} width={W + 4} height={3} fill="rgba(148,163,184,0.2)" stroke="#94a3b8" strokeWidth="0.3" />
                </g>);
              });
            })()}
            {/* Parapet */}
            <rect x={0} y={0} width={W} height={sc * 0.8} fill="rgba(148,163,184,0.2)" stroke="#94a3b8" strokeWidth="0.8" />
            {/* Ground line */}
            <line x1={-5} y1={H} x2={W + 5} y2={H} stroke="#22c55e" strokeWidth="1.5" />
            {/* Label */}
            <text x={W / 2} y={H + 15} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">{v.label} | {v.labelEn}</text>
          </g>
        );
      })}
      <TitleBlock width={svgW} y={svgH - 65} title="الواجهات — 4 واجهات" titleEn="ELEVATIONS — ALL SIDES" sheetId="A-12" scale="1:100" />
    </svg>
  );
};

// =================== SVG 11: Plumbing (ALL rooms on plan) ===================
const SvgPlumbingPlan: React.FC<{ bp: BlueprintConfig; rooms: RoomFinishSchedule[] }> = ({ bp, rooms }) => {
  const svgW = 720, svgH = 400;
  const wetRooms = rooms.filter(r => ['bathroom', 'kitchen'].includes(r.roomType));
  const boxW = Math.min(130, (svgW - 60) / Math.max(wetRooms.length, 1));

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-blue-50/20 rounded-lg border" style={{ maxHeight: 450 }}>
      {/* Main supply line */}
      <line x1={20} y1={svgH - 80} x2={svgW - 20} y2={svgH - 80} stroke="#3b82f6" strokeWidth="3" />
      <text x={svgW / 2} y={svgH - 68} textAnchor="middle" fontSize="8" fill="#3b82f6">← ماسورة تغذية رئيسية PPR Ø{bp.mepConfig?.plumbing?.mainLineSize_mm || 25}mm →</text>
      {/* Hot water line */}
      <line x1={20} y1={svgH - 65} x2={svgW - 20} y2={svgH - 65} stroke="#ef4444" strokeWidth="2" strokeDasharray="6,3" />
      <text x={svgW / 2} y={svgH - 56} textAnchor="middle" fontSize="7" fill="#ef4444">← ماسورة ساخنة PPR →</text>
      {/* Drain line */}
      <line x1={20} y1={svgH - 50} x2={svgW - 20} y2={svgH - 50} stroke="#22c55e" strokeWidth="4" />
      <text x={svgW / 2} y={svgH - 40} textAnchor="middle" fontSize="8" fill="#22c55e">← ماسورة صرف رئيسي UPVC Ø100mm →</text>
      {/* Room blocks - ALL wet rooms */}
      {wetRooms.map((room, idx) => {
        const x = 20 + idx * (boxW + 5), y = 15;
        const fixtures = DEFAULT_FIXTURES_BY_ROOM[room.roomType] || [];
        return (
          <g key={room.id || idx}>
            <rect x={x} y={y} width={boxW} height={svgH - 120} fill="rgba(191,219,254,0.1)" stroke="#3b82f6" strokeWidth="1.5" rx="4" />
            <text x={x + boxW / 2} y={y + 14} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1e40af">{room.roomName}</text>
            <text x={x + boxW / 2} y={y + 24} textAnchor="middle" fontSize="7" fill="#64748b">{room.length}×{room.width}م</text>
            {/* Fixtures */}
            {fixtures.map((ft, fi) => {
              const fd = PLUMBING_FIXTURE_DATA[ft];
              if (!fd) return null;
              const fy = y + 30 + fi * 22;
              if (fy > svgH - 130) return null;
              return (
                <g key={fi}>
                  <text x={x + 5} y={fy + 10} fontSize="11">{fd.symbol}</text>
                  <text x={x + 22} y={fy + 10} fontSize="7" fill="#475569">{fd.nameAr}</text>
                  {/* Supply pipe */}
                  <line x1={x + boxW - 20} y1={fy + 4} x2={x + boxW - 5} y2={fy + 4} stroke="#3b82f6" strokeWidth="1.5" />
                  {/* Drain pipe */}
                  <line x1={x + boxW - 20} y1={fy + 10} x2={x + boxW - 5} y2={fy + 10} stroke={fd.drain_mm >= 100 ? '#22c55e' : '#94a3b8'} strokeWidth={fd.drain_mm >= 100 ? 2.5 : 1.5} />
                  <text x={x + boxW - 12} y={fy + 19} textAnchor="middle" fontSize="5" fill="#64748b">Ø{fd.drain_mm}</text>
                </g>
              );
            })}
            {/* Floor drain */}
            <circle cx={x + boxW / 2} cy={svgH - 125} r={4} fill="none" stroke="#22c55e" strokeWidth="1" />
            <line x1={x + boxW / 2 - 2} y1={svgH - 127} x2={x + boxW / 2 + 2} y2={svgH - 123} stroke="#22c55e" strokeWidth="0.8" />
            <text x={x + boxW / 2} y={svgH - 117} textAnchor="middle" fontSize="5" fill="#22c55e">بلاعة</text>
            {/* Riser */}
            <line x1={x + boxW} y1={y + 25} x2={x + boxW} y2={svgH - 110} stroke="#22c55e" strokeWidth="3" />
            {/* Connection to main */}
            <line x1={x + boxW / 2} y1={svgH - 110} x2={x + boxW / 2} y2={svgH - 80} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,2" />
          </g>
        );
      })}
      {/* Water heater */}
      <rect x={svgW - 60} y={15} width={45} height={30} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="1.5" rx="4" />
      <text x={svgW - 37} y={28} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#ef4444">سخان مياه</text>
      <text x={svgW - 37} y={38} textAnchor="middle" fontSize="6" fill="#64748b">{bp.mepConfig?.plumbing?.waterHeaterType || 'central'}</text>
      {/* Ground tank */}
      <rect x={10} y={svgH - 35} width={50} height={20} fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth="1" rx="3" />
      <text x={35} y={svgH - 22} textAnchor="middle" fontSize="7" fill="#3b82f6">خزان أرضي {((bp.mepConfig?.plumbing?.groundTankLiters || 2000) / 1000).toFixed(0)}م³</text>
      {/* Water meter */}
      <circle cx={5} cy={svgH - 80} r={4} fill="#3b82f6" opacity="0.3" />
      <text x={5} y={svgH - 90} textAnchor="middle" fontSize="6" fill="#3b82f6">عداد</text>
      {/* Legend */}
      <g transform={`translate(10, ${svgH - 15})`}>
        <line x1={0} y1={0} x2={20} y2={0} stroke="#3b82f6" strokeWidth="2" /><text x={25} y={4} fontSize="7" fill="#3b82f6">تغذية باردة</text>
        <line x1={110} y1={0} x2={130} y2={0} stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2" /><text x={135} y={4} fontSize="7" fill="#ef4444">تغذية ساخنة</text>
        <line x1={220} y1={0} x2={240} y2={0} stroke="#22c55e" strokeWidth="3" /><text x={245} y={4} fontSize="7" fill="#22c55e">صرف ≥100mm</text>
        <circle cx={340} cy={0} r={3} fill="none" stroke="#22c55e" strokeWidth="1" /><text x={350} y={4} fontSize="7" fill="#22c55e">بلاعة أرضية</text>
      </g>
      <TitleBlock width={svgW} y={svgH - 65} title="مخطط السباكة" titleEn="PLUMBING PLAN" sheetId="M-01" scale="NTS" />
    </svg>
  );
};

// =================== SVG 12: Electrical (ALL rooms on plan) ===================
const SvgElectricalPlan: React.FC<{ bp: BlueprintConfig; rooms: RoomFinishSchedule[] }> = ({ bp, rooms }) => {
  const svgW = 720, svgH = 450;
  const socketsPerM2 = 0.25; // 1 per 4m² SBC 401

  const roomData = rooms.map(r => {
    const area = r.length * r.width;
    const sockets = Math.max(2, Math.ceil(area * socketsPerM2));
    const lights = DEFAULT_LIGHT_POINTS[r.roomType] || 2;
    const switches = Math.ceil(lights / 2);
    const ac = !['bathroom', 'corridor', 'storage'].includes(r.roomType) ? 1 : 0;
    return { room: r, area, sockets, lights, switches, ac };
  });

  const totalSockets = roomData.reduce((s, r) => s + r.sockets, 0);
  const totalLights = roomData.reduce((s, r) => s + r.lights, 0);
  const totalAC = roomData.reduce((s, r) => s + r.ac, 0);
  const socketCircuits = Math.ceil(totalSockets / CIRCUIT_SPECS.max_sockets_per_circuit);
  const lightCircuits = Math.ceil(totalLights / CIRCUIT_SPECS.max_lights_per_circuit);
  const dbWays = socketCircuits + lightCircuits + totalAC + 4;
  const boxW = Math.min(105, (svgW - 200) / Math.max(rooms.length, 1));

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-yellow-50/10 rounded-lg border" style={{ maxHeight: 520 }}>
      {/* DB Panel */}
      <g transform="translate(15, 20)">
        <rect width={160} height={Math.min(280, svgH - 120)} fill="#f8fafc" stroke="#1e293b" strokeWidth="2" rx="4" />
        <rect width={160} height={22} fill="#1e293b" rx="4" />
        <text x={80} y={15} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">لوحة التوزيع DB ({dbWays} خط)</text>
        <text x={80} y={36} textAnchor="middle" fontSize="8" fill="#ef4444">قاطع رئيسي {bp.mepConfig?.electrical?.mainBreakerAmps || 63}A</text>
        {/* Circuits */}
        {Array.from({ length: lightCircuits }).map((_, i) => (
          <g key={`lc${i}`}><rect x={5} y={42 + i * 16} width={150} height={14} fill="rgba(234,179,8,0.1)" stroke="#eab308" strokeWidth="0.5" rx="2" />
            <text x={10} y={42 + i * 16 + 11} fontSize="7" fill="#92400e">💡 إنارة {i + 1} ({CIRCUIT_SPECS.lighting_breaker_A}A | 1.5mm²)</text></g>
        ))}
        {Array.from({ length: socketCircuits }).map((_, i) => (
          <g key={`sc${i}`}><rect x={5} y={42 + lightCircuits * 16 + i * 16} width={150} height={14} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth="0.5" rx="2" />
            <text x={10} y={42 + lightCircuits * 16 + i * 16 + 11} fontSize="7" fill="#dc2626">🔌 أفياش {i + 1} ({CIRCUIT_SPECS.socket_breaker_A}A | 2.5mm²)</text></g>
        ))}
        {Array.from({ length: Math.min(totalAC, 4) }).map((_, i) => (
          <g key={`ac${i}`}><rect x={5} y={42 + (lightCircuits + socketCircuits) * 16 + i * 16} width={150} height={14} fill="rgba(6,182,212,0.08)" stroke="#06b6d4" strokeWidth="0.5" rx="2" />
            <text x={10} y={42 + (lightCircuits + socketCircuits) * 16 + i * 16 + 11} fontSize="7" fill="#0891b2">❄️ تكييف {i + 1} ({CIRCUIT_SPECS.ac_breaker_A}A | 4mm²)</text></g>
        ))}
        {/* Special circuits */}
        <g><rect x={5} y={42 + (lightCircuits + socketCircuits + Math.min(totalAC, 4)) * 16} width={150} height={14} fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeWidth="0.5" rx="2" />
          <text x={10} y={42 + (lightCircuits + socketCircuits + Math.min(totalAC, 4)) * 16 + 11} fontSize="7" fill="#7c3aed">🔥 فرن/غسالة 32A | 6mm²</text></g>
        {/* Earthing */}
        <text x={80} y={Math.min(275, svgH - 130)} textAnchor="middle" fontSize="8" fill="#16a34a">⏚ تأريض | RCD 30mA</text>
      </g>
      {/* Room boxes - ALL rooms */}
      {roomData.map((rd, idx) => {
        const col = idx % Math.ceil(rooms.length / 2), row = Math.floor(idx / Math.ceil(rooms.length / 2));
        const x = 195 + col * (boxW + 5), y = 20 + row * 160;
        if (x + boxW > svgW - 10) return null;
        return (
          <g key={rd.room.id || idx}>
            <rect x={x} y={y} width={boxW} height={145} fill="rgba(253,230,138,0.06)" stroke="#d97706" strokeWidth="1" rx="4" />
            <text x={x + boxW / 2} y={y + 13} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400e">{rd.room.roomName}</text>
            <text x={x + boxW / 2} y={y + 23} textAnchor="middle" fontSize="6" fill="#64748b">{rd.area.toFixed(0)}م²</text>
            <text x={x + 8} y={y + 40} fontSize="8">💡 ×{rd.lights}</text><text x={x + boxW / 2 + 5} y={y + 40} fontSize="6" fill="#64748b">إنارة</text>
            <text x={x + 8} y={y + 55} fontSize="8">🔌 ×{rd.sockets}</text><text x={x + boxW / 2 + 5} y={y + 55} fontSize="6" fill="#64748b">أفياش</text>
            <text x={x + 8} y={y + 70} fontSize="8">🔲 ×{rd.switches}</text><text x={x + boxW / 2 + 5} y={y + 70} fontSize="6" fill="#64748b">مفاتيح</text>
            {rd.ac > 0 && <><text x={x + 8} y={y + 85} fontSize="8">❄️ ×{rd.ac}</text><text x={x + boxW / 2 + 5} y={y + 85} fontSize="6" fill="#64748b">تكييف</text></>}
            {/* Low current */}
            <line x1={x + 5} y1={y + 95} x2={x + boxW - 5} y2={y + 95} stroke="#e2e8f0" strokeWidth="0.5" />
            <text x={x + 8} y={y + 108} fontSize="7" fill="#7c3aed">📡 بيانات ×1</text>
            {rd.room.roomType === 'living' && <text x={x + 8} y={y + 120} fontSize="7" fill="#7c3aed">📺 TV ×1</text>}
            {['bathroom', 'corridor'].includes(rd.room.roomType) && <text x={x + 8} y={y + 120} fontSize="7" fill="#ef4444">🔥 كاشف دخان</text>}
            {/* Cable from DB */}
            <line x1={175} y1={y + 70} x2={x} y2={y + 70} stroke="#d97706" strokeWidth="0.5" strokeDasharray="3,3" />
          </g>
        );
      })}
      {/* Summary */}
      <g transform={`translate(15, ${svgH - 85})`}>
        <rect width={svgW - 30} height={28} fill="#fffbeb" stroke="#fbbf24" strokeWidth="1" rx="4" />
        <text x={10} y={13} fontSize="8" fontWeight="bold" fill="#92400e">ملخص: {dbWays} خط DB | {totalSockets} فيشة ({socketsPerM2}/م²) | {totalLights} إنارة | {totalAC} تكييف | كاشف دخان بكل غرفة</text>
        <text x={10} y={24} fontSize="7" fill="#64748b">RCD 30mA | GFCI بحمامات ومطبخ | كابلات SASO | أنابيب PVC | إنتركم+كاميرا عند المدخل</text>
      </g>
      <TitleBlock width={svgW} y={svgH - 65} title="مخطط الكهرباء" titleEn="ELECTRICAL PLAN" sheetId="E-01" scale="NTS" />
    </svg>
  );
};

const CABLE_SIZES_TEXT = { lighting: '1.5mm²', sockets: '2.5mm²', ac: '4mm²' };

// =================== SVG 13: HVAC (ALL rooms) ===================
const SvgHVACPlan: React.FC<{ bp: BlueprintConfig; rooms: RoomFinishSchedule[] }> = ({ bp, rooms }) => {
  const svgW = 720, svgH = 420;
  const acRooms = rooms.filter(r => !['bathroom', 'corridor', 'storage'].includes(r.roomType));
  const boxW = Math.min(120, (svgW - 40) / Math.max(acRooms.length, 1));
  let totalTons = 0;

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-cyan-50/10 rounded-lg border" style={{ maxHeight: 480 }}>
      {acRooms.map((room, idx) => {
        const col = idx % Math.ceil(acRooms.length / 2), row = Math.floor(idx / Math.ceil(acRooms.length / 2));
        const x = 20 + col * (boxW + 5), y = 15 + row * 165;
        const area = room.length * room.width;
        const btu = area * (COOLING_LOAD_BTU_PER_M2[room.roomType] || 500);
        const tons = btu / HVAC_CONSTANTS.btu_per_ton;
        totalTons += tons;
        const unitType = tons <= 1.5 ? 'سبليت عادي' : tons <= 3 ? 'سبليت كونسيلد' : 'كاسيت';
        if (x + boxW > svgW - 10) return null;
        return (
          <g key={room.id || idx}>
            <rect x={x} y={y} width={boxW} height={150} fill="rgba(6,182,212,0.04)" stroke="#06b6d4" strokeWidth="1.5" rx="4" />
            <text x={x + boxW / 2} y={y + 14} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0e7490">{room.roomName}</text>
            <text x={x + boxW / 2} y={y + 26} textAnchor="middle" fontSize="7" fill="#64748b">{area.toFixed(0)} م² | {room.length}×{room.width}م</text>
            <text x={x + boxW / 2} y={y + 43} textAnchor="middle" fontSize="10" fill="#0891b2" fontWeight="bold">{(btu / 1000).toFixed(0)}K BTU</text>
            <text x={x + boxW / 2} y={y + 58} textAnchor="middle" fontSize="10" fill="#06b6d4" fontWeight="bold">{tons.toFixed(1)} طن</text>
            {/* Unit type */}
            <text x={x + boxW / 2} y={y + 73} textAnchor="middle" fontSize="7" fill="#475569">{unitType}</text>
            {/* Indoor unit */}
            <rect x={x + 15} y={y + 80} width={boxW - 30} height={10} fill="#06b6d4" rx="5" opacity="0.3" />
            <text x={x + boxW / 2} y={y + 88} textAnchor="middle" fontSize="6" fill="#0e7490">وحدة داخلية</text>
            {/* Thermostat */}
            <rect x={x + 5} y={y + 95} width={12} height={8} fill="rgba(6,182,212,0.2)" stroke="#06b6d4" strokeWidth="0.5" rx="1" />
            <text x={x + 11} y={y + 101} textAnchor="middle" fontSize="4" fill="#0e7490">T°</text>
            <text x={x + 20} y={y + 101} fontSize="6" fill="#64748b">ثرموستات</text>
            {/* Condensate drain */}
            <line x1={x + boxW / 2} y1={y + 92} x2={x + boxW / 2} y2={y + 115} stroke="#06b6d4" strokeWidth="1" strokeDasharray="3,2" />
            <text x={x + boxW / 2} y={y + 123} textAnchor="middle" fontSize="6" fill="#64748b">صرف Ø{HVAC_CONSTANTS.drain_pipe_mm}mm</text>
            {/* Freon pipe to outdoor */}
            <line x1={x + boxW} y1={y + 85} x2={x + boxW + 5} y2={y + 85} stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,2" />
            {/* Fresh air vent */}
            <rect x={x + boxW - 15} y={y + 130} width={10} height={8} fill="none" stroke="#22c55e" strokeWidth="0.8" />
            <text x={x + boxW - 10} y={y + 145} textAnchor="middle" fontSize="5" fill="#22c55e">هواء نقي</text>
          </g>
        );
      })}
      {/* Outdoor units */}
      <g transform={`translate(15, ${svgH - 85})`}>
        <rect width={svgW - 30} height={30} fill="rgba(6,182,212,0.06)" stroke="#06b6d4" strokeWidth="1" rx="4" />
        <text x={10} y={13} fontSize="8" fontWeight="bold" fill="#0e7490">🔵 وحدات خارجية ({bp.mepConfig?.hvac?.condenserLocation === 'ground' ? 'أرضي' : 'السطح'}) — إجمالي: {totalTons.toFixed(1)} طن</text>
        {acRooms.map((_, i) => {
          if (i > 8) return null;
          return <rect key={i} x={300 + i * 35} y={5} width={28} height={20} fill="#0891b2" rx="3" opacity="0.25" />;
        })}
        <text x={10} y={26} fontSize="7" fill="#64748b">فريون R410A | مواسير نحاس معزولة | صرف مكثف Ø{HVAC_CONSTANTS.drain_pipe_mm}mm → أقرب نقطة صرف</text>
      </g>
      <TitleBlock width={svgW} y={svgH - 65} title="مخطط التكييف" titleEn="HVAC PLAN" sheetId="M-02" scale="NTS" />
    </svg>
  );
};

// =================== Door & Window Schedule (NEW!) ===================
const DoorWindowSchedule: React.FC<{ rooms: RoomFinishSchedule[]; isAr: boolean }> = ({ rooms, isAr }) => {
  const doors = rooms.map((r, i) => ({
    id: `D${i + 1}`,
    room: r.roomName,
    width: r.roomType === 'majlis' ? 1.2 : r.roomType === 'bathroom' ? 0.7 : 0.9,
    height: 2.1,
    type: r.roomType === 'bathroom' ? 'ألمنيوم' : r.roomType === 'majlis' ? 'خشب فاخر' : 'خشب HDF',
    swing: r.roomType === 'bathroom' ? 'خارج' : 'داخل',
  }));
  const extRooms = rooms.filter(r => !['bathroom', 'corridor', 'storage'].includes(r.roomType));
  const windows = extRooms.map((r, i) => ({
    id: `W${i + 1}`,
    room: r.roomName,
    width: r.roomType === 'majlis' ? 2.0 : r.roomType === 'living' ? 1.8 : 1.2,
    height: r.roomType === 'bathroom' ? 0.6 : 1.2,
    sill: r.roomType === 'bathroom' ? 1.5 : 0.9,
    type: 'ألمنيوم ثرمال بريك',
    glass: 'دبل جلاس 6+12+6',
  }));

  return (
    <div className="overflow-x-auto space-y-6">
      <div>
        <h4 className="font-bold text-sm text-slate-700 mb-2">🚪 جدول الأبواب</h4>
        <table className="w-full text-xs border-collapse">
          <thead><tr className="bg-slate-800 text-white">
            <th className="p-2">الرمز</th><th className="p-2 text-right">الغرفة</th><th className="p-2">العرض (م)</th><th className="p-2">الارتفاع (م)</th>
            <th className="p-2">المادة</th><th className="p-2">اتجاه الفتح</th><th className="p-2">العدد</th>
          </tr></thead>
          <tbody>
            {doors.map((d, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                <td className="p-2 text-center font-bold text-indigo-600">{d.id}</td>
                <td className="p-2 text-right">{d.room}</td>
                <td className="p-2 text-center">{d.width}</td>
                <td className="p-2 text-center">{d.height}</td>
                <td className="p-2 text-center">{d.type}</td>
                <td className="p-2 text-center">{d.swing}</td>
                <td className="p-2 text-center font-bold">1</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h4 className="font-bold text-sm text-slate-700 mb-2">🪟 جدول النوافذ</h4>
        <table className="w-full text-xs border-collapse">
          <thead><tr className="bg-slate-800 text-white">
            <th className="p-2">الرمز</th><th className="p-2 text-right">الغرفة</th><th className="p-2">العرض (م)</th><th className="p-2">الارتفاع (م)</th>
            <th className="p-2">ارتفاع الحلق</th><th className="p-2">الإطار</th><th className="p-2">الزجاج</th>
          </tr></thead>
          <tbody>
            {windows.map((w, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                <td className="p-2 text-center font-bold text-blue-600">{w.id}</td>
                <td className="p-2 text-right">{w.room}</td>
                <td className="p-2 text-center">{w.width}</td>
                <td className="p-2 text-center">{w.height}</td>
                <td className="p-2 text-center">{w.sill}</td>
                <td className="p-2 text-center">{w.type}</td>
                <td className="p-2 text-center">{w.glass}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =================== Finish Schedule (NEW!) ===================
const FINISH_NAMES: Record<string, string> = {
  porcelain_120x60: 'بورسلان 120×60', porcelain_80x80: 'بورسلان 80×80',
  ceramic_60x60: 'سيراميك 60×60', ceramic_30x60: 'سيراميك 30×60',
  marble: 'رخام طبيعي', granite: 'جرانيت',
  paint_plastic: 'دهان بلاستيك', paint_velvet: 'دهان مخملي',
  gypsum_board: 'جبس بورد', wallpaper: 'ورق جدران',
  parquet: 'باركيه', vinyl: 'فينيل', epoxy: 'إيبوكسي',
};

const FinishSchedule: React.FC<{ rooms: RoomFinishSchedule[]; isAr: boolean }> = ({ rooms }) => (
  <div className="overflow-x-auto">
    <h4 className="font-bold text-sm text-slate-700 mb-2">🎨 جدول التشطيبات</h4>
    <table className="w-full text-xs border-collapse">
      <thead><tr className="bg-slate-800 text-white">
        <th className="p-2 text-right">الغرفة</th><th className="p-2">المساحة</th>
        <th className="p-2">الأرضيات</th><th className="p-2">الجدران</th><th className="p-2">السقف</th>
        <th className="p-2">ارتفاع سيراميك</th>
      </tr></thead>
      <tbody>
        {rooms.map((r, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
            <td className="p-2 text-right font-medium">{r.roomName}</td>
            <td className="p-2 text-center">{(r.length * r.width).toFixed(1)}م²</td>
            <td className="p-2 text-center">{FINISH_NAMES[r.floorFinish] || r.floorFinish}</td>
            <td className="p-2 text-center">{FINISH_NAMES[r.wallFinish] || r.wallFinish}</td>
            <td className="p-2 text-center">{FINISH_NAMES[r.ceilingFinish] || r.ceilingFinish}</td>
            <td className="p-2 text-center">{r.wetAreaWallHeight ? `${r.wetAreaWallHeight}م` : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DrawingsPanel;
