# Cursor Prompt — Formularios Pre-Test y Post-Test
## UX Training App · PUCV

---

## Contexto del proyecto

Estoy desarrollando una PWA de entrenamiento en habilidades UX llamada **UX Training App**,
construida con Angular Standalone + TypeScript + Bootstrap. El proyecto incluye dos formularios
web independientes que se usan en una prueba con usuarios:

- `pretest.androtesting.com` — Pre-Test (14 ítems cerrados + 5 preguntas abiertas)
- `posttest.androtesting.com` — Post-Test (52 ítems cerrados + 5 preguntas abiertas)

Ambos formularios son páginas independientes (no forman parte del build principal de la app),
pero comparten el mismo sistema de diseño. Deben funcionar como PWA ligeras: HTML/CSS/JS
vanilla o Angular mínimo, sin dependencias pesadas.

---

## Sistema de diseño (obligatorio respetar)

### Paleta de colores
```css
--color-primary: #14BDC6;
--color-primary-soft: #C1E6EC;
--color-accent-dark: #104911;
--color-accent-mid: #548C2F;
--color-accent-yellow: #FFBA49;
--color-bg: #FFFFFF;
--color-bg-alt: #F7F8FA;
--color-text: #1A1A1A;
--color-text-secondary: #6B7280;
--color-error: #D64545;
```

### Tipografía
- Fuente: **Poppins** (Google Fonts) — títulos en bold/semibold, cuerpo en regular
- Tamaño base: 16px móvil, 18px desktop
- Títulos de sección: 22–26px bold
- Enunciado de pregunta: 18–20px semibold
- Anclas Likert: 12px, color `--color-text-secondary`

### Componentes visuales
- Border-radius generoso: 16–24px en tarjetas, 12px en botones
- Sombras suaves: `box-shadow: 0 2px 12px rgba(0,0,0,0.08)`
- Botón principal: fondo `#104911`, texto blanco, ancho completo, altura 52px, border-radius 14px
- Botón secundario / navegación: fondo `#14BDC6`, texto blanco
- Transiciones: `transition: all 0.25s ease`
- Animación entre preguntas: slide horizontal (`translateX`) + fade, duración 300ms
- Auto-avance tras selección en ítems Likert/diferencial: delay 400ms

### Layout sin scroll
- `height: 100dvh`, `overflow: hidden`
- Tres zonas fijas:
  - **Header** (≈12%): logo izquierda + nombre formulario + contador numérico derecha
  - **Progress bar** (4px, color `#14BDC6`, animada): entre header y zona central
  - **Zona central** (≈72%): una pregunta centrada verticalmente, `display: flex; align-items: center`
  - **Footer** (≈16%): botón de acción o indicación de auto-avance

---

## Arquitectura de archivos

```
/forms
  /pretest
    index.html
    main.ts (o app.js si vanilla)
    styles.css
    data.ts  ← ítems y configuración
  /posttest
    index.html
    main.ts
    styles.css
    data.ts
  /shared
    components/
      likert-scale.component.ts     ← escala 1–7 con anclas
      semantic-diff.component.ts    ← diferencial semántico UEQ-S
      open-question.component.ts    ← textarea con contador
      progress-bar.component.ts     ← barra por sección
      section-transition.component.ts ← pantalla de transición entre secciones
    services/
      form-state.service.ts         ← estado global del formulario
      api.service.ts                ← envío al backend
    styles/
      variables.css
      base.css
      components.css
```

---

## Componente: Escala Likert (compartido por SUS, IMI, TAM, GEQ)

Estándar visual para TODOS los ítems de escala numérica:

```
Ancla baja (gris, 12px)    [1] [2] [3] [4] [5] [6] [7]    Ancla alta (gris, 12px)
```

- 7 botones cuadrados/circulares (48×48px mínimo para touch), numerados 1–7
- Sin seleccionar: borde `1.5px solid #C1E6EC`, fondo transparente, número en `#6B7280`
- Seleccionado: fondo `#14BDC6`, número en blanco, leve scale(1.1) animado
- Auto-avance: 400ms después de la selección, slide a la siguiente pregunta
- Las anclas de texto se muestran SIEMPRE, no solo al hacer hover

