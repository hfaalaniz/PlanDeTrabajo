import type { Tarea } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User,
  Flag,
  GripVertical
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TareasListProps {
  tareas: Tarea[];
  onDelete: (id: string) => void;
  onEdit: (tarea: Tarea) => void;
}

export const TareasList = ({ tareas, onDelete, onEdit }: TareasListProps) => {
  const getEstadoConfig = (estado: Tarea['estado']) => {
    switch (estado) {
      case 'completada':
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: 'Completada',
          className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
      case 'en-progreso':
        return {
          icon: <Clock className="w-4 h-4" />,
          label: 'En Progreso',
          className: 'bg-blue-100 text-blue-700 border-blue-200',
        };
      case 'pendiente':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Pendiente',
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const getPrioridadConfig = (prioridad: Tarea['prioridad']) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'media':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'baja':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  if (tareas.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">No hay tareas</h3>
          <p className="text-slate-500">Agrega tu primera tarea usando el formulario</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tareas.map((tarea, index) => {
        const estadoConfig = getEstadoConfig(tarea.estado);
        const prioridadClass = getPrioridadConfig(tarea.prioridad);

        return (
          <Card 
            key={tarea.id} 
            className="border-0 shadow-md bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <GripVertical className="w-5 h-5" />
                  <span className="text-sm font-medium w-6">{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-slate-800 truncate">{tarea.titulo}</h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => onEdit(tarea)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(tarea.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {tarea.descripcion && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{tarea.descripcion}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={estadoConfig.className}>
                      <span className="flex items-center gap-1">
                        {estadoConfig.icon}
                        {estadoConfig.label}
                      </span>
                    </Badge>

                    <Badge variant="outline" className={prioridadClass}>
                      <span className="flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        {tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1)}
                      </span>
                    </Badge>

                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(tarea.fechaInicio)} - {formatDate(tarea.fechaFin)}
                      </span>
                    </Badge>

                    {tarea.responsable && (
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {tarea.responsable}
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
