import { LIKERT_ANCHORS, type LikertInstrument } from '../types';

export interface LikertScaleOptions {
  text: string;
  instrument: LikertInstrument;
  selected?: number;
  onSelect: (value: number) => void;
}

const AUTO_ADVANCE_MS = 400;

export class LikertScaleComponent {
  private selected: number | undefined;
  private advanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly options: LikertScaleOptions,
  ) {
    this.selected = options.selected;
    this.render();
  }

  destroy(): void {
    if (this.advanceTimer) clearTimeout(this.advanceTimer);
    this.container.innerHTML = '';
  }

  private render(): void {
    const anchors = LIKERT_ANCHORS[this.options.instrument];
    this.container.innerHTML = '';

    const heading = document.createElement('p');
    heading.className = 'question-text';
    heading.setAttribute('role', 'heading');
    heading.setAttribute('aria-level', '2');
    heading.textContent = this.options.text;
    this.container.appendChild(heading);

    const block = document.createElement('div');
    block.className = 'scale-block';

    const anchorsRow = document.createElement('div');
    anchorsRow.className = 'scale-anchors-row';

    const anchorLow = document.createElement('span');
    anchorLow.className = 'scale-anchor scale-anchor--low';
    anchorLow.textContent = anchors.low;

    const anchorHigh = document.createElement('span');
    anchorHigh.className = 'scale-anchor scale-anchor--high';
    anchorHigh.textContent = anchors.high;

    anchorsRow.append(anchorLow, anchorHigh);

    const buttons = document.createElement('div');
    buttons.className = 'scale-buttons';
    buttons.setAttribute('role', 'group');
    buttons.setAttribute('aria-label', 'Escala del 1 al 7');

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

    block.append(anchorsRow, buttons);
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
