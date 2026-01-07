'use client';

import { useState } from 'react';
import { Trash2, Save, X } from 'lucide-react';

interface Table {
    id?: number;
    label: string;
    capacity: number;
    shape: 'square' | 'circle' | 'rectangle';
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
}

interface TableEditorProps {
    table?: Table;
    onSave: (table: Omit<Table, 'id'>) => Promise<void>;
    onDelete?: (tableId: number) => Promise<void>;
    onCancel: () => void;
}

export default function TableEditor({ table, onSave, onDelete, onCancel }: TableEditorProps) {
    const [formData, setFormData] = useState<Omit<Table, 'id'>>({
        label: table?.label || '',
        capacity: table?.capacity || 4,
        shape: table?.shape || 'square',
        x: table?.x || 100,
        y: table?.y || 100,
        w: table?.w || 100,
        h: table?.h || 100,
        rotation: table?.rotation || 0,
    });

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await onSave(formData);
        } catch (error) {
            console.error('Error saving table:', error);
            alert('Error al guardar la mesa');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!table?.id || !onDelete) return;

        if (!confirm(`¿Estás seguro de eliminar la mesa "${table.label}"?`)) {
            return;
        }

        setDeleting(true);
        try {
            await onDelete(table.id);
        } catch (error) {
            console.error('Error deleting table:', error);
            alert('Error al eliminar la mesa');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-display font-bold text-ocean-900">
                        {table ? 'Editar Mesa' : 'Nueva Mesa'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Etiqueta de Mesa *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                placeholder="Ej: Mesa 1, VIP-A, Terraza 5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Capacidad (personas) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="20"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Shape */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Forma de Mesa *</label>
                        <div className="grid grid-cols-3 gap-4">
                            {(['square', 'rectangle', 'circle'] as const).map((shape) => (
                                <button
                                    key={shape}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, shape })}
                                    className={`p-4 border-2 rounded-lg transition-all ${formData.shape === shape
                                            ? 'border-ocean-600 bg-ocean-50'
                                            : 'border-gray-300 hover:border-ocean-400'
                                        }`}
                                >
                                    <div className="flex flex-col items-center space-y-2">
                                        <div
                                            className={`w-16 h-16 border-2 border-gray-400 ${shape === 'circle'
                                                    ? 'rounded-full'
                                                    : shape === 'square'
                                                        ? 'rounded-lg aspect-square'
                                                        : 'rounded-lg'
                                                }`}
                                            style={
                                                shape === 'rectangle'
                                                    ? { width: '80px', height: '50px' }
                                                    : undefined
                                            }
                                        />
                                        <span className="text-sm font-semibold text-gray-700 capitalize">
                                            {shape === 'square'
                                                ? 'Cuadrada'
                                                : shape === 'rectangle'
                                                    ? 'Rectangular'
                                                    : 'Redonda'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ancho (px)</label>
                            <input
                                type="number"
                                min="50"
                                max="300"
                                step="10"
                                value={formData.w}
                                onChange={(e) => setFormData({ ...formData, w: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Alto (px)</label>
                            <input
                                type="number"
                                min="50"
                                max="300"
                                step="10"
                                value={formData.h}
                                onChange={(e) => setFormData({ ...formData, h: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Position */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Posición X</label>
                            <input
                                type="number"
                                min="0"
                                max="2000"
                                step="20"
                                value={formData.x}
                                onChange={(e) => setFormData({ ...formData, x: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Posición Y</label>
                            <input
                                type="number"
                                min="0"
                                max="2000"
                                step="20"
                                value={formData.y}
                                onChange={(e) => setFormData({ ...formData, y: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Rotation */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rotación: {formData.rotation}°
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            step="15"
                            value={formData.rotation}
                            onChange={(e) => setFormData({ ...formData, rotation: parseInt(e.target.value) })}
                            className="w-full"
                        />
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-100 rounded-lg p-6">
                        <div className="text-sm font-semibold text-gray-700 mb-3">Vista Previa</div>
                        <div className="flex items-center justify-center h-40 bg-white rounded-lg border border-gray-300">
                            <div
                                className={`bg-ocean-500 border-2 border-ocean-600 flex items-center justify-center text-white font-semibold shadow-lg ${formData.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                                    }`}
                                style={{
                                    width: `${formData.w / 2}px`,
                                    height: `${formData.h / 2}px`,
                                    transform: `rotate(${formData.rotation}deg)`,
                                }}
                            >
                                <div className="text-center">
                                    <div className="text-sm">{formData.label || 'Mesa'}</div>
                                    <div className="text-xs opacity-80">{formData.capacity}p</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                            {table?.id && onDelete && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={18} className="mr-2" />
                                    {deleting ? 'Eliminando...' : 'Eliminar Mesa'}
                                </button>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center px-6 py-2 bg-gradient-ocean text-white rounded-lg font-semibold hover:shadow-ocean transition-all disabled:opacity-50"
                            >
                                <Save size={18} className="mr-2" />
                                {saving ? 'Guardando...' : table ? 'Guardar Cambios' : 'Crear Mesa'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