### Anclas por instrumento

| Instrumento | Ancla izquierda (1) | Ancla derecha (7) |
|---|---|---|
| SUS | Totalmente en desacuerdo | Totalmente de acuerdo |
| IMI | Para nada verdadero | Muy verdadero |
| TAM | Muy improbable | Muy probable |
| GEQ | Para nada | Extremadamente |

---

## Componente: Diferencial Semántico (UEQ-S)

Mismo layout que Likert, pero con adjetivos como anclas en lugar de frases:

```
Adjetivo negativo (gris)    [1] [2] [3] [4] [5] [6] [7]    Adjetivo positivo (#14BDC6)
```

- Adjetivo positivo en color `#14BDC6` para indicar la dirección deseable
- Adjetivo negativo en `#6B7280`
- Mismo comportamiento de auto-avance

---

## Componente: Pregunta Abierta

- Textarea de altura fija (no crece con el contenido): 120px
- Placeholder en gris: "Escribe tu respuesta aquí…"
- Contador de caracteres abajo a la derecha: "0 / 500"
- El botón "Siguiente →" está siempre visible (respuesta opcional pero recomendada)
- `resize: none` en el textarea
- El teclado virtual NO desplaza el layout gracias a `position: fixed` en header y footer,
  y `height: 100dvh` con `overflow: hidden` en el contenedor

---

## Componente: Barra de progreso por sección

- Delgada (4px), color `#14BDC6`, animación de fill con `transition: width 0.3s ease`
- Posición: inmediatamente bajo el header, ancho completo
- Refleja el avance DENTRO de la sección activa (no global)
- Las pestañas/secciones se muestran como indicadores de puntos o pills en el header,
  destacando la sección activa

---

## Componente: Transición entre secciones

Al completar todos los ítems de una sección, mostrar durante ~1.5s una pantalla de transición:
- Ícono o ilustración representativa de la siguiente sección (puede ser emoji grande o SVG simple)
- Nombre de la siguiente sección en bold
- Frase corta de contexto (ver textos en la especificación de secciones abajo)
- Luego slide automático a la primera pregunta de la siguiente sección

---

## Pantalla de introducción (antes de la primera sección)

### Pre-Test
- Logo de UX Training App centrado (SVG o img)
- Título: "Pre-Test · Prueba con Usuarios"
- Párrafo breve (2–3 líneas): "Antes de usar la aplicación, queremos conocer tus expectativas. El formulario toma aproximadamente 3 minutos. Tus respuestas son anónimas."
- Checkbox de consentimiento: "Acepto participar de forma voluntaria y anónima"
- Botón "Comenzar →" (deshabilitado hasta marcar checkbox)

### Post-Test
- Campo de contraseña de cierre (token de 6 caracteres, validado contra backend)
- Si es válido: slide de entrada al formulario
- Si es inválido: mensaje de error en rojo, campo shake animation

---

## Pantalla de cierre

### Pre-Test
- Ilustración del búho de la app (img/svg) centrado
- Título: "¡Listo! Ya puedes ingresar a la app"
- Contraseña de acceso generada en grande (font-size: 36px, bold, color `#14BDC6`):
  `[ABC123]`
- Botón "Copiar contraseña" con icono, que copia al clipboard y cambia a "✓ Copiada"
- Texto pequeño: "Anótala también en tu documento guía"

### Post-Test
- Ilustración del búho en pose feliz
- Título: "¡Gracias por participar!"
- Subtítulo: "Tus respuestas son muy valiosas para mejorar la aplicación."
- Sin botón de acción (proceso terminado)

---

## ESPECIFICACIÓN COMPLETA — PRE-TEST

### Header
- Logo: "UX Training App" con ícono búho
- Label: "Pre-Test"
- Contador: "Pregunta X de 14" (solo cuenta ítems cerrados; preguntas abiertas tienen su propio contador)

### Sección 1 — UEQ-S (8 ítems · diferencial semántico 1–7)
**Transición de entrada:** "¿Qué esperas de la app?" · ícono 🔭

