import type { FormStateService } from './services/form-state.service';

function collectNumeric(keys: string[], answers: Record<string, number | string>): number[] {
  return keys.map((k) => {
    const v = answers[k];
    return typeof v === 'number' ? v : 0;
  });
}

function collectOpen(keys: string[], answers: Record<string, number | string>): string[] {
  return keys.map((k) => String(answers[k] ?? ''));
}

const UEQ_KEYS = ['ueq_1', 'ueq_2', 'ueq_3', 'ueq_4', 'ueq_5', 'ueq_6', 'ueq_7', 'ueq_8'];
const TAM_PRE_KEYS = ['tam_1', 'tam_2', 'tam_3', 'tam_4', 'tam_5', 'tam_6'];
const OPEN_PRE_KEYS = ['open_1', 'open_2', 'open_3', 'open_4', 'open_5'];

export function buildPreTestAnswers(state: FormStateService): Record<string, unknown> {
  const answers = state.getAllAnswers();
  return {
    ueqs_pre: collectNumeric(UEQ_KEYS, answers),
    tam_pre: collectNumeric(TAM_PRE_KEYS, answers),
    open_pre: collectOpen(OPEN_PRE_KEYS, answers),
  };
}

const SUS_KEYS = Array.from({ length: 10 }, (_, i) => `sus_${i + 1}`);
const TAM_POST_KEYS = ['tam_p1', 'tam_p2', 'tam_p3', 'tam_p4', 'tam_p5', 'tam_p6'];
const IMI_INTEREST = ['imi_1', 'imi_2', 'imi_3', 'imi_4', 'imi_5', 'imi_6', 'imi_7'];
const IMI_COMPETENCE = ['imi_8', 'imi_9'];
const IMI_CHOICE = ['imi_10', 'imi_11', 'imi_12'];
const IMI_PRESSURE = ['imi_13', 'imi_14'];
const GEQ_KEYS = Array.from({ length: 14 }, (_, i) => `geq_${i + 1}`);
const OPEN_POST_KEYS = ['open_p1', 'open_p2', 'open_p3', 'open_p4', 'open_p5'];

export function buildPostTestAnswers(state: FormStateService): Record<string, unknown> {
  const answers = state.getAllAnswers();
  return {
    sus: collectNumeric(SUS_KEYS, answers),
    ueqs_post: collectNumeric(UEQ_KEYS, answers),
    tam_post: collectNumeric(TAM_POST_KEYS, answers),
    imi: {
      interest_enjoyment: collectNumeric(IMI_INTEREST, answers),
      perceived_competence: collectNumeric(IMI_COMPETENCE, answers),
      perceived_choice: collectNumeric(IMI_CHOICE, answers),
      pressure_tension: collectNumeric(IMI_PRESSURE, answers),
      imi_reversed_applied: true,
    },
    geq_postgame: collectNumeric(GEQ_KEYS, answers),
    open_post: collectOpen(OPEN_POST_KEYS, answers),
  };
}
