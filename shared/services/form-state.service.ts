import type { FormConfig, FormItem, FormPhase, PersistedFormState } from '../types';

const STORAGE_KEY = 'uxapp_form_state';

export class FormStateService {
  private state: PersistedFormState;

  constructor(private readonly config: FormConfig) {
    this.state = this.load() ?? this.createInitial();
    this.migrateLegacyPhase();
  }

  private createInitial(): PersistedFormState {
    return {
      formId: this.config.formId,
      phase: 'intro',
      sectionIndex: 0,
      itemIndex: 0,
      answers: {},
      timestampStart: new Date().toISOString(),
    };
  }

  private load(): PersistedFormState | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedFormState;
      if (parsed.formId !== this.config.formId) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  persist(): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  getPhase(): FormPhase {
    return this.state.phase;
  }

  setPhase(phase: FormPhase): void {
    this.state.phase = phase;
    this.persist();
  }

  getSectionIndex(): number {
    return this.state.sectionIndex;
  }

  getItemIndex(): number {
    return this.state.itemIndex;
  }

  getCurrentSection() {
    return this.config.sections[this.state.sectionIndex];
  }

  getCurrentItem(): FormItem | null {
    const section = this.getCurrentSection();
    if (!section) return null;
    return section.items[this.state.itemIndex] ?? null;
  }

  getAnswer(key: string): number | string | undefined {
    return this.state.answers[key];
  }

  setAnswer(key: string, value: number | string, options?: { invert?: boolean }): void {
    if (typeof value === 'number' && options?.invert) {
      this.state.answers[key] = 8 - value;
    } else {
      this.state.answers[key] = value;
    }
    this.persist();
  }

  setConsent(accepted: boolean): void {
    this.state.consentAccepted = accepted;
    this.persist();
  }

  hasConsent(): boolean {
    return !!this.state.consentAccepted;
  }

  setClosingPassword(password: string): void {
    this.state.closingPassword = password.trim().toUpperCase();
    this.persist();
  }

  getClosingPassword(): string {
    return this.state.closingPassword ?? '';
  }

  setEntryPassword(password: string): void {
    this.state.entryPassword = password;
    this.persist();
  }

  getEntryPassword(): string | undefined {
    return this.state.entryPassword;
  }

  getTimestampStart(): string {
    return this.state.timestampStart;
  }

  getTimestampEnd(): string {
    return new Date().toISOString();
  }

  getAllAnswers(): Record<string, number | string> {
    return { ...this.state.answers };
  }

  /** Ítems cerrados respondidos (Likert + semántico) */
  getClosedAnsweredCount(): number {
    return this.config.sections
      .flatMap((s) => s.items)
      .filter((i) => i.type !== 'open' && this.state.answers[i.key] !== undefined).length;
  }

  getOpenAnsweredCount(): number {
    return this.config.sections
      .flatMap((s) => s.items)
      .filter((i) => i.type === 'open' && String(this.state.answers[i.key] ?? '').trim().length > 0)
      .length;
  }

  getSectionProgress(): { current: number; total: number } {
    const section = this.getCurrentSection();
    if (!section) return { current: 0, total: 1 };
    const answered = section.items.filter((item) => this.state.answers[item.key] !== undefined).length;
    return { current: Math.max(this.state.itemIndex + 1, answered), total: section.items.length };
  }

  isLastItemInSection(): boolean {
    const section = this.getCurrentSection();
    if (!section) return true;
    return this.state.itemIndex >= section.items.length - 1;
  }

  isLastSection(): boolean {
    return this.state.sectionIndex >= this.config.sections.length - 1;
  }

  isSectionIntroPending(): boolean {
    return !!this.state.sectionIntroPending;
  }

  dismissSectionIntro(): void {
    this.state.sectionIntroPending = false;
    this.persist();
  }

  advanceToNextItem(): boolean {
    const section = this.getCurrentSection();
    if (!section) return false;

    if (this.state.itemIndex < section.items.length - 1) {
      this.state.itemIndex += 1;
      this.state.phase = 'question';
      this.persist();
      return true;
    }

    if (this.state.sectionIndex < this.config.sections.length - 1) {
      this.state.sectionIndex += 1;
      this.state.itemIndex = 0;
      this.state.phase = 'question';
      this.state.sectionIntroPending = true;
      this.persist();
      return true;
    }

    return false;
  }

  startForm(): void {
    this.state.phase = 'question';
    this.state.sectionIndex = 0;
    this.state.itemIndex = 0;
    this.state.sectionIntroPending = true;
    if (!this.state.timestampStart) {
      this.state.timestampStart = new Date().toISOString();
    }
    this.persist();
  }

  canGoBack(): boolean {
    if (this.state.phase !== 'question') return false;
    if (this.isSectionIntroPending()) {
      return true;
    }
    if (this.state.itemIndex > 0) return true;
    if (this.state.sectionIndex > 0) return true;
    return true;
  }

  goToPreviousItem(): boolean {
    if (this.state.phase !== 'question') return false;

    if (this.isSectionIntroPending()) {
      if (this.state.sectionIndex === 0) {
        this.state.phase = 'intro';
        this.state.sectionIntroPending = false;
        this.persist();
        return true;
      }
      const prev = this.config.sections[this.state.sectionIndex - 1];
      this.state.sectionIndex -= 1;
      this.state.itemIndex = Math.max(0, prev.items.length - 1);
      this.state.sectionIntroPending = false;
      this.persist();
      return true;
    }

    if (this.state.itemIndex > 0) {
      this.state.itemIndex -= 1;
      this.persist();
      return true;
    }

    if (this.state.sectionIndex > 0) {
      const prev = this.config.sections[this.state.sectionIndex - 1];
      this.state.sectionIndex -= 1;
      this.state.itemIndex = Math.max(0, prev.items.length - 1);
      this.state.sectionIntroPending = false;
      this.persist();
      return true;
    }

    this.state.sectionIntroPending = true;
    this.persist();
    return true;
  }

  restorePositionFromAnswers(): void {
    for (let s = 0; s < this.config.sections.length; s++) {
      const section = this.config.sections[s];
      for (let i = 0; i < section.items.length; i++) {
        const item = section.items[i];
        if (this.state.answers[item.key] === undefined) {
          this.state.sectionIndex = s;
          this.state.itemIndex = i;
          this.state.phase = 'question';
          this.state.sectionIntroPending = i === 0 && !this.sectionHasAnswers(s);
          this.persist();
          return;
        }
      }
    }
    this.state.sectionIndex = this.config.sections.length - 1;
    const last = this.config.sections.at(-1);
    this.state.itemIndex = last ? last.items.length - 1 : 0;
    this.state.phase = 'question';
    this.state.sectionIntroPending = false;
    this.persist();
  }

  /** Migra estados guardados con la fase antigua `section-transition` */
  migrateLegacyPhase(): void {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as PersistedFormState & { phase?: string };
      if (parsed.phase === 'section-transition') {
        parsed.phase = 'question';
        parsed.sectionIntroPending = true;
        if (parsed.sectionIndex < this.config.sections.length - 1) {
          parsed.sectionIndex += 1;
          parsed.itemIndex = 0;
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        this.state = parsed as PersistedFormState;
      }
    } catch {
      /* ignore */
    }
  }

  private sectionHasAnswers(sectionIndex: number): boolean {
    const section = this.config.sections[sectionIndex];
    if (!section) return false;
    return section.items.some((item) => this.state.answers[item.key] !== undefined);
  }
}
