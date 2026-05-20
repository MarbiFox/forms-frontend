export type LikertInstrument = 'SUS' | 'TAM' | 'IMI' | 'GEQ';

export type FormPhase = 'intro' | 'question' | 'submitting' | 'complete';

export interface SectionTransition {
  title: string;
  icon: string;
  hint: string;
}

export interface SemanticItem {
  type: 'semantic';
  key: string;
  negative: string;
  positive: string;
}

export interface LikertItem {
  type: 'likert';
  key: string;
  text: string;
  instrument: LikertInstrument;
  reversed?: boolean;
}

export interface OpenItem {
  type: 'open';
  key: string;
  module: string;
  text: string;
}

export type FormItem = SemanticItem | LikertItem | OpenItem;

export interface FormSection {
  id: string;
  name: string;
  transition: SectionTransition;
  items: FormItem[];
}

export interface FormConfig {
  formId: 'pretest' | 'posttest';
  formLabel: string;
  closedItemCount: number;
  openItemCount: number;
  sections: FormSection[];
  intro: {
    title: string;
    text: string;
    requiresConsent?: boolean;
    requiresPassword?: boolean;
  };
  complete: {
    title: string;
    subtitle?: string;
    showPassword?: boolean;
    showCopyButton?: boolean;
  };
}

export interface PersistedFormState {
  formId: string;
  phase: FormPhase;
  sectionIndex: number;
  itemIndex: number;
  answers: Record<string, number | string>;
  timestampStart: string;
  sectionIntroPending?: boolean;
  consentAccepted?: boolean;
  closingPassword?: string;
  entryPassword?: string;
}

export const LIKERT_ANCHORS: Record<LikertInstrument, { low: string; high: string }> = {
  SUS: { low: 'Totalmente en desacuerdo', high: 'Totalmente de acuerdo' },
  IMI: { low: 'Para nada verdadero', high: 'Muy verdadero' },
  TAM: { low: 'Muy improbable', high: 'Muy probable' },
  GEQ: { low: 'Para nada', high: 'Extremadamente' },
};
