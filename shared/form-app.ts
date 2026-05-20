import { OWL_HAPPY_SVG, OWL_SVG } from './assets/owl.svg';
import { LikertScaleComponent } from './components/likert-scale.component';
import { OpenQuestionComponent } from './components/open-question.component';
import { ProgressBarComponent } from './components/progress-bar.component';
import { renderSectionIntro } from './components/section-intro.component';
import { SemanticDiffComponent } from './components/semantic-diff.component';
import { ApiService } from './services/api.service';
import { FormStateService } from './services/form-state.service';
import type { FormConfig, FormItem, FormPhase } from './types';

type ActiveComponent = LikertScaleComponent | SemanticDiffComponent | OpenQuestionComponent | null;

export interface FormAppOptions {
  config: FormConfig;
  apiBaseUrl: string;
  buildAnswers: (state: FormStateService) => Record<string, unknown>;
}

export class FormApp {
  private readonly state: FormStateService;
  private readonly api: ApiService;
  private activeComponent: ActiveComponent = null;
  private entryPasswordResult = '';
  private showingComplete = false;

  private readonly headerEl: HTMLElement;
  private readonly pillsEl: HTMLElement;
  private readonly progressRoot: HTMLElement;
  private readonly progressBar: ProgressBarComponent;
  private readonly mainEl: HTMLElement;
  private readonly footerEl: HTMLElement;
  private readonly counterEl: HTMLElement;

  constructor(
    mount: HTMLElement,
    private readonly options: FormAppOptions,
  ) {
    this.state = new FormStateService(options.config);
    this.api = new ApiService(options.apiBaseUrl);

    mount.id = 'app';
    mount.innerHTML = `
      <header class="app-header">
        <div class="app-header__brand">${OWL_SVG}<div><div>UX Training App</div><div class="app-header__label">${options.config.formLabel}</div></div></div>
        <div class="app-header__counter" data-counter></div>
      </header>
      <div class="app-subheader" data-subheader>
        <nav class="section-pills" data-pills aria-label="Secciones del formulario"></nav>
      </div>
      <div data-progress></div>
      <main class="app-main" data-main></main>
      <footer class="app-footer" data-footer></footer>
    `;

    this.headerEl = mount.querySelector('.app-header') as HTMLElement;
    this.pillsEl = mount.querySelector('[data-pills]') as HTMLElement;
    this.progressRoot = mount.querySelector('[data-progress]') as HTMLElement;
    this.progressBar = new ProgressBarComponent(this.progressRoot);
    this.mainEl = mount.querySelector('[data-main]') as HTMLElement;
    this.footerEl = mount.querySelector('[data-footer]') as HTMLElement;
    this.counterEl = mount.querySelector('[data-counter]') as HTMLElement;

    this.renderPills();
    this.resumeIfNeeded();
    this.render();
  }

  private getDisplayPhase(): FormPhase {
    return this.showingComplete ? 'complete' : this.state.getPhase();
  }

  private resumeIfNeeded(): void {
    const phase = this.state.getPhase();
    const hasAnswers = Object.keys(this.state.getAllAnswers()).length > 0;
    const { intro } = this.options.config;

    if (phase === 'question') {
      this.state.restorePositionFromAnswers();
      return;
    }

    if (phase === 'intro' && hasAnswers) {
      if (intro.requiresConsent && this.state.hasConsent()) {
        this.state.startForm();
        this.state.restorePositionFromAnswers();
      } else if (intro.requiresPassword && this.state.getClosingPassword().length >= 6) {
        this.state.startForm();
        this.state.restorePositionFromAnswers();
      }
    }
  }

  private renderPills(): void {
    this.pillsEl.innerHTML = '';
    this.options.config.sections.forEach((section, idx) => {
      const pill = document.createElement('span');
      pill.className = 'section-pill';
      pill.title = section.name;
      pill.setAttribute('aria-label', section.name);
      if (idx === this.state.getSectionIndex()) pill.classList.add('section-pill--active');
      this.pillsEl.appendChild(pill);
    });
  }

