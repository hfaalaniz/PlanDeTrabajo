import type { Tarea } from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Flag,
  User
} from 'lucide-react';

interface TimelineProps {
  tareas: Tarea[];
  planFechaInicio?: string;
  planFechaFin?: string;
}

export const Timeline = ({ tareas, planFechaInicio: _planFechaInicio, planFechaFin: _planFechaFin }: TimelineProps) => {
  const getEstadoIcon = (estado: Tarea['estado']) => {
    switch (estado) {
      case 'completada':  return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'en-progreso': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pendiente':   return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getEstadoColor = (estado: Tarea['estado']) => {
    switch (estado) {
      case 'completada':  return 'bg-emerald-500';
      case 'en-progreso': return 'bg-blue-500';
      case 'pendiente':   return 'bg-slate-400';
    }
  };

  const getPrioridadColor = (prioridad: Tarea['prioridad']) => {
    switch (prioridad) {
      case 'alta':  return 'text-red-600 bg-red-50';
      case 'media': return 'text-amber-600 bg-amber-50';
      case 'baja':  return 'text-emerald-600 bg-emerald-50';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try { return format(parseISO(dateString), 'dd MMM', { locale: es }); }
    catch { return dateString; }
  };

  const getDuration = (inicio: string, fin: string) => {
    if (!inicio || !fin) return 0;
    try { return differenceInDays(parseISO(fin), parseISO(inicio)) + 1; }
    catch { return 0; }
  };

  const sortedTareas = [...tareas].sort(
    (a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
  );

  if (tareas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">Sin tareas</h3>
        <p className="text-slate-500">Agrega tareas para ver la línea de tiempo</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Línea vertical central */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 via-indigo-400 to-indigo-300 transform md:-translate-x-1/2" />

      <div className="space-y-6">
        {sortedTareas.map((tarea, index) => {
          const isEven = index % 2 === 0;
          const duration = getDuration(tarea.fechaInicio, tarea.fechaFin);

          return (
            <div
              key={tarea.id}
              className={`relative flex items-start gap-4 md:gap-8 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Punto en la línea */}
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 z-10">
                <div className={`w-10 h-10 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center ${getEstadoColor(tarea.estado)}`}>
                  {getEstadoIcon(tarea.estado)}
                </div>
              </div>

              {/* Contenido */}
              <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                isEven ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'
              }`}>
                <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-200 border border-slate-100">
                  <div className={`flex items-start gap-3 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-1">{tarea.titulo}</h4>

                      {tarea.descripcion && (
                        // Sin line-clamp: overflow visible + padding-bottom para que
                        // html2canvas no corte el descender de la última línea de texto
                        <p
                          className="text-sm text-slate-600 mb-3"
                          style={{
                            overflow: 'visible',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: '1.6',
                            paddingBottom: '0.15rem',  // evita corte del descender
                          }}
                        >
                          {tarea.descripcion}
                        </p>
                      )}

                      <div className={`flex flex-wrap gap-2 ${isEven ? 'md:justify-end' : ''}`}>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                          <Flag className="w-3 h-3" />
                          {tarea.prioridad}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                          <Calendar className="w-3 h-3" />
                          {formatDate(tarea.fechaInicio)} - {formatDate(tarea.fechaFin)}
                        </span>

                        {duration > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            <Clock className="w-3 h-3" />
                            {duration} {duration === 1 ? 'día' : 'días'}
                          </span>
                        )}

                        {tarea.responsable && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            <User className="w-3 h-3" />
                            {tarea.responsable}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Espacio vacío para el otro lado */}
              <div className="hidden md:block md:w-[calc(50%-2rem)]" />
            </div>
          );
        })}
      </div>
    </div>
  );
};