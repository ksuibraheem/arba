import React, { useState } from 'react';
import { Palette, Maximize, CheckCircle2, ChevronRight, Paintbrush } from 'lucide-react';
import { RoomConfig, RoomFinishes, SurfaceLocation, Language } from '../types';
import { TRANSLATIONS, INTERIOR_MATERIALS } from '../constants';

interface InteriorEditorProps {
    rooms: RoomConfig[];
    finishes: RoomFinishes[];
    language: Language;
    onUpdateFinish: (roomId: string, surface: SurfaceLocation, materialId: string) => void;
}

const InteriorEditor: React.FC<InteriorEditorProps> = ({ rooms, finishes, language, onUpdateFinish }) => {
    const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
    const [selectedSurface, setSelectedSurface] = useState<SurfaceLocation | null>(null);

    const t = (key: string) => TRANSLATIONS[key]?.[language] || key;
    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    
    // Get current finishes for the selected room
    const currentRoomFinishes = finishes.find(f => f.roomId === selectedRoomId)?.surfaces || {
        floor: null, ceiling: null, wall_north: null, wall_south: null, wall_east: null, wall_west: null
    };

    const getMaterialStyle = (materialId: string | null) => {
        if (!materialId) return { background: '#f1f5f9' }; // Default Slate-100
        const mat = INTERIOR_MATERIALS.find(m => m.id === materialId);
        if (!mat) return { background: '#f1f5f9' };
        
        return { 
            backgroundColor: mat.color,
            backgroundImage: mat.textureUrl || 'none',
            backgroundSize: 'cover'
        };
    };

    const getMaterialName = (materialId: string | null) => {
        if (!materialId) return t('select_material');
        const mat = INTERIOR_MATERIALS.find(m => m.id === materialId);
        return mat?.name[language] || materialId;
    };

    // Calculate dimensions for visualization (Simplified square approximation based on area)
    const boxSize = 200; // px base size for floor

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Palette className="w-6 h-6 text-rose-600" />
                        {t('materials')}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">{t('interior_desc')}</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Left: Rooms List */}
                <div className="w-64 bg-white border-l border-slate-200 overflow-y-auto">
                    <div className="p-4 border-b border-slate-100 font-bold text-slate-700">{t('room')}</div>
                    {rooms.map(room => (
                        <button
                            key={room.id}
                            onClick={() => { setSelectedRoomId(room.id); setSelectedSurface(null); }}
                            className={`w-full text-right p-3 text-sm border-b border-slate-100 hover:bg-slate-50 transition-colors flex justify-between items-center ${selectedRoomId === room.id ? 'bg-rose-50 text-rose-700 font-bold border-r-4 border-rose-600' : 'text-slate-600'}`}
                        >
                            <span>{room.name}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    ))}
                </div>

                {/* Center: Visualization (Unfolded Box) */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start bg-slate-100/50">
                    
                    {selectedRoom ? (
                        <div className="relative mt-10 transition-all duration-500 ease-in-out">
                            {/* FLOOR (Center) */}
                            <div 
                                className={`relative shadow-xl flex items-center justify-center cursor-pointer border-2 transition-all ${selectedSurface === 'floor' ? 'border-rose-500 ring-4 ring-rose-200 z-10' : 'border-slate-300 hover:border-rose-300'}`}
                                style={{ width: boxSize, height: boxSize, ...getMaterialStyle(currentRoomFinishes.floor) }}
                                onClick={() => setSelectedSurface('floor')}
                            >
                                <span className="bg-white/80 px-2 py-1 rounded text-xs font-bold text-slate-700 backdrop-blur-sm pointer-events-none">{t('floor')}</span>
                            </div>

                            {/* WALL NORTH (Top) */}
                            <div 
                                className={`absolute -top-[150px] left-0 right-0 h-[150px] shadow-sm cursor-pointer border-2 transition-all origin-bottom transform ${selectedSurface === 'wall_north' ? 'border-rose-500 ring-4 ring-rose-200 z-10 scale-105' : 'border-slate-300 hover:border-rose-300'}`}
                                style={{ ...getMaterialStyle(currentRoomFinishes.wall_north) }}
                                onClick={() => setSelectedSurface('wall_north')}
                            >
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 px-2 py-1 rounded text-xs text-slate-700 backdrop-blur-sm pointer-events-none">{t('wall_n')}</span>
                            </div>

                             {/* WALL SOUTH (Bottom) */}
                             <div 
                                className={`absolute -bottom-[150px] left-0 right-0 h-[150px] shadow-sm cursor-pointer border-2 transition-all origin-top transform ${selectedSurface === 'wall_south' ? 'border-rose-500 ring-4 ring-rose-200 z-10 scale-105' : 'border-slate-300 hover:border-rose-300'}`}
                                style={{ ...getMaterialStyle(currentRoomFinishes.wall_south) }}
                                onClick={() => setSelectedSurface('wall_south')}
                            >
                                <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/80 px-2 py-1 rounded text-xs text-slate-700 backdrop-blur-sm pointer-events-none">{t('wall_s')}</span>
                            </div>

                            {/* WALL WEST (Left) */}
                            <div 
                                className={`absolute top-0 -left-[150px] w-[150px] bottom-0 shadow-sm cursor-pointer border-2 transition-all origin-right transform ${selectedSurface === 'wall_west' ? 'border-rose-500 ring-4 ring-rose-200 z-10 scale-105' : 'border-slate-300 hover:border-rose-300'}`}
                                style={{ ...getMaterialStyle(currentRoomFinishes.wall_west) }}
                                onClick={() => setSelectedSurface('wall_west')}
                            >
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 px-2 py-1 rounded text-xs text-slate-700 backdrop-blur-sm pointer-events-none rotate-90">{t('wall_w')}</span>
                            </div>

                             {/* WALL EAST (Right) */}
                             <div 
                                className={`absolute top-0 -right-[150px] w-[150px] bottom-0 shadow-sm cursor-pointer border-2 transition-all origin-left transform ${selectedSurface === 'wall_east' ? 'border-rose-500 ring-4 ring-rose-200 z-10 scale-105' : 'border-slate-300 hover:border-rose-300'}`}
                                style={{ ...getMaterialStyle(currentRoomFinishes.wall_east) }}
                                onClick={() => setSelectedSurface('wall_east')}
                            >
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 px-2 py-1 rounded text-xs text-slate-700 backdrop-blur-sm pointer-events-none -rotate-90">{t('wall_e')}</span>
                            </div>

                             {/* CEILING (Floating Label only, conceptually 'above') */}
                             <div 
                                className={`absolute -top-[220px] left-0 right-0 h-[60px] flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer ${selectedSurface === 'ceiling' ? 'border-rose-500 bg-rose-50' : 'border-slate-300 bg-white/50 hover:border-rose-300'}`}
                                onClick={() => setSelectedSurface('ceiling')}
                            >
                                <div className="flex items-center gap-2">
                                     <Maximize className="w-4 h-4 text-slate-400" />
                                     <span className="text-xs font-bold text-slate-600">{t('ceiling')}: {getMaterialName(currentRoomFinishes.ceiling)}</span>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="text-slate-400">{t('select_room_first')}</div>
                    )}
                </div>

                {/* Right: Material Selector */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg z-20">
                     <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Paintbrush className="w-4 h-4" />
                            {selectedSurface ? t(selectedSurface) : t('select_material')}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            {selectedSurface ? t('select_surface_inst') : t('click_wall_inst')}
                        </p>
                     </div>

                     <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedSurface ? (
                            INTERIOR_MATERIALS.map(mat => (
                                <button
                                    key={mat.id}
                                    onClick={() => selectedRoomId && selectedSurface && onUpdateFinish(selectedRoomId, selectedSurface, mat.id)}
                                    className={`w-full text-right p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${currentRoomFinishes[selectedSurface!] === mat.id ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-rose-200'}`}
                                >
                                    <div className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: mat.color, backgroundImage: mat.textureUrl }}></div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-slate-700">{mat.name[language]}</div>
                                        <div className="text-xs text-slate-500">{mat.pricePerSqm} {t('currency')}/m²</div>
                                    </div>
                                    {currentRoomFinishes[selectedSurface!] === mat.id && <CheckCircle2 className="w-5 h-5 text-rose-500" />}
                                </button>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                                <Palette className="w-12 h-12 mb-2" />
                                <p>{t('select_surface_first')}</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default InteriorEditor;
