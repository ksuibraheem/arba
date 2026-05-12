/**
 * ARBA-Ops v6.0 — DXF Export Service (AutoCAD Compatible)
 * خدمة تصدير ملفات DXF — متوافقة مع أوتوكاد
 *
 * يحول بيانات المخطط (BlueprintConfig) إلى ملف DXF قابل للفتح في AutoCAD
 * يولد: مخطط الموقع، مخططات الطوابق، مخطط الأساسات
 * 
 * DXF Reference: AutoCAD DXF R12 (most compatible format)
 */

import {
  BlueprintConfig, FloorDetails, RoomFinishSchedule, FacadeSchedule,
} from '../types';

// =================== DXF Builder ===================

class DxfBuilder {
  private entities: string[] = [];
  private layers: Map<string, { color: number }> = new Map();
  private handle = 100;

  constructor() {
    this.addLayer('0', 7);            // Default — white
    this.addLayer('PLOT', 3);         // Green — plot boundary
    this.addLayer('SETBACKS', 1);     // Red — setback lines
    this.addLayer('WALLS_EXT', 7);    // White — external walls
    this.addLayer('WALLS_INT', 8);    // Grey — internal walls
    this.addLayer('COLUMNS', 5);      // Blue — columns
    this.addLayer('DIMS', 2);         // Yellow — dimensions
    this.addLayer('TEXT', 7);         // White — text
    this.addLayer('FOUNDATION', 6);   // Magenta — foundations
    this.addLayer('ROOMS', 4);        // Cyan — room outlines
    this.addLayer('HATCHING', 8);     // Grey — hatching
    this.addLayer('TITLEBLOCK', 7);   // White — title block
  }

  private nextHandle(): string {
    return (this.handle++).toString(16).toUpperCase();
  }

  addLayer(name: string, color: number) {
    this.layers.set(name, { color });
  }

  // ——— Drawing Primitives ———

  addLine(x1: number, y1: number, x2: number, y2: number, layer = '0') {
    this.entities.push(
      '0', 'LINE',
      '5', this.nextHandle(),
      '8', layer,
      '10', x1.toFixed(4), '20', y1.toFixed(4), '30', '0.0',
      '11', x2.toFixed(4), '21', y2.toFixed(4), '31', '0.0',
    );
  }

  addRect(x: number, y: number, w: number, h: number, layer = '0') {
    this.addLine(x, y, x + w, y, layer);
    this.addLine(x + w, y, x + w, y + h, layer);
    this.addLine(x + w, y + h, x, y + h, layer);
    this.addLine(x, y + h, x, y, layer);
  }

  addCircle(cx: number, cy: number, radius: number, layer = '0') {
    this.entities.push(
      '0', 'CIRCLE',
      '5', this.nextHandle(),
      '8', layer,
      '10', cx.toFixed(4), '20', cy.toFixed(4), '30', '0.0',
      '40', radius.toFixed(4),
    );
  }

  addText(x: number, y: number, text: string, height = 0.3, layer = 'TEXT', rotation = 0) {
    this.entities.push(
      '0', 'TEXT',
      '5', this.nextHandle(),
      '8', layer,
      '10', x.toFixed(4), '20', y.toFixed(4), '30', '0.0',
      '40', height.toFixed(4),
      '1', text,
      '50', rotation.toFixed(1),
      '72', '0',
    );
  }

  addDimension(x1: number, y1: number, x2: number, y2: number, offset: number, text: string, layer = 'DIMS') {
    // Simplified dimension as text + lines
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const isHorizontal = Math.abs(y1 - y2) < 0.01;

    if (isHorizontal) {
      // Horizontal dimension
      this.addLine(x1, y1 + offset, x2, y2 + offset, layer);
      this.addLine(x1, y1, x1, y1 + offset + 0.3, layer);
      this.addLine(x2, y2, x2, y2 + offset + 0.3, layer);
      this.addText(mx, my + offset + 0.2, text, 0.25, layer);
    } else {
      // Vertical dimension
      this.addLine(x1 + offset, y1, x2 + offset, y2, layer);
      this.addLine(x1, y1, x1 + offset + 0.3, y1, layer);
      this.addLine(x2, y2, x2 + offset + 0.3, y2, layer);
      this.addText(mx + offset + 0.2, my, text, 0.25, layer, 90);
    }
  }