Instrucción de sección (mostrar solo en la primera pregunta de la sección, en texto secundario pequeño):
> "Imagina cómo crees que será esta aplicación. Indica tu expectativa para cada par de adjetivos."

Ítems (par negativo → par positivo):

1. Obstructivo → Impulsor de apoyo
2. Complicado → Fácil
3. Ineficiente → Eficiente
4. Confuso → Claro
5. Aburrido → Emocionante
6. No interesante → Interesante
7. Convencional → Original
8. Convencional → Novedoso

### Sección 2 — TAM Utilidad Percibida (6 ítems · Likert 1–7)
**Transición de entrada:** "¿Qué tan útil crees que será?" · ícono 🎯
Anclas: 1 = Muy improbable · 7 = Muy probable

1. Usar esta aplicación me permitirá realizar tareas de análisis UX más rápidamente.
2. Usar esta aplicación mejorará mi desempeño en habilidades de diseño UX.
3. Usar esta aplicación aumentará mi productividad como estudiante de UX.
4. Usar esta aplicación potenciará mi efectividad al evaluar interfaces.
5. Usar esta aplicación me facilitará el aprendizaje de UX.
6. Encontraré esta aplicación útil para mi formación en UX.

### Sección 3 — Preguntas Abiertas (5 preguntas · textarea)
**Transición de entrada:** "Cuéntanos qué esperas" · ícono 💬
Instrucción: "Estas preguntas son sobre cada módulo de la app. Responde con lo que pienses, no hay respuestas incorrectas."

1. **Módulo de Ejercicios** — ¿Qué esperas aprender con los ejercicios de evaluación heurística, diseño UI y pruebas con usuarios? ¿Crees que este tipo de práctica interactiva puede ayudarte a mejorar tus habilidades en UX?
2. **Módulo de Perfil** — ¿Qué importancia le das a poder ver tus métricas de entrenamiento (nivel, puntos, racha) en tu perfil? ¿Crees que eso te motivaría a seguir usando la aplicación?
3. **Módulo de Progreso** — ¿Esperarías que la aplicación te muestre estadísticas de tu avance y te sugiera en qué áreas mejorar? ¿Cómo crees que eso influiría en tu aprendizaje?
4. **Módulo de Recompensas** — ¿Crees que ganar insignias y logros al completar ejercicios te motivaría a seguir practicando? ¿Por qué sí o por qué no?
5. **Módulo de Personalización** — ¿Qué tan importante te parece poder ajustar el nivel de dificultad, elegir áreas de interés o activar el modo oscuro? ¿Qué personalizaciones valorarías más?

---

## ESPECIFICACIÓN COMPLETA — POST-TEST

### Header
- Logo + "Post-Test"
- Contador: "Pregunta X de 52" (solo ítems cerrados)

### Sección 1 — SUS (10 ítems · Likert 1–7)
**Transición de entrada:** "Sobre la usabilidad" · ícono 🖥️
Anclas: 1 = Totalmente en desacuerdo · 7 = Totalmente de acuerdo

1. Me parece que me gustaría usar esta aplicación con frecuencia.
2. Encontré la aplicación innecesariamente compleja.
3. Pensé que la aplicación era fácil de usar.
4. Creo que necesitaría el apoyo de un experto para poder usar esta aplicación.
5. Encontré que las distintas funciones de la aplicación estaban bien integradas.
6. Pensé que había demasiadas inconsistencias en la aplicación.
7. Creo que la mayoría de las personas aprenderían a usar esta aplicación muy rápidamente.
8. Encontré la aplicación muy incómoda de usar.
9. Me sentí muy confiado/a al usar la aplicación.
10. Necesité aprender muchas cosas antes de poder usar esta aplicación.

### Sección 2 — UEQ-S (8 ítems · diferencial semántico 1–7)
**Transición de entrada:** "Sobre tu experiencia general" · ícono ⭐
Instrucción: "Ahora que la usaste, describe cómo fue tu experiencia real con la aplicación."

Mismos 8 pares que el pre-test (mismo orden):
1. Obstructivo → Impulsor de apoyo
2. Complicado → Fácil
3. Ineficiente → Eficiente
4. Confuso → Claro
5. Aburrido → Emocionante
6. No interesante → Interesante
7. Convencional → Original
8. Convencional → Novedoso

