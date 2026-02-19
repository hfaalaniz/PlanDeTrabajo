import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Tarea } from '@/types';
import { Plus, CheckCircle2, Clock, AlertCircle, User, Calendar, AlignLeft, Flag, Save } from 'lucide-react';

interface TareaFormProps {
  onAdd: (tarea: Omit<Tarea, 'id'>) => void;
  planFechaInicio?: string;
  planFechaFin?: string;
  initialData?: Omit<Tarea, 'id'>;
}

const initialTareaState: Omit<Tarea, 'id'> = {
  titulo: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  responsable: '',
  estado: 'pendiente',
  prioridad: 'media',
};

export const TareaForm = ({ onAdd, planFechaInicio, planFechaFin, initialData }: TareaFormProps) => {
  const [tarea, setTarea] = useState<Omit<Tarea, 'id'>>(initialData ?? initialTareaState);

  useEffect(() => {
    setTarea(initialData ?? initialTareaState);
  }, [initialData]);

  const isEditing = !!initialData;

  const handleChange = (field: keyof Omit<Tarea, 'id'>, value: string) => {
    setTarea((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarea.titulo.trim()) return;
    onAdd(tarea);
    if (!isEditing) {
      setTarea(initialTareaState);
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'text-red-600 bg-red-50 border-red-200';
      case 'media': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'baja': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          {isEditing ? (
            <>
              <Save className="w-5 h-5 text-indigo-600" />
              Editar Tarea
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 text-indigo-600" />
              Agregar Tarea
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tarea-titulo" className="text-slate-700 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              Título de la Tarea
            </Label>
            <Input
              id="tarea-titulo"
              value={tarea.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ej: Diseño de mockups"
              className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tarea-descripcion" className="text-slate-700 font-medium flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-500" />
              Descripción
            </Label>
            <Textarea
              id="tarea-descripcion"
              value={tarea.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Describe los detalles de la tarea..."
              rows={2}
              className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                Fechas
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={tarea.fechaInicio}
                  min={planFechaInicio}
                  max={planFechaFin}
                  onChange={(e) => handleChange('fechaInicio', e.target.value)}
                  className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-slate-500">-</span>
                <Input
                  type="date"
                  value={tarea.fechaFin}
                  min={tarea.fechaInicio || planFechaInicio}
                  max={planFechaFin}
                  onChange={(e) => handleChange('fechaFin', e.target.value)}
                  className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarea-responsable" className="text-slate-700 font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Responsable
              </Label>
              <Input
                id="tarea-responsable"
                value={tarea.responsable}
                onChange={(e) => handleChange('responsable', e.target.value)}
                placeholder="Nombre del responsable"
                className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Estado
              </Label>
              <Select
                value={tarea.estado}
                onValueChange={(value) => handleChange('estado', value as Tarea['estado'])}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Pendiente
                    </span>
                  </SelectItem>
                  <SelectItem value="en-progreso">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      En Progreso
                    </span>
                  </SelectItem>
                  <SelectItem value="completada">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Completada
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Flag className="w-4 h-4 text-slate-500" />
                Prioridad
              </Label>
              <Select
                value={tarea.prioridad}
                onValueChange={(value) => handleChange('prioridad', value as Tarea['prioridad'])}
              >
                <SelectTrigger className={`bg-white border-slate-200 ${getPrioridadColor(tarea.prioridad)}`}>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">
                    <span className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      Alta
                    </span>
                  </SelectItem>
                  <SelectItem value="media">
                    <span className="flex items-center gap-2 text-amber-600">
                      <Clock className="w-4 h-4" />
                      Media
                    </span>
                  </SelectItem>
                  <SelectItem value="baja">
                    <span className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Baja
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            disabled={!tarea.titulo.trim()}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Tarea
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};