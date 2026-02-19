export interface Empresa {
  nombre: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  responsable: string;
  estado: 'pendiente' | 'en-progreso' | 'completada';
  prioridad: 'alta' | 'media' | 'baja';
}

export interface PlanTrabajoFormData {
  titulo: string;
  descripcion: string;
  autor: string;
  fechaInicio: string;
  fechaFin: string;
  objetivos: string;
}

export interface PlanTrabajo extends PlanTrabajoFormData {
  id: string;
  tareas: Tarea[];
  fechaCreacion: string;
  empresaOrigen: Empresa;
  empresaDestino: Empresa;
}