### Sección 3 — TAM Utilidad Percibida (6 ítems · Likert 1–7)
**Transición de entrada:** "¿Qué tan útil resultó ser?" · ícono 🎯
Anclas: 1 = Muy improbable · 7 = Muy probable

1. Usar esta aplicación me permitió realizar tareas de análisis UX más rápidamente.
2. Usar esta aplicación mejoró mi desempeño en habilidades de diseño UX.
3. Usar esta aplicación aumentó mi productividad como estudiante de UX.
4. Usar esta aplicación potenció mi efectividad al evaluar interfaces.
5. Usar esta aplicación me facilitó el aprendizaje de UX.
6. Encontré esta aplicación útil para mi formación en UX.

### Sección 4 — IMI (14 ítems · Likert 1–7)
**Transición de entrada:** "Sobre tu motivación" · ícono 🔥
Anclas: 1 = Para nada verdadero · 7 = Muy verdadero

**Nota de implementación:** Los ítems marcados con (R) son inversos. Deben mostrarse tal como están
al usuario, pero al guardar la respuesta se almacena el valor invertido (8 − valor) en el payload JSON.

#### Interest/Enjoyment (7 ítems)
1. Disfruté mucho hacer esta actividad.
2. Esta actividad fue entretenida.
3. Describí esta actividad como muy interesante.
4. Pensé que esta actividad era bastante disfrutable.
5. Mientras hacía esta actividad, pensé en cuánto me estaba gustando.
6. Creo que esta actividad es bastante aburrida. **(R)**
7. Esta actividad no captó mi atención en absoluto. **(R)**

#### Perceived Competence (2 ítems)
8. Creo que soy bastante bueno/a en esta actividad.
9. Me sentí bastante competente al hacer esta actividad.

#### Perceived Choice (3 ítems)
10. Creo que tuve cierta elección sobre cómo hacer esta actividad.
11. Sentí que era mi propia decisión hacer esta actividad.
12. Hice esta actividad porque quería hacerla.

#### Pressure/Tension (2 ítems)
13. Me sentí muy tenso/a mientras hacía esta actividad.
14. Me sentí ansioso/a mientras trabajaba en esta actividad.

### Sección 5 — GEQ Post-game (14 ítems · Likert 1–7)
**Transición de entrada:** "¿Cómo te sentiste al terminar?" · ícono 🎮
Anclas: 1 = Para nada · 7 = Extremadamente

1. Me sentí revitalizado/a.
2. Me sentí mal.
3. Me costó volver a la realidad.
4. Sentí que fue una victoria.
5. Sentí que fue una pérdida de tiempo.
6. Me sentí con energía.
7. Me sentí satisfecho/a.
8. Me sentí desorientado/a.
9. Me sentí agotado/a.
10. Sentí que podría haber hecho cosas más útiles.
11. Me sentí poderoso/a.
12. Me sentí cansado/a.
13. Sentí arrepentimiento.
14. Tuve la sensación de haber regresado de un viaje.

### Sección 6 — Preguntas Abiertas (5 preguntas · textarea)
**Transición de entrada:** "Por último, tu opinión" · ícono 💬
Instrucción: "Estas preguntas son sobre cada módulo de la app. Sé tan específico/a como quieras."

1. **Módulo de Ejercicios** — ¿Los ejercicios de evaluación heurística, diseño UI y pruebas con usuarios te resultaron útiles y comprensibles? ¿Hubo algún tipo de ejercicio que encontraras confuso o que mejorarías?
2. **Módulo de Perfil** — ¿La información de tu perfil (nivel, puntos, racha) fue fácil de encontrar y entender? ¿Sientes que refleja tu progreso real dentro de la aplicación?
3. **Módulo de Progreso** — ¿Las estadísticas y sugerencias del módulo de progreso te ayudaron a entender en qué áreas de UX necesitas practicar más? ¿Qué cambiarías o añadirías?
4. **Módulo de Recompensas** — ¿Las insignias y logros que obtuviste te generaron motivación para seguir practicando? ¿El sistema de recompensas te pareció justo y claro?
5. **Módulo de Personalización** — ¿Pudiste ajustar la aplicación a tus preferencias con facilidad? ¿Hay alguna opción de personalización que hayas echado de menos o que te haya resultado confusa?

