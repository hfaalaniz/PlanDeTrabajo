# 📋 Plan de Trabajo Pro

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-indigo)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Netlify](https://img.shields.io/badge/Netlify-deployed-00C7B7?logo=netlify)

**Crea, gestiona y exporta planes de trabajo profesionales con línea de tiempo, datos de empresa y exportación a PDF.**

[🚀 Demo en vivo](https://plantrabajopro.netlify.app) · [🐛 Reportar un bug](https://github.com/hfaalaniz/PlanDeTrabajo/issues) · [💡 Solicitar feature](https://github.com/hfaalaniz/PlanDeTrabajo/issues)

</div>

---

## 📸 Capturas de pantalla

| Editor de Plan | Línea de Tiempo | Vista Previa PDF |
|:-:|:-:|:-:|
| ![Editor](.github/screenshots/editor.png) | ![Timeline](.github/screenshots/timeline.png) | ![PDF](.github/screenshots/pdf.png) |

---

## ✨ Características

- **Gestión de tareas** — Agrega, edita y elimina tareas con estado, prioridad, fechas y responsable
- **Línea de tiempo** — Visualización cronológica alternada de todas las tareas del plan
- **Datos de empresa** — Registra empresa emisora y destinataria del plan
- **Vista previa** — Previsualización del documento final antes de exportar
- **Exportación PDF** — Descarga el plan completo con o sin línea de tiempo incluida
- **Impresión** — Imprime directamente desde el navegador con estilos optimizados
- **Persistencia local** — Auto-guardado automático en localStorage; guarda y carga múltiples planes
- **Filtro por estado** — Filtra tareas por estado directamente desde las tarjetas de estadísticas
- **Plan de ejemplo** — Carga un plan de ejemplo para explorar todas las funcionalidades

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| [React 18](https://react.dev/) | UI y componentes |
| [TypeScript 5](https://www.typescriptlang.org/) | Tipado estático |
| [Vite 5](https://vitejs.dev/) | Bundler y dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Estilos utilitarios |
| [shadcn/ui](https://ui.shadcn.com/) | Componentes UI accesibles |
| [html2canvas](https://html2canvas.hertzen.com/) | Captura de DOM para PDF |
| [jsPDF](https://github.com/parallax/jsPDF) | Generación de archivos PDF |
| [date-fns](https://date-fns.org/) | Manejo de fechas |
| [Lucide React](https://lucide.dev/) | Iconos |

---

## 🚀 Instalación y uso local

### Prerrequisitos

- [Node.js](https://nodejs.org/) v20 o superior
- [Git](https://git-scm.com/)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/hfaalaniz/PlanDeTrabajo.git

# 2. Entrar al directorio
cd PlanDeTrabajo

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo con hot-reload
npm run build     # Build de producción en /dist
npm run preview   # Preview del build de producción
npm run lint      # Análisis estático del código
```

---

## 📁 Estructura del proyecto

```
PlanDeTrabajo/
├── public/
│   └── _redirects              # Redirects para Netlify SPA
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes base (shadcn/ui)
│   │   ├── App.tsx             # Componente raíz
│   │   ├── EmpresaForm.tsx     # Formulario de datos de empresa
│   │   ├── PDFExport.tsx       # Exportación e impresión PDF
│   │   ├── PlanForm.tsx        # Formulario de información del plan
│   │   ├── PlanPreview.tsx     # Vista previa del documento
│   │   ├── TareaForm.tsx       # Formulario de tarea
│   │   ├── TareasList.tsx      # Lista de tareas
│   │   └── Timeline.tsx        # Línea de tiempo
│   ├── hooks/
│   │   └── usePlanTrabajo.ts   # Hook principal + persistencia
│   ├── types/
│   │   └── index.ts            # Definición de tipos TypeScript
│   └── main.tsx
├── netlify.toml                # Configuración de despliegue
├── .gitignore
└── package.json
```

---

## 🌐 Despliegue en Netlify

El proyecto está configurado para despliegue continuo desde GitHub.

1. Conecta el repositorio en [netlify.com](https://netlify.com)
2. Netlify detecta la configuración automáticamente desde `netlify.toml`
3. Cada push a `main` genera un nuevo deploy automáticamente

**Configuración de build:**

| Parámetro | Valor |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 20 |

---

## 🤝 Cómo contribuir

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1. **Fork** el repositorio
2. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Realiza tus cambios** y haz commit:
   ```bash
   git commit -m "feat: descripción de la funcionalidad"
   ```
4. **Push** a tu rama:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Abre un Pull Request** en GitHub describiendo los cambios

### Convención de commits

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Cambios en documentación |
| `style:` | Cambios de formato/estilo |
| `refactor:` | Refactorización de código |
| `chore:` | Tareas de mantenimiento |

### Reportar bugs

Abre un [issue](https://github.com/hfaalaniz/PlanDeTrabajo/issues) con:
- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs. actual
- Capturas de pantalla si aplica

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más información.

```
MIT License

Copyright (c) 2025 Fabián Alaniz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👤 Autor

**Fabián Alaniz**

- GitHub: [@hfaalaniz](https://github.com/hfaalaniz)
- Repositorio: [github.com/hfaalaniz/PlanDeTrabajo](https://github.com/hfaalaniz/PlanDeTrabajo)

---

## 🙏 Agradecimientos

- [shadcn/ui](https://ui.shadcn.com/) por los componentes accesibles y bien diseñados
- [Lucide](https://lucide.dev/) por la librería de iconos
- [Netlify](https://netlify.com) por el hosting gratuito y el CI/CD

---

<div align="center">
  <sub>Hecho con ❤️ y React · © 2025 Fabián Alaniz</sub>
</div>