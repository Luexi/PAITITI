'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getTableStatus, type Table, type Reservation, type Walkin } from '@/lib/supabase/realtime';

interface TableMapProps {
    tables: Table[];
    reservations?: Reservation[];
    walkins?: Walkin[];
    onTableUpdate: (tableId: number, updates: Partial<Table>) => void;
    onTableClick?: (table: Table) => void;
    editMode?: boolean;
    showGrid?: boolean;
    gridSize?: number;
}

export default function TableMap({
    tables,
    reservations = [],
    walkins = [],
    onTableUpdate,
    onTableClick,
    editMode = false,
    showGrid = true,
    gridSize = 20,
}: TableMapProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState<{ tableId: number; startX: number; startY: number } | null>(null);
    const [resizing, setResizing] = useState<{ tableId: number; handle: string; startX: number; startY: number } | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const snapToGrid = (value: number) => {
        return Math.round(value / gridSize) * gridSize;
    };

    const getStatusColor = (table: Table): string => {
        const status = getTableStatus(table, reservations, walkins);

        switch (status) {
            case 'available':
                return 'bg-green-500 border-green-600';
            case 'reserved':
                return 'bg-yellow-500 border-yellow-600';
            case 'occupied':
                return 'bg-red-500 border-red-600';
            case 'cleaning':
                return 'bg-gray-400 border-gray-500';
            default:
                return 'bg-gray-300 border-gray-400';
        }
    };

    const getStatusText = (table: Table): string => {
        const status = getTableStatus(table, reservations, walkins);
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const handleMouseDown = (e: React.MouseEvent, table: Table, handle?: string) => {
        if (!editMode) {
            if (onTableClick) {
                onTableClick(table);
            }
            return;
        }

        e.stopPropagation();

        if (handle) {
            setResizing({
                tableId: table.id,
                handle,
                startX: e.clientX,
                startY: e.clientY,
            });
        } else {
            setDragging({
                tableId: table.id,
                startX: e.clientX - table.x * scale,
                startY: e.clientY - table.y * scale,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragging) {
            const newX = (e.clientX - dragging.startX) / scale;
            const newY = (e.clientY - dragging.startY) / scale;

            onTableUpdate(dragging.tableId, {
                x: showGrid ? snapToGrid(newX) : newX,
                y: showGrid ? snapToGrid(newY) : newY,
            });
        } else if (resizing) {
            const table = tables.find((t) => t.id === resizing.tableId);
            if (!table) return;

            const deltaX = (e.clientX - resizing.startX) / scale;
            const deltaY = (e.clientY - resizing.startY) / scale;

            let newW = table.w;
            let newH = table.h;

            if (resizing.handle.includes('e')) {
                newW = Math.max(50, table.w + deltaX);
            }
            if (resizing.handle.includes('s')) {
                newH = Math.max(50, table.h + deltaY);
            }
            if (resizing.handle.includes('w')) {
                newW = Math.max(50, table.w - deltaX);
            }
            if (resizing.handle.includes('n')) {
                newH = Math.max(50, table.h - deltaY);
            }

            onTableUpdate(resizing.tableId, {
                w: showGrid ? snapToGrid(newW) : newW,
                h: showGrid ? snapToGrid(newH) : newH,
            });

            setResizing({ ...resizing, startX: e.clientX, startY: e.clientY });
        } else if (isPanning) {
            setOffset({
                x: offset.x + (e.clientX - panStart.x),
                y: offset.y + (e.clientY - panStart.y),
            });
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setDragging(null);
        setResizing(null);
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale((prev) => Math.max(0.5, Math.min(2, prev * delta)));
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };

    const renderTable = (table: Table) => {
        const statusColor = getStatusColor(table);
        const statusText = getStatusText(table);

        const style: React.CSSProperties = {
            position: 'absolute',
            left: `${table.x}px`,
            top: `${table.y}px`,
            width: `${table.w}px`,
            height: `${table.h}px`,
            transform: `rotate(${table.rotation}deg)`,
            cursor: editMode ? 'move' : 'pointer',
        };

        return (
            <div
                key={table.id}
                style={style}
                onMouseDown={(e) => handleMouseDown(e, table)}
                className={`${statusColor} border-2 flex flex-col items-center justify-center text-white font-semibold shadow-lg transition-all hover:shadow-xl ${table.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                    }`}
            >
                <div className="text-lg">{table.label}</div>
                <div className="text-xs opacity-80">{table.capacity}p</div>
                <div className="text-xs opacity-70 mt-1">{statusText}</div>

                {editMode && (
                    <>
                        {/* Resize Handles */}
                        <div
                            onMouseDown={(e) => handleMouseDown(e, table, 'se')}
                            className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-ocean-600 cursor-se-resize"
                            style={{ transform: 'translate(50%, 50%)' }}
                        />
                        <div
                            onMouseDown={(e) => handleMouseDown(e, table, 'sw')}
                            className="absolute bottom-0 left-0 w-4 h-4 bg-white border border-ocean-600 cursor-sw-resize"
                            style={{ transform: 'translate(-50%, 50%)' }}
                        />
                        <div
                            onMouseDown={(e) => handleMouseDown(e, table, 'ne')}
                            className="absolute top-0 right-0 w-4 h-4 bg-white border border-ocean-600 cursor-ne-resize"
                            style={{ transform: 'translate(50%, -50%)' }}
                        />
                        <div
                            onMouseDown={(e) => handleMouseDown(e, table, 'nw')}
                            className="absolute top-0 left-0 w-4 h-4 bg-white border border-ocean-600 cursor-nw-resize"
                            style={{ transform: 'translate(-50%, -50%)' }}
                        />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-100 rounded-lg border border-gray-300">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-col space-y-2">
                <button
                    onClick={() => setScale((prev) => Math.min(2, prev * 1.2))}
                    className="px-3 py-1 bg-ocean-600 hover:bg-ocean-700 text-white rounded font-semibold text-sm"
                >
                    +
                </button>
                <div className="text-center text-xs font-semibold text-gray-700">{Math.round(scale * 100)}%</div>
                <button
                    onClick={() => setScale((prev) => Math.max(0.5, prev / 1.2))}
                    className="px-3 py-1 bg-ocean-600 hover:bg-ocean-700 text-white rounded font-semibold text-sm"
                >
                    -
                </button>
                <button
                    onClick={() => {
                        setScale(1);
                        setOffset({ x: 0, y: 0 });
                    }}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold text-xs"
                >
                    Reset
                </button>
            </div>

            {/* Canvas */}
            <div
                ref={canvasRef}
                className="w-full h-full relative"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onMouseDown={handleCanvasMouseDown}
                style={{
                    cursor: isPanning ? 'grabbing' : editMode ? 'default' : 'grab',
                }}
            >
                <div
                    style={{
                        transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                        transformOrigin: '0 0',
                        width: '2000px',
                        height: '2000px',
                        position: 'relative',
                        backgroundImage: showGrid
                            ? `repeating-linear-gradient(0deg, transparent, transparent ${gridSize - 1}px, #ddd ${gridSize - 1}px, #ddd ${gridSize}px),
                               repeating-linear-gradient(90deg, transparent, transparent ${gridSize - 1}px, #ddd ${gridSize - 1}px, #ddd ${gridSize}px)`
                            : 'none',
                    }}
                >
                    {tables.filter((t) => t.active).map(renderTable)}
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
                <div className="font-semibold text-gray-700 mb-2">Estado de Mesas</div>
                <div className="flex items-center space-x-2 mb-1">
                    <div className="w-4 h-4 bg-green-500 border border-green-600 rounded"></div>
                    <span>Disponible</span>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                    <div className="w-4 h-4 bg-yellow-500 border border-yellow-600 rounded"></div>
                    <span>Reservada</span>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                    <div className="w-4 h-4 bg-red-500 border border-red-600 rounded"></div>
                    <span>Ocupada</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded"></div>
                    <span>Limpieza</span>
                </div>
            </div>

            {/* Help Text */}
            {editMode && (
                <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 rounded-lg shadow-lg p-3 text-xs max-w-xs">
                    <div className="font-semibold mb-1">Modo Edición Activo</div>
                    <div>• Arrastra mesas para moverlas</div>
                    <div>• Usa los puntos blancos para redimensionar</div>
                    <div>• Shift + Click para hacer pan</div>
                    <div>• Scroll para hacer zoom</div>
                </div>
            )}
        </div>
    );
}
