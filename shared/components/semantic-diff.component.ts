export interface SemanticDiffOptions {
  negative: string;
  positive: string;
  selected?: number;
  onSelect: (value: number) => void;
}

const AUTO_ADVANCE_MS = 400;

export class SemanticDiffComponent {
  private selected: number | undefined;
  private advanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly options: SemanticDiffOptions,
  ) {
    this.selected = options.selected;
    this.render();
  }

  destroy(): void {
    if (this.advanceTimer) clearTimeout(this.advanceTimer);
    this.container.innerHTML = '';
  }

  private render(): void {
    this.container.innerHTML = '';

    const block = document.createElement('div');
    block.className = 'scale-block';

    const labels = document.createElement('div');
    labels.className = 'scale-anchors-row semantic-labels';
    labels.innerHTML = `<span class="scale-anchor scale-anchor--low">${this.options.negative}</span><span class="scale-anchor scale-anchor--high">${this.options.positive}</span>`;
    block.appendChild(labels);

    const buttons = document.createElement('div');
    buttons.className = 'scale-buttons';
    buttons.setAttribute('role', 'group');
    buttons.setAttribute('aria-label', 'Diferencial semántico del 1 al 7');

    for (let v = 1; v <= 7; v++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scale-btn';
      btn.textContent = String(v);
      btn.setAttribute('aria-label', `${v} de 7`);
      if (this.selected === v) btn.classList.add('scale-btn--selected');
      btn.addEventListener('click', () => this.handleSelect(v, buttons));
      buttons.appendChild(btn);
    }

    block.appendChild(buttons);
    this.container.appendChild(block);
  }

  private handleSelect(value: number, buttonsEl: HTMLElement): void {
    if (this.advanceTimer) clearTimeout(this.advanceTimer);
    this.selected = value;
    buttonsEl.querySelectorAll('.scale-btn').forEach((btn, idx) => {
      btn.classList.toggle('scale-btn--selected', idx + 1 === value);
    });
    this.advanceTimer = setTimeout(() => this.options.onSelect(value), AUTO_ADVANCE_MS);
  }
}
