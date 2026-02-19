import { useState, useEffect, useCallback } from 'react';
import type { PlanTrabajo, Tarea, PlanTrabajoFormData, Empresa } from '@/types';
import { format } from 'date-fns';

const generateId = () => Math.random().toString(36).substr(2, 9);

const STORAGE_CURRENT_KEY = 'plan-trabajo-current';
const STORAGE_LIST_KEY = 'plan-trabajo-list';

const emptyEmpresa: Empresa = {
  nombre: '',
  rut: '',
  direccion: '',
  telefono: '',
  email: '',
  contacto: '',
};

const createEmptyPlan = (): PlanTrabajo => ({
  id: generateId(),
  titulo: '',
  descripcion: '',
  autor: '',
  fechaCreacion: format(new Date(), 'yyyy-MM-dd'),
  fechaInicio: '',
  fechaFin: '',
  objetivos: '',
  tareas: [],
  empresaOrigen: { ...emptyEmpresa },
  empresaDestino: { ...emptyEmpresa },
});

// ─── Helpers de persistencia (exportados para uso en App.tsx) ────────────────

const loadCurrentPlan = (): PlanTrabajo | null => {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanTrabajo;
    // Compatibilidad hacia atrás: planes guardados antes de añadir empresas
    if (!parsed.empresaOrigen) parsed.empresaOrigen = { ...emptyEmpresa };
    if (!parsed.empresaDestino) parsed.empresaDestino = { ...emptyEmpresa };
    return parsed;
  } catch {
    return null;
  }
};

const saveCurrentPlan = (plan: PlanTrabajo) => {
  try {
    localStorage.setItem(STORAGE_CURRENT_KEY, JSON.stringify(plan));
  } catch {
    console.error('Error en auto-save:', plan.id);
  }
};

export const savePlanToList = (plan: PlanTrabajo) => {
  try {
    localStorage.setItem(`plan-${plan.id}`, JSON.stringify(plan));

    const raw = localStorage.getItem(STORAGE_LIST_KEY);
    const list: { id: string; titulo: string; fecha: string }[] = raw
      ? JSON.parse(raw)
      : [];

    const idx = list.findIndex((p) => p.id === plan.id);
    const entry = {
      id: plan.id,
      titulo: plan.titulo || 'Sin título',
      fecha: new Date().toISOString(),
    };

    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }

    localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(list.slice(0, 10)));
  } catch {
    console.error('Error guardando plan en lista');
  }
};