  private render(): void {
    this.destroyActive();
    this.renderPills();
    this.updateCounter();

    const phase = this.getDisplayPhase();
    const inForm = phase === 'question';

    this.headerEl.style.display =
      phase === 'intro' || phase === 'complete' || phase === 'submitting' ? 'none' : 'flex';
    this.pillsEl.closest('.app-subheader')!.style.display = inForm ? 'flex' : 'none';
    this.progressRoot.style.display = inForm && !this.state.isSectionIntroPending() ? 'block' : 'none';

    switch (phase) {
      case 'intro':
        this.renderIntro();
        break;
      case 'question':
        if (this.state.isSectionIntroPending()) {
          this.renderSectionIntroScreen();
        } else {
          this.renderQuestion();
        }
        break;
      case 'submitting':
        this.renderSubmitting();
        break;
      case 'complete':
        this.renderComplete();
        break;
    }
  }

  private getClosedItemNumber(key: string): number {
    let n = 0;
    for (const section of this.options.config.sections) {
      for (const item of section.items) {
        if (item.type === 'open') continue;
        n += 1;
        if (item.key === key) return n;
      }
    }
    return n;
  }

  private updateCounter(): void {
    const item = this.state.getCurrentItem();
    const cfg = this.options.config;

    if (this.state.getPhase() !== 'question' || this.state.isSectionIntroPending()) {
      this.counterEl.textContent = '';
      return;
    }

    if (item?.type === 'open') {
      const openIdx =
        this.options.config.sections
          .flatMap((s) => s.items)
          .filter((i) => i.type === 'open')
          .findIndex((i) => i.key === item.key) + 1;
      this.counterEl.textContent = `Pregunta abierta ${openIdx} de ${cfg.openItemCount}`;
      return;
    }

    if (item && item.type !== 'open') {
      const display = this.getClosedItemNumber(item.key);
      this.counterEl.textContent = `Pregunta ${display} de ${cfg.closedItemCount}`;
      return;
    }

    this.counterEl.textContent = '';
  }

  private renderIntro(): void {
    const { intro } = this.options.config;
    const screen = document.createElement('div');
    screen.className = 'screen screen--intro';

    screen.innerHTML = `
      <div class="screen__owl" aria-hidden="true">${OWL_SVG}</div>
      <h1 class="screen__title">${intro.title}</h1>
      <p class="screen__text">${intro.text}</p>
    `;

    if (intro.requiresConsent) {
      const row = document.createElement('label');
      row.className = 'consent-row';
      row.innerHTML = `
        <input type="checkbox" data-consent />
        <span>Acepto participar de forma voluntaria y anónima</span>
      `;
      screen.appendChild(row);

      const btn = this.createPrimaryButton('Comenzar →', true);
      const checkbox = row.querySelector('[data-consent]') as HTMLInputElement;
      checkbox.checked = this.state.hasConsent();
      btn.disabled = !checkbox.checked;
      checkbox.addEventListener('change', () => {
        this.state.setConsent(checkbox.checked);
        btn.disabled = !checkbox.checked;
      });
      btn.addEventListener('click', () => {
        this.state.startForm();
        this.render();
      });
      this.footerEl.innerHTML = '';
      this.footerEl.appendChild(btn);
    } else if (intro.requiresPassword) {
      const field = document.createElement('div');
      field.className = 'password-field';
      field.innerHTML = `<input type="text" maxlength="32" autocomplete="off" placeholder="Contraseña" aria-label="Contraseña de cierre" data-password />`;
      screen.appendChild(field);

      const error = document.createElement('p');
      error.className = 'field-error';
      error.hidden = true;
      screen.appendChild(error);

      const input = field.querySelector('[data-password]') as HTMLInputElement;
      input.value = this.state.getClosingPassword();

      const btn = this.createPrimaryButton('Comenzar →', false);
      btn.addEventListener('click', () => {
        const pwd = input.value.trim();
        if (pwd.length < 6) {
          field.classList.add('password-field--error', 'password-field--shake');
          error.hidden = false;
          error.textContent = 'Ingresa la contraseña de cierre (mínimo 6 caracteres).';
          setTimeout(() => field.classList.remove('password-field--shake'), 500);
          return;
        }
        field.classList.remove('password-field--error');
        error.hidden = true;
        this.state.setClosingPassword(pwd);
        this.state.startForm();
        this.state.restorePositionFromAnswers();
        this.render();
      });

      this.footerEl.innerHTML = '';
      this.footerEl.appendChild(btn);
    }

    this.mainEl.innerHTML = '';
    this.mainEl.appendChild(screen);
  }