  addFilledRect(x: number, y: number, w: number, h: number, layer = 'COLUMNS') {
    // Solid fill using SOLID entity
    this.entities.push(
      '0', 'SOLID',
      '5', this.nextHandle(),
      '8', layer,
      '10', x.toFixed(4), '20', y.toFixed(4), '30', '0.0',
      '11', (x + w).toFixed(4), '21', y.toFixed(4), '31', '0.0',
      '12', x.toFixed(4), '22', (y + h).toFixed(4), '32', '0.0',
      '13', (x + w).toFixed(4), '23', (y + h).toFixed(4), '33', '0.0',
    );
  }

  // ——— DXF File Generation ———

  generate(): string {
    const parts: string[] = [];

    // HEADER section
    parts.push(
      '0', 'SECTION',
      '2', 'HEADER',
      '9', '$ACADVER', '1', 'AC1009',  // DXF R12 for max compatibility
      '9', '$INSUNITS', '70', '6',      // Units: meters
      '9', '$DIMSCALE', '40', '1.0',
      '0', 'ENDSEC',
    );

    // TABLES section (layers)
    parts.push('0', 'SECTION', '2', 'TABLES');
    parts.push('0', 'TABLE', '2', 'LAYER', '70', this.layers.size.toString());
    for (const [name, props] of this.layers) {
      parts.push(
        '0', 'LAYER',
        '2', name,
        '70', '0',
        '62', props.color.toString(),
        '6', 'CONTINUOUS',
      );
    }
    parts.push('0', 'ENDTAB');
    parts.push('0', 'ENDSEC');

    // ENTITIES section
    parts.push('0', 'SECTION', '2', 'ENTITIES');
    parts.push(...this.entities);
    parts.push('0', 'ENDSEC');

    // EOF
    parts.push('0', 'EOF');

    return parts.join('\n');
  }
}

// =================== Drawing Generators ===================

/**
 * يولد مخطط الموقع العام (Site Plan)
 */
function drawSitePlan(dxf: DxfBuilder, bp: BlueprintConfig, originX = 0, originY = 0) {
  const L = bp.plotLength;
  const W = bp.plotWidth;
  const sf = bp.setbackFront;
  const ss = bp.setbackSide;
  const sr = bp.setbackRear || 2;

  // Plot boundary
  dxf.addRect(originX, originY, W, L, 'PLOT');

  // Setback lines (dashed in concept)
  const bx = originX + ss;
  const by = originY + sr;
  const bw = W - (ss * 2);
  const bl = L - sf - sr;
  dxf.addRect(bx, by, bw, bl, 'SETBACKS');

  // Dimensions
  dxf.addDimension(originX, originY, originX + W, originY, -1.5, `${W}m`, 'DIMS');
  dxf.addDimension(originX, originY, originX, originY + L, -1.5, `${L}m`, 'DIMS');

  // Setback dims
  dxf.addText(originX + W / 2, originY + L + 0.5, `مساحة الأرض: ${W * L} م²`, 0.4, 'TEXT');
  dxf.addText(originX + W / 2, originY - 2, `SITE PLAN / مخطط الموقع`, 0.5, 'TITLEBLOCK');

  // Compass
  dxf.addText(originX + W + 1, originY + L - 1, 'N ↑', 0.5, 'TEXT');

  return { buildableX: bx, buildableY: by, buildableW: bw, buildableL: bl };
}

/**
 * يولد مخطط طابق (Floor Plan) مع الغرف والأعمدة
 */
