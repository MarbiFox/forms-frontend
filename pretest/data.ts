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
  openItemCount: 0,
  intro: {
    title: 'Pre-Test · Prueba con Usuarios',
    text: 'Antes de usar la aplicación, queremos conocer tus expectativas. El formulario toma aproximadamente 2 minutos. Tus respuestas son anónimas.',
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
  ],
};
