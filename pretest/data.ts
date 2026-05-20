import type { FormConfig } from '../shared/types';

const UEQ_ITEMS = [
  { negative: 'Obstructivo', positive: 'Impulsor de apoyo' },
  { negative: 'Complicado', positive: 'Fácil' },
  { negative: 'Ineficiente', positive: 'Eficiente' },
  { negative: 'Confuso', positive: 'Claro' },
  { negative: 'Aburrido', positive: 'Emocionante' },
  { negative: 'No interesante', positive: 'Interesante' },
  { negative: 'Convencional', positive: 'Original' },
  { negative: 'Convencional', positive: 'Novedoso' },
];

export const PRETEST_CONFIG: FormConfig = {
  formId: 'pretest',
  formLabel: 'Pre-Test',
  closedItemCount: 14,
  openItemCount: 5,
  intro: {
    title: 'Pre-Test · Prueba con Usuarios',
    text: 'Antes de usar la aplicación, queremos conocer tus expectativas. El formulario toma aproximadamente 3 minutos. Tus respuestas son anónimas.',
    requiresConsent: true,
  },
  complete: {
    title: '¡Listo! Ya puedes ingresar a la app',
    showPassword: true,
    showCopyButton: true,
  },
  sections: [
    {
      id: 'ueq',
      name: 'UEQ-S',
      transition: {
        title: '¿Qué esperas de la app?',
        icon: '🔭',
        hint: 'Imagina cómo crees que será esta aplicación. Indica tu expectativa para cada par de adjetivos.',
      },
      items: UEQ_ITEMS.map((pair, i) => ({
        type: 'semantic' as const,
        key: `ueq_${i + 1}`,
        negative: pair.negative,
        positive: pair.positive,
      })),
    },
    {
      id: 'tam',
      name: 'TAM',
      transition: {
        title: '¿Qué tan útil crees que será?',
        icon: '🎯',
        hint: 'Indica qué tan probable te parece cada afirmación.',
      },
      items: [
        {
          type: 'likert',
          key: 'tam_1',
          instrument: 'TAM',
          text: 'Usar esta aplicación me permitirá realizar tareas de análisis UX más rápidamente.',
        },
        {
          type: 'likert',
          key: 'tam_2',
          instrument: 'TAM',
          text: 'Usar esta aplicación mejorará mi desempeño en habilidades de diseño UX.',
        },
        {
          type: 'likert',
          key: 'tam_3',
          instrument: 'TAM',
          text: 'Usar esta aplicación aumentará mi productividad como estudiante de UX.',
        },
        {
          type: 'likert',
          key: 'tam_4',
          instrument: 'TAM',
          text: 'Usar esta aplicación potenciará mi efectividad al evaluar interfaces.',
        },
        {
          type: 'likert',
          key: 'tam_5',
          instrument: 'TAM',
          text: 'Usar esta aplicación me facilitará el aprendizaje de UX.',
        },
        {
          type: 'likert',
          key: 'tam_6',
          instrument: 'TAM',
          text: 'Encontraré esta aplicación útil para mi formación en UX.',
        },
      ],
    },
    {
      id: 'open',
      name: 'Abiertas',
      transition: {
        title: 'Cuéntanos qué esperas',
        icon: '💬',
        hint: 'Estas preguntas son sobre cada módulo de la app. Responde con lo que pienses, no hay respuestas incorrectas.',
      },
      items: [
        {
          type: 'open',
          key: 'open_1',
          module: 'Módulo de Ejercicios',
          text: '¿Qué esperas aprender con los ejercicios de evaluación heurística, diseño UI y pruebas con usuarios? ¿Crees que este tipo de práctica interactiva puede ayudarte a mejorar tus habilidades en UX?',
        },
        {
          type: 'open',
          key: 'open_2',
          module: 'Módulo de Perfil',
          text: '¿Qué importancia le das a poder ver tus métricas de entrenamiento (nivel, puntos, racha) en tu perfil? ¿Crees que eso te motivaría a seguir usando la aplicación?',
        },
        {
          type: 'open',
          key: 'open_3',
          module: 'Módulo de Progreso',
          text: '¿Esperarías que la aplicación te muestre estadísticas de tu avance y te sugiera en qué áreas mejorar? ¿Cómo crees que eso influiría en tu aprendizaje?',
        },
        {
          type: 'open',
          key: 'open_4',
          module: 'Módulo de Recompensas',
          text: '¿Crees que ganar insignias y logros al completar ejercicios te motivaría a seguir practicando? ¿Por qué sí o por qué no?',
        },
        {
          type: 'open',
          key: 'open_5',
          module: 'Módulo de Personalización',
          text: '¿Qué tan importante te parece poder ajustar el nivel de dificultad, elegir áreas de interés o activar el modo oscuro? ¿Qué personalizaciones valorarías más?',
        },
      ],
    },
  ],
};