function drawFloorPlan(
  dxf: DxfBuilder,
  bp: BlueprintConfig,
  floor: FloorDetails,
  rooms: RoomFinishSchedule[],
  originX: number,
  originY: number,
) {
  const ss = bp.setbackSide;
  const bw = bp.plotWidth - (ss * 2);
  const bl = Math.sqrt(floor.area); // Approximate square
  const aspectRatio = bw / (bp.plotLength - bp.setbackFront - (bp.setbackRear || 2));
  const floorW = Math.min(bw, Math.sqrt(floor.area * aspectRatio));
  const floorL = floor.area / floorW;

  // External walls (thick lines = double lines)
  const wallThick = 0.20;
  dxf.addRect(originX, originY, floorW, floorL, 'WALLS_EXT');
  dxf.addRect(originX + wallThick, originY + wallThick, floorW - wallThick * 2, floorL - wallThick * 2, 'WALLS_EXT');

  // Columns — distribute in grid
  const colCount = floor.columnsCount || 12;
  const colSize = 0.30;
  const colRows = Math.ceil(Math.sqrt(colCount * (floorL / floorW)));
  const colCols = Math.ceil(colCount / colRows);
  const colSpacingX = (floorW - colSize) / Math.max(colCols - 1, 1);
  const colSpacingY = (floorL - colSize) / Math.max(colRows - 1, 1);

  for (let r = 0; r < colRows; r++) {
    for (let c = 0; c < colCols; c++) {
      if (r * colCols + c >= colCount) break;
      const cx = originX + c * colSpacingX;
      const cy = originY + r * colSpacingY;
      dxf.addFilledRect(cx, cy, colSize, 0.50, 'COLUMNS');
    }
  }

  // Rooms — layout sequentially
  let roomX = originX + wallThick + 0.15;
  let roomY = originY + wallThick + 0.15;
  const roomMargin = 0.15; // wall between rooms
  const maxRoomWidth = floorW - wallThick * 2 - 0.30;

  const floorRooms = rooms.filter(r => r.floorId === floor.id);
  let rowHeight = 0;

  floorRooms.forEach(room => {
    const rw = Math.min(room.length, maxRoomWidth);
    const rh = room.width;

    // Check if room fits in current row
    if (roomX + rw > originX + floorW - wallThick) {
      roomX = originX + wallThick + 0.15;
      roomY += rowHeight + roomMargin;
      rowHeight = 0;
    }

    dxf.addRect(roomX, roomY, rw, rh, 'ROOMS');
    // Room label
    dxf.addText(roomX + rw / 2 - 0.5, roomY + rh / 2, room.roomName, 0.20, 'TEXT');
    dxf.addText(roomX + rw / 2 - 0.5, roomY + rh / 2 - 0.35, `${room.length}×${room.width}m`, 0.15, 'DIMS');

    // Internal wall line
    dxf.addLine(roomX + rw, roomY, roomX + rw, roomY + rh, 'WALLS_INT');

    roomX += rw + roomMargin;
    rowHeight = Math.max(rowHeight, rh);
  });

  // Floor title
  dxf.addText(originX, originY - 1, `${floor.name} — ${floor.area}م² — سقف ${floor.slabType}`, 0.35, 'TITLEBLOCK');

  // Dimensions
  dxf.addDimension(originX, originY, originX + floorW, originY, -1, `${floorW.toFixed(1)}m`, 'DIMS');
  dxf.addDimension(originX + floorW, originY, originX + floorW, originY + floorL, 1, `${floorL.toFixed(1)}m`, 'DIMS');

  return { width: floorW, height: floorL };
}

/**
 * يولد مخطط الأساسات (Foundation Plan)
 */
function drawFoundationPlan(dxf: DxfBuilder, bp: BlueprintConfig, originX: number, originY: number) {
  const fdn = bp.foundation;
  const floor = bp.floors[0];
  if (!fdn || !floor) return;

  const ss = bp.setbackSide;
  const bw = bp.plotWidth - (ss * 2);
  const aspectRatio = bw / (bp.plotLength - bp.setbackFront - (bp.setbackRear || 2));
  const floorW = Math.min(bw, Math.sqrt(floor.area * aspectRatio));
  const floorL = floor.area / floorW;

  // Lean concrete outline
  dxf.addRect(originX - 0.3, originY - 0.3, floorW + 0.6, floorL + 0.6, 'FOUNDATION');
  dxf.addText(originX - 0.3, originY - 0.8, 'خرسانة نظافة (10سم)', 0.20, 'FOUNDATION');

  // Footings
  const colCount = floor.columnsCount || 12;
  const colRows = Math.ceil(Math.sqrt(colCount * (floorL / floorW)));
  const colCols = Math.ceil(colCount / colRows);
  const colSpacingX = (floorW - 0.30) / Math.max(colCols - 1, 1);
  const colSpacingY = (floorL - 0.30) / Math.max(colRows - 1, 1);
  const fw = fdn.footingWidth || 1.2;

  for (let r = 0; r < colRows; r++) {
    for (let c = 0; c < colCols; c++) {
      if (r * colCols + c >= colCount) break;
      const cx = originX + c * colSpacingX;
      const cy = originY + r * colSpacingY;

      if (fdn.type === 'isolated_footings') {
        dxf.addRect(cx - fw / 2 + 0.15, cy - fw / 2 + 0.25, fw, fw, 'FOUNDATION');
        dxf.addFilledRect(cx, cy, 0.30, 0.50, 'COLUMNS');
      } else {
        dxf.addFilledRect(cx, cy, 0.30, 0.50, 'COLUMNS');
      }
    }
  }

  // Tie beams (connect columns)
  const tbw = fdn.tieBeamWidth || 0.30;
  // Horizontal tie beams
  for (let r = 0; r < colRows; r++) {
    const cy = originY + r * colSpacingY + 0.25 - tbw / 2;
    dxf.addRect(originX, cy, floorW, tbw, 'FOUNDATION');
  }
  // Vertical tie beams
  for (let c = 0; c < colCols; c++) {
    const cx = originX + c * colSpacingX + 0.15 - tbw / 2;
    dxf.addRect(cx, originY, tbw, floorL, 'FOUNDATION');
  }

  // Raft foundation
  if (fdn.type === 'raft') {
    dxf.addRect(originX - 0.5, originY - 0.5, floorW + 1, floorL + 1, 'FOUNDATION');
    dxf.addText(originX + floorW / 2, originY + floorL + 1, `لبشة — سمك ${fdn.raftThickness || 0.6}م`, 0.25, 'FOUNDATION');
  }

  dxf.addText(originX, originY - 1.5, `مخطط الأساسات — ${fdn.type}`, 0.35, 'TITLEBLOCK');
}

