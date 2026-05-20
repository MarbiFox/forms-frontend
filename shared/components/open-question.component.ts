const MAX_CHARS = 500;

export interface OpenQuestionOptions {
  module: string;
  text: string;
  value?: string;
  onChange: (value: string) => void;
}

export class OpenQuestionComponent {
  private textarea: HTMLTextAreaElement | null = null;
  private counterEl: HTMLElement | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly options: OpenQuestionOptions,
  ) {
    this.render();
  }

  destroy(): void {
    this.container.innerHTML = '';
  }

  private render(): void {
    this.container.innerHTML = '';

    const module = document.createElement('span');
    module.className = 'question-module';
    module.textContent = this.options.module;

    const heading = document.createElement('p');
    heading.className = 'question-text';
    heading.setAttribute('role', 'heading');
    heading.setAttribute('aria-level', '2');
    heading.textContent = this.options.text;

    const wrap = document.createElement('div');
    wrap.className = 'open-question';

    this.textarea = document.createElement('textarea');
    this.textarea.placeholder = 'Escribe tu respuesta aquí…';
    this.textarea.maxLength = MAX_CHARS;
    this.textarea.value = this.options.value ?? '';
    this.textarea.addEventListener('input', () => {
      const val = this.textarea?.value ?? '';
      this.options.onChange(val);
      this.updateCounter(val.length);
    });

    this.counterEl = document.createElement('p');
    this.counterEl.className = 'open-question__counter';
    this.updateCounter(this.textarea.value.length);

    wrap.append(this.textarea, this.counterEl);
    this.container.append(module, heading, wrap);
  }

  private updateCounter(len: number): void {
    if (this.counterEl) {
      this.counterEl.textContent = `${len} / ${MAX_CHARS}`;
    }
  }
}