  private renderSectionIntroScreen(): void {
    const section = this.state.getCurrentSection();
    if (!section) return;

    this.mainEl.classList.remove('app-main--with-intro');
    this.mainEl.innerHTML = '';
    const view = document.createElement('div');
    view.className = 'question-view question-view--enter';
    const introHost = document.createElement('div');
    view.appendChild(introHost);
    renderSectionIntro(introHost, section.transition, false);
    this.mainEl.appendChild(view);

    const continueBtn = this.createPrimaryButton('Continuar →', false);
    continueBtn.addEventListener('click', () => {
      this.state.dismissSectionIntro();
      this.render();
    });
    this.setFooterWithBack(continueBtn);
  }

  private renderQuestion(): void {
    const section = this.state.getCurrentSection();
    const item = this.state.getCurrentItem();
    if (!section || !item) {
      this.submitForm();
      return;
    }

    const progress = this.state.getSectionProgress();
    this.progressBar.setProgress(progress.current, progress.total);

    const view = document.createElement('div');
    view.className = 'question-view question-view--enter';

    const introHost = document.createElement('div');
    introHost.className = 'question-view__intro';
    renderSectionIntro(introHost, section.transition, true);
    view.appendChild(introHost);

    const host = document.createElement('div');
    host.className = 'question-view__body';
    view.appendChild(host);

    this.mainEl.classList.remove('app-main--with-intro');
    this.mainEl.classList.add('app-main--with-intro');

    this.mainEl.innerHTML = '';
    this.mainEl.appendChild(view);
    this.mountItem(host, item);
    this.renderFooterForItem(item);
  }

  private mountItem(host: HTMLElement, item: FormItem): void {
    const existing = this.state.getAnswer(item.key);

    if (item.type === 'semantic') {
      this.activeComponent = new SemanticDiffComponent(host, {
        negative: item.negative,
        positive: item.positive,
        selected: typeof existing === 'number' ? existing : undefined,
        onSelect: (v) => this.handleScaleAnswer(item.key, v, false),
      });
      return;
    }

    if (item.type === 'likert') {
      this.activeComponent = new LikertScaleComponent(host, {
        text: item.text,
        instrument: item.instrument,
        selected: typeof existing === 'number' ? existing : undefined,
        onSelect: (v) => this.handleScaleAnswer(item.key, v, !!item.reversed),
      });
      return;
    }

    this.activeComponent = new OpenQuestionComponent(host, {
      module: item.module,
      text: item.text,
      value: typeof existing === 'string' ? existing : '',
      onChange: (val) => this.state.setAnswer(item.key, val),
    });
  }

  private renderFooterForItem(item: FormItem): void {
    if (item.type === 'open') {
      const isLast =
        this.state.isLastSection() &&
        this.state.getItemIndex() === (this.state.getCurrentSection()?.items.length ?? 1) - 1;
      const btn = this.createSecondaryButton(isLast ? 'Enviar respuestas →' : 'Siguiente →');
      btn.addEventListener('click', () => this.goNext());
      this.setFooterWithBack(btn);
      return;
    }

    const hint = document.createElement('p');
    hint.className = 'footer-hint';
    hint.textContent = 'Selecciona una opción para continuar automáticamente';
    this.setFooterWithBack(hint);
  }

  private setFooterWithBack(mainContent: HTMLElement): void {
    this.footerEl.innerHTML = '';
    const actions = document.createElement('div');
    actions.className = 'footer-actions';

    const backBtn = this.createBackButton();
    actions.appendChild(backBtn);

    const mainWrap = document.createElement('div');
    mainWrap.className = 'footer-actions__main';
    mainWrap.appendChild(mainContent);
    actions.appendChild(mainWrap);

    this.footerEl.appendChild(actions);
  }