/**
 * يولد قطاع رأسي (Cross Section)
 */
function drawSection(dxf: DxfBuilder, bp: BlueprintConfig, originX: number, originY: number) {
  const fdn = bp.foundation;
  const exc = bp.excavation;
  if (!fdn) return;

  const sectionWidth = bp.plotWidth - (bp.setbackSide * 2);

  // Ground level line
  dxf.addLine(originX - 2, originY, originX + sectionWidth + 2, originY, 'PLOT');
  dxf.addText(originX - 3, originY, '± 0.00', 0.25, 'DIMS');

  // Excavation depth
  const excDepth = exc?.excavationDepth || 1.5;
  dxf.addLine(originX, originY, originX, originY - excDepth, 'SETBACKS');
  dxf.addLine(originX, originY - excDepth, originX + sectionWidth, originY - excDepth, 'SETBACKS');
  dxf.addLine(originX + sectionWidth, originY - excDepth, originX + sectionWidth, originY, 'SETBACKS');
  dxf.addText(originX - 3, originY - excDepth, `-${excDepth.toFixed(2)}`, 0.25, 'DIMS');

  // Foundation
  const fdnTop = originY - excDepth + 0.10; // lean concrete
  dxf.addRect(originX, fdnTop, sectionWidth, 0.10, 'FOUNDATION'); // lean concrete
  dxf.addText(originX + sectionWidth + 0.5, fdnTop + 0.05, 'خ.نظافة', 0.15, 'TEXT');

  // Footing
  const footDepth = fdn.footingDepth || 0.5;
  dxf.addRect(originX + 1, fdnTop - footDepth, fdn.footingWidth || 1.2, footDepth, 'FOUNDATION');
  dxf.addText(originX + sectionWidth + 0.5, fdnTop - footDepth / 2, 'قاعدة', 0.15, 'TEXT');

  // Neck column
  const neckH = fdn.neckColumnHeight || 0.5;
  dxf.addRect(originX + 1.45, fdnTop, 0.30, neckH, 'COLUMNS');

  // Tie beam
  const tbDepth = fdn.tieBeamDepth || 0.6;
  dxf.addRect(originX + 1.30, fdnTop + neckH - tbDepth, fdn.tieBeamWidth || 0.30, tbDepth, 'FOUNDATION');

  // Zero level
  const zeroLevel = exc?.zeroLevel || 0.30;
  const zeroY = originY + zeroLevel;
  dxf.addLine(originX - 1, zeroY, originX + sectionWidth + 1, zeroY, 'DIMS');
  dxf.addText(originX - 3, zeroY, `+${zeroLevel.toFixed(2)} (صفر معماري)`, 0.20, 'DIMS');

  // Floors
  let currentY = zeroY;
  bp.floors.forEach((floor, idx) => {
    // Floor slab
    const slabY = currentY + floor.height;
    dxf.addLine(originX, slabY, originX + sectionWidth, slabY, 'WALLS_EXT');
    dxf.addText(originX + sectionWidth + 0.5, currentY + floor.height / 2, `${floor.name} (${floor.height}م)`, 0.20, 'TEXT');

    // Column
    dxf.addRect(originX + 1.45, currentY, 0.30, floor.height, 'COLUMNS');

    currentY = slabY;
  });

  // Roof parapet
  dxf.addRect(originX, currentY, 0.20, 1.0, 'WALLS_EXT');
  dxf.addRect(originX + sectionWidth - 0.20, currentY, 0.20, 1.0, 'WALLS_EXT');

  dxf.addText(originX + sectionWidth / 2, originY - excDepth - 1.5, `CROSS SECTION / قطاع رأسي`, 0.35, 'TITLEBLOCK');
}