---

## Backend — Contrato de API

### POST /api/pretest/submit
```json
{
  "session_token": "string (generado al inicio)",
  "timestamp_start": "ISO8601",
  "timestamp_end": "ISO8601",
  "ueqs_pre": [1, 4, 6, 7, 5, 6, 3, 4],
  "tam_pre": [5, 6, 4, 5, 6, 7],
  "open_pre": [
    "respuesta módulo ejercicios",
    "respuesta módulo perfil",
    "respuesta módulo progreso",
    "respuesta módulo recompensas",
    "respuesta módulo personalización"
  ]
}
```
**Respuesta:**
```json
{
  "access_password": "ABC123",
  "session_id": "uuid"
}
```

### POST /api/posttest/submit
```json
{
  "session_id": "uuid (vincula con pre-test)",
  "close_password": "ABC123 (validado server-side)",
  "timestamp_start": "ISO8601",
  "timestamp_end": "ISO8601",
  "sus": [5, 2, 6, 1, 5, 2, 6, 2, 5, 2],
  "ueqs_post": [5, 6, 5, 6, 5, 6, 4, 5],
  "tam_post": [5, 6, 5, 6, 5, 6],
  "imi": {
    "interest_enjoyment": [6, 5, 6, 6, 5, 2, 1],
    "perceived_competence": [5, 5],
    "perceived_choice": [6, 6, 7],
    "pressure_tension": [2, 2],
    "imi_reversed_applied": true
  },
  "geq_postgame": [5, 2, 2, 6, 1, 5, 6, 2, 2, 2, 4, 2, 1, 3],
  "open_post": [
    "respuesta módulo ejercicios",
    "respuesta módulo perfil",
    "respuesta módulo progreso",
    "respuesta módulo recompensas",
    "respuesta módulo personalización"
  ]
}
```

### Notas de implementación del backend
- Los ítems inversos del IMI (6 y 7 de Interest/Enjoyment) deben enviarse ya invertidos
  (valor almacenado = 8 − valor seleccionado por el usuario)
- El campo `close_password` se valida server-side: si no coincide con el `access_password`
  asociado a ese `session_id`, retornar 401
- Guardar `timestamp_start` y `timestamp_end` permite calcular tiempo total de respuesta
- Todos los arrays de ítems siguen el orden declarado en esta especificación

---

## Comportamiento de guardado progresivo

Cada vez que el usuario responde un ítem y avanza a la siguiente pregunta, el estado
se persiste en `sessionStorage` con la clave `uxapp_form_state`. Si el usuario cierra y
reabre el navegador en el mismo dispositivo durante la misma sesión, el formulario
recupera el estado y lleva al usuario a la última pregunta respondida.

El envío al backend ocurre una sola vez, al presionar el botón final de la última sección.
No enviar ítems individualmente (para evitar datos incompletos en la base).

---

## Requerimientos técnicos finales

- **Framework:** HTML/CSS/JS vanilla preferido para mantener el bundle mínimo.
  Alternativa aceptable: Angular Standalone sin dependencias extra.
- **Sin scroll en móvil:** Layout con `height: 100dvh; overflow: hidden` obligatorio.
  Validar en iOS Safari (viewport-fit=cover en el meta tag).
- **Fuente:** Importar Poppins desde Google Fonts solo los pesos 400 y 600.
- **Sin imágenes externas** salvo el logo/búho de la app (SVG inline preferido).
- **Accesibilidad mínima:** Todos los botones Likert con `aria-label="X de 7"`.
  El enunciado de la pregunta debe tener `role="heading" aria-level="2"`.
- **Meta tags PWA:** `<meta name="theme-color" content="#14BDC6">`,
  `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- **Deploy independiente:** Cada formulario es una carpeta con su propio `index.html`,
  deployable en cualquier servidor estático o Nginx.