export const getSavedPlansList = (): { id: string; titulo: string; fecha: string }[] => {
  try {
    const raw = localStorage.getItem(STORAGE_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const loadPlanById = (id: string): PlanTrabajo | null => {
  try {
    const raw = localStorage.getItem(`plan-${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanTrabajo;
    if (!parsed.empresaOrigen) parsed.empresaOrigen = { ...emptyEmpresa };
    if (!parsed.empresaDestino) parsed.empresaDestino = { ...emptyEmpresa };
    return parsed;
  } catch {
    return null;
  }
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ActiveTab = 'editar' | 'empresas' | 'timeline' | 'vista-previa';

// ─── Hook ────────────────────────────────────────────────────────────────────

export const usePlanTrabajo = () => {
  const [plan, setPlan] = useState<PlanTrabajo>(
    () => loadCurrentPlan() ?? createEmptyPlan()
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('editar');

  // Auto-save en cada cambio
  useEffect(() => {
    saveCurrentPlan(plan);
  }, [plan]);

  const updatePlanInfo = useCallback((data: PlanTrabajoFormData) => {
    setPlan((prev) => ({ ...prev, ...data }));
  }, []);

  // NUEVO: actualizar empresa emisora
  const updateEmpresaOrigen = useCallback((data: Empresa) => {
    setPlan((prev) => ({ ...prev, empresaOrigen: data }));
  }, []);

  // NUEVO: actualizar empresa destinataria
  const updateEmpresaDestino = useCallback((data: Empresa) => {
    setPlan((prev) => ({ ...prev, empresaDestino: data }));
  }, []);

  const addTarea = useCallback((tarea: Omit<Tarea, 'id'>) => {
    const newTarea: Tarea = { ...tarea, id: generateId() };
    setPlan((prev) => ({
      ...prev,
      tareas: [...prev.tareas, newTarea],
    }));
  }, []);

  const updateTarea = useCallback((id: string, tarea: Partial<Tarea>) => {
    setPlan((prev) => ({
      ...prev,
      tareas: prev.tareas.map((t) => (t.id === id ? { ...t, ...tarea } : t)),
    }));
  }, []);

  const deleteTarea = useCallback((id: string) => {
    setPlan((prev) => ({
      ...prev,
      tareas: prev.tareas.filter((t) => t.id !== id),
    }));
  }, []);

  const reorderTareas = useCallback((tareas: Tarea[]) => {
    setPlan((prev) => ({
      ...prev,
      tareas: tareas.sort(
        (a, b) =>
          new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
      ),
    }));
  }, []);

  const resetPlan = useCallback(() => {
    setPlan(createEmptyPlan());
  }, []);

  // NUEVO: guardar manualmente en lista (botón Guardar)
  const savePlanManual = useCallback(() => {
    setPlan((prev) => {
      savePlanToList(prev);
      return prev;
    });
  }, []);

  // NUEVO: cargar un plan desde la lista
  const loadPlan = useCallback((loaded: PlanTrabajo) => {
    setPlan(loaded);
  }, []);

  const loadExamplePlan = useCallback(() => {
    const hoy = new Date();
    const ejemplo: PlanTrabajo = {
      id: generateId(),
      titulo: 'Desarrollo de Aplicación Web',
      descripcion:
        'Plan de trabajo para el desarrollo completo de una aplicación web moderna con React y TypeScript.',
      autor: 'Equipo de Desarrollo',
      fechaCreacion: format(hoy, 'yyyy-MM-dd'),
      fechaInicio: format(hoy, 'yyyy-MM-dd'),
      fechaFin: format(
        new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000),
        'yyyy-MM-dd'
      ),
      objetivos:
        'Crear una aplicación web responsiva, moderna y escalable que permita a los usuarios gestionar sus proyectos de manera eficiente.',
      empresaOrigen: {
        nombre: 'Tech Solutions SpA',
        rut: '76.123.456-7',
        direccion: 'Av. Providencia 1234, Santiago',
        telefono: '+56 2 2345 6789',
        email: 'contacto@techsolutions.cl',
        contacto: 'Ana García',
      },
      empresaDestino: {
        nombre: 'Retail Corp S.A.',
        rut: '77.987.654-3',
        direccion: 'Av. Las Condes 5678, Santiago',
        telefono: '+56 2 9876 5432',
        email: 'proyectos@retailcorp.cl',
        contacto: 'Carlos Mendoza',
      },
      tareas: [
        {
          id: generateId(),
          titulo: 'Análisis de requisitos',
          descripcion: 'Definir los requisitos funcionales y no funcionales del proyecto.',
          fechaInicio: format(hoy, 'yyyy-MM-dd'),
          fechaFin: format(new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          responsable: 'Analista',
          estado: 'completada',
          prioridad: 'alta',
        },
        {
          id: generateId(),
          titulo: 'Diseño de interfaz',
          descripcion: 'Crear mockups y prototipos de la interfaz de usuario.',
          fechaInicio: format(new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          fechaFin: format(new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          responsable: 'Diseñador UX/UI',
          estado: 'completada',
          prioridad: 'alta',
        },
        {
          id: generateId(),
          titulo: 'Desarrollo del frontend',
          descripcion: 'Implementar la interfaz de usuario con React y TypeScript.',
          fechaInicio: format(new Date(hoy.getTime() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          fechaFin: format(new Date(hoy.getTime() + 45 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          responsable: 'Desarrollador Frontend',
          estado: 'en-progreso',
          prioridad: 'alta',
        },
        {
          id: generateId(),
          titulo: 'Desarrollo del backend',
          descripcion: 'Crear la API REST y la base de datos.',
          fechaInicio: format(new Date(hoy.getTime() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          fechaFin: format(new Date(hoy.getTime() + 50 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          responsable: 'Desarrollador Backend',
          estado: 'en-progreso',
          prioridad: 'alta',
        },
        {
          id: generateId(),
          titulo: 'Pruebas y QA',
          descripcion: 'Realizar pruebas funcionales y de usabilidad.',
          fechaInicio: format(new Date(hoy.getTime() + 48 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          fechaFin: format(new Date(hoy.getTime() + 65 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          responsable: 'QA Engineer',
          estado: 'pendiente',
          prioridad: 'media',
        },
        {
          id: generateId(),
          titulo: 'Despliegue',
          descripcion: 'Desplegar la aplicación en producción.',
          fechaInicio: format(new Date(hoy.getTime() + 63 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          fechaFin: format(new Date(hoy.getTime() + 70 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          responsable: 'DevOps',
          estado: 'pendiente',
          prioridad: 'media',
        },
        {
          id: generateId(),
          titulo: 'Documentación',
          descripcion: 'Crear documentación técnica y de usuario.',
          fechaInicio: format(new Date(hoy.getTime() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          fechaFin: format(new Date(hoy.getTime() + 80 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          responsable: 'Technical Writer',
          estado: 'pendiente',
          prioridad: 'baja',
        },
        {
          id: generateId(),
          titulo: 'Capacitación',
          descripcion: 'Capacitar a los usuarios finales.',
          fechaInicio: format(new Date(hoy.getTime() + 75 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          fechaFin: format(new Date(hoy.getTime() + 85 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          responsable: 'Trainer',
          estado: 'pendiente',
          prioridad: 'baja',
        },
      ],
    };
    setPlan(ejemplo);
  }, []);

  return {
    plan,
    activeTab,
    setActiveTab,
    updatePlanInfo,
    updateEmpresaOrigen,
    updateEmpresaDestino,
    addTarea,
    updateTarea,
    deleteTarea,
    reorderTareas,
    resetPlan,
    loadExamplePlan,
    savePlanManual,
    loadPlan,
  };
};