/**
 * يولد إطار الطباعة الاحترافي (Title Block)
 * يعرض: اسم المالك، اسم المشروع، رقم المخطط، المقياس، الشركة
 */
interface DxfTitleBlockMeta {
  ownerName?: string;
  planNumber?: string;
  companyName?: string;
  permitNumber?: string;
  scale?: string;
}

function drawTitleBlock(
  dxf: DxfBuilder,
  originX: number,
  originY: number,
  projectName: string,
  date: string,
  meta?: DxfTitleBlockMeta,
) {
  const tbW = 60;
  const tbH = 15; // taller for professional data

  // Outer border
  dxf.addRect(originX, originY, tbW, tbH, 'TITLEBLOCK');

  // Column dividers
  dxf.addLine(originX + 20, originY, originX + 20, originY + tbH, 'TITLEBLOCK');
  dxf.addLine(originX + 40, originY, originX + 40, originY + tbH, 'TITLEBLOCK');

  // Row dividers
  dxf.addLine(originX, originY + 5, originX + tbW, originY + 5, 'TITLEBLOCK');
  dxf.addLine(originX, originY + 10, originX + tbW, originY + 10, 'TITLEBLOCK');

  // ─── Row 1: Company + Project + Sheet ───
  const company = meta?.companyName || 'ARBA Engineering — أربا';
  dxf.addText(originX + 10, originY + 12.5, company, 0.40, 'TITLEBLOCK');
  dxf.addText(originX + 30, originY + 12.5, projectName, 0.35, 'TITLEBLOCK');
  dxf.addText(originX + 45, originY + 12.5, `Date: ${date}`, 0.25, 'TITLEBLOCK');

  // ─── Row 2: Owner + Plan + Permit ───
  if (meta?.ownerName) {
    dxf.addText(originX + 1, originY + 7.5, `المالك: ${meta.ownerName}`, 0.30, 'TITLEBLOCK');
  }
  dxf.addText(originX + 21, originY + 7.5, `مخطط: ${meta?.planNumber || '---'}`, 0.25, 'TITLEBLOCK');
  dxf.addText(originX + 41, originY + 7.5, `رخصة: ${meta?.permitNumber || '---'}`, 0.25, 'TITLEBLOCK');

  // ─── Row 3: Scale + Units + Platform ───
  dxf.addText(originX + 1, originY + 2.5, `المقياس: ${meta?.scale || 'NTS'}`, 0.25, 'TITLEBLOCK');
  dxf.addText(originX + 21, originY + 2.5, 'الوحدات: متر', 0.25, 'TITLEBLOCK');
  dxf.addText(originX + 41, originY + 2.5, 'ARBA Platform v8.0', 0.20, 'TITLEBLOCK');
}

// =================== Main Export Function ===================

/**
 * يولد ملف DXF كامل من بيانات المخطط
 */
export function generateFullDxf(
  bp: BlueprintConfig,
  projectName = 'ARBA Project',
  meta?: DxfTitleBlockMeta,
): string {
  const dxf = new DxfBuilder();
  const date = new Date().toISOString().split('T')[0];

  // 1. Site Plan (top-left)
  drawSitePlan(dxf, bp, 0, 0);

  // 2. Floor Plans (stacked below site plan)
  let offsetY = -(bp.plotLength + 5);
  const rooms = bp.roomFinishes || [];

  bp.floors.forEach((floor, idx) => {
    const result = drawFloorPlan(dxf, bp, floor, rooms, 0, offsetY);
    offsetY -= (result.height + 5);
  });

  // 3. Foundation Plan (to the right of site plan)
  const fdnOffsetX = bp.plotWidth + 10;
  drawFoundationPlan(dxf, bp, fdnOffsetX, 0);

  // 4. Cross Section (below foundation plan)
  drawSection(dxf, bp, fdnOffsetX, -(bp.plotLength + 5));

  // 5. Title Block (bottom)
  drawTitleBlock(dxf, 0, offsetY - 5, projectName, date, meta);

  return dxf.generate();
}

/**
 * تحميل ملف DXF مباشرة من المتصفح
 */
export function downloadDxf(
  bp: BlueprintConfig,
  projectName = 'ARBA Project',
  meta?: DxfTitleBlockMeta,
) {
  const content = generateFullDxf(bp, projectName, meta);
  const blob = new Blob([content], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, '_')}_ARBA.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