  private createBackButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-back';
    btn.textContent = '← Atrás';
    btn.setAttribute('aria-label', 'Volver a la pregunta anterior');
    btn.disabled = !this.state.canGoBack();
    btn.addEventListener('click', () => this.goBack());
    return btn;
  }

  private handleScaleAnswer(key: string, value: number, invert: boolean): void {
    this.state.setAnswer(key, value, { invert });
    this.animateAndAdvance();
  }

  private animateAndAdvance(): void {
    const view = this.mainEl.querySelector('.question-view');
    if (view) {
      view.classList.remove('question-view--enter');
      view.classList.add('question-view--exit-left');
    }
    setTimeout(() => this.goNext(), 300);
  }

  private goNext(): void {
    const hasMore = this.state.advanceToNextItem();
    if (!hasMore) {
      this.submitForm();
      return;
    }
    this.render();
  }

  private goBack(): void {
    const view = this.mainEl.querySelector('.question-view');
    if (view) {
      view.classList.remove('question-view--enter');
      view.classList.add('question-view--exit-right');
    }
    setTimeout(() => {
      if (this.state.goToPreviousItem()) {
        this.render();
      }
    }, 280);
  }

  private renderSubmitting(): void {
    this.mainEl.classList.remove('app-main--with-intro');
    this.mainEl.innerHTML = `
      <div class="screen screen--submitting">
        <div class="submit-spinner" role="status" aria-live="polite" aria-label="Enviando respuestas"></div>
        <p class="screen__text">Enviando respuestas…</p>
      </div>
    `;
    this.footerEl.innerHTML = '';
  }

  private async submitForm(): Promise<void> {
    this.state.setPhase('submitting');
    this.render();

    const answers = this.options.buildAnswers(this.state);
    const timestampEnd = this.state.getTimestampEnd();

    try {
      if (this.options.config.formId === 'pretest') {
        const result = await this.api.submitPreTest({
          answers: {
            ...answers,
            timestamp_start: this.state.getTimestampStart(),
            timestamp_end: timestampEnd,
          },
        });
        this.entryPasswordResult = result.entry_password;
        this.state.clear();
        this.showingComplete = true;
      } else {
        await this.api.submitPostTest({
          closing_password: this.state.getClosingPassword(),
          answers: {
            ...answers,
            timestamp_start: this.state.getTimestampStart(),
            timestamp_end: timestampEnd,
          },
        });
        this.state.clear();
        this.showingComplete = true;
      }
      this.render();
    } catch (err) {
      this.state.setPhase('question');
      this.state.restorePositionFromAnswers();
      this.render();
      alert(err instanceof Error ? err.message : 'Error al enviar.');
    }
  }

  private renderComplete(): void {
    const { complete } = this.options.config;
    const screen = document.createElement('div');
    screen.className = 'screen screen--close';

    if (this.options.config.formId === 'pretest') {
      const pwd = this.entryPasswordResult;
      screen.innerHTML = `
        ${OWL_HAPPY_SVG}
        <h1 class="screen__title">${complete.title}</h1>
        <p class="access-password" data-password-display>${pwd}</p>
        <p class="hint-text">Anótala también en tu documento guía</p>
      `;
      const copyBtn = this.createSecondaryButton('Copiar contraseña');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pwd);
          copyBtn.textContent = '✓ Copiada';
        } catch {
          copyBtn.textContent = 'No se pudo copiar';
        }
      });
      this.footerEl.innerHTML = '';
      this.footerEl.appendChild(copyBtn);
    } else {
      screen.innerHTML = `
        ${OWL_HAPPY_SVG}
        <h1 class="screen__title">${complete.title}</h1>
        ${complete.subtitle ? `<p class="screen__text">${complete.subtitle}</p>` : ''}
      `;
      this.footerEl.innerHTML = '';
    }

    this.mainEl.innerHTML = '';
    this.mainEl.appendChild(screen);
    this.headerEl.style.display = 'none';
    this.pillsEl.closest('.app-subheader')!.style.display = 'none';
    this.progressRoot.style.display = 'none';
  }

  private createPrimaryButton(label: string, disabled: boolean): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-primary';
    btn.textContent = label;
    btn.disabled = disabled;
    return btn;
  }

  private createSecondaryButton(label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-secondary';
    btn.textContent = label;
    return btn;
  }

  private destroyActive(): void {
    if (this.activeComponent) {
      this.activeComponent.destroy();
    }
    this.activeComponent = null;
  }
}

export function bootstrapFormApp(mount: HTMLElement, options: FormAppOptions): FormApp {
  return new FormApp(mount, options);
}
