'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRealtimeTables, useRealtimeReservations, useRealtimeWalkins } from '@/lib/supabase/realtime';
import TableMap from '@/components/admin/TableMap';
import TableEditor from '@/components/admin/TableEditor';
import { Plus, Edit, Grid, Save, List, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Table {
    id: number;
    venue_id: number;
    label: string;
    capacity: number;
    active: boolean;
    x: number;
    y: number;
    w: number;
    h: number;
    shape: 'square' | 'circle' | 'rectangle';
    rotation: number;
}

export default function AdminMesasPage() {
    const { tables, loading, setTables } = useRealtimeTables(1);
    const { reservations } = useRealtimeReservations(1, { date: format(new Date(), 'yyyy-MM-dd') });
    const { walkins } = useRealtimeWalkins(1);

    const [editMode, setEditMode] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | undefined>();
    const [pendingChanges, setPendingChanges] = useState<Map<number, Partial<Table>>>(new Map());
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    const handleTableUpdate = (tableId: number, updates: Partial<Table>) => {
        // Update local state optimistically
        setTables((prev) =>
            prev.map((t) => (t.id === tableId ? { ...t, ...updates } : t))
        );

        // Track pending changes
        setPendingChanges((prev) => {
            const newChanges = new Map(prev);
            const existing = newChanges.get(tableId) || {};
            newChanges.set(tableId, { ...existing, ...updates });
            return newChanges;
        });
    };

    const handleSaveLayout = async () => {
        if (pendingChanges.size === 0) return;

        setSaving(true);
        try {
            // Save all pending changes
            const updates = Array.from(pendingChanges.entries()).map(([id, changes]) =>
                supabase.from('tables').update(changes).eq('id', id)
            );

            await Promise.all(updates);
            setPendingChanges(new Map());
            alert('Layout guardado exitosamente');
        } catch (error) {
            console.error('Error saving layout:', error);
            alert('Error al guardar el layout');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateTable = async (tableData: Omit<Table, 'id' | 'venue_id' | 'active'>) => {
        const { error } = await supabase.from('tables').insert({
            venue_id: 1,
            active: true,
            ...tableData,
        });

        if (error) {
            throw error;
        }

        setShowEditor(false);
        setSelectedTable(undefined);
    };

    const handleUpdateTable = async (tableData: Omit<Table, 'id' | 'venue_id' | 'active'>) => {
        if (!selectedTable) return;

        const { error } = await supabase.from('tables').update(tableData).eq('id', selectedTable.id);

        if (error) {
            throw error;
        }

        setShowEditor(false);
        setSelectedTable(undefined);
    };

    const handleDeleteTable = async (tableId: number) => {
        const { error } = await supabase.from('tables').update({ active: false }).eq('id', tableId);

        if (error) {
            throw error;
        }

        setShowEditor(false);
        setSelectedTable(undefined);
    };

    const handleTableClick = (table: Table) => {
        if (!editMode) {
            // Show table details/reservations in future
            console.log('Table clicked:', table);
        }
    };

    const handleEditTable = (table: Table) => {
        setSelectedTable(table);
        setShowEditor(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-700"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-ocean-900">Gestión de Mesas</h1>
                    <p className="text-gray-600 mt-2">
                        Mapa interactivo con estado en tiempo real • {tables.length} mesas activas
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedTable(undefined);
                        setShowEditor(true);
                    }}
                    className="flex items-center px-4 py-2 bg-gradient-ocean text-white rounded-lg font-semibold hover:shadow-ocean transition-all"
                >
                    <Plus size={20} className="mr-2" />
                    Nueva Mesa
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${viewMode === 'map'
                                        ? 'bg-white text-ocean-700 shadow'
                                        : 'text-gray-600 hover:text-ocean-700'
                                    }`}
                            >
                                <MapPin size={18} className="mr-2" />
                                Mapa
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${viewMode === 'list'
                                        ? 'bg-white text-ocean-700 shadow'
                                        : 'text-gray-600 hover:text-ocean-700'
                                    }`}
                            >
                                <List size={18} className="mr-2" />
                                Lista
                            </button>
                        </div>

                        {viewMode === 'map' && (
                            <>
                                {/* Edit Mode Toggle */}
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${editMode
                                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Edit size={18} className="mr-2" />
                                    {editMode ? 'Modo Edición ON' : 'Modo Edición OFF'}
                                </button>

                                {/* Grid Toggle */}
                                <button
                                    onClick={() => setShowGrid(!showGrid)}
                                    className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${showGrid
                                            ? 'bg-gray-200 text-gray-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <Grid size={18} className="mr-2" />
                                    Grid
                                </button>
                            </>
                        )}
                    </div>

                    {/* Save Button */}
                    {editMode && pendingChanges.size > 0 && (
                        <button
                            onClick={handleSaveLayout}
                            disabled={saving}
                            className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {saving ? 'Guardando...' : `Guardar Layout (${pendingChanges.size} cambios)`}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {viewMode === 'map' ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
                    <TableMap
                        tables={tables}
                        reservations={reservations}
                        walkins={walkins}
                        onTableUpdate={handleTableUpdate}
                        onTableClick={handleTableClick}
                        editMode={editMode}
                        showGrid={showGrid}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-ocean-50 border-b border-ocean-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Mesa</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Capacidad</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Forma</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Posición</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Estado</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tables.map((table) => (
                                <tr key={table.id} className="hover:bg-ocean-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-ocean-900">{table.label}</td>
                                    <td className="px-6 py-4 text-gray-600">{table.capacity} personas</td>
                                    <td className="px-6 py-4 text-gray-600 capitalize">
                                        {table.shape === 'square'
                                            ? 'Cuadrada'
                                            : table.shape === 'rectangle'
                                                ? 'Rectangular'
                                                : 'Redonda'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">
                                        X: {table.x}, Y: {table.y}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                            Activa
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEditTable(table)}
                                            className="px-3 py-1 bg-ocean-600 hover:bg-ocean-700 text-white text-xs rounded font-semibold transition-colors"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Table Editor Modal */}
            {showEditor && (
                <TableEditor
                    table={selectedTable}
                    onSave={selectedTable ? handleUpdateTable : handleCreateTable}
                    onDelete={selectedTable ? handleDeleteTable : undefined}
                    onCancel={() => {
                        setShowEditor(false);
                        setSelectedTable(undefined);
                    }}
                />
            )}
        </div>
    );
}
