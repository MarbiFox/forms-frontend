export class ProgressBarComponent {
  private fillEl: HTMLElement;

  constructor(private readonly root: HTMLElement) {
    this.root.className = 'progress-bar';
    this.root.innerHTML = '<div class="progress-bar__fill" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>';
    this.fillEl = this.root.querySelector('.progress-bar__fill') as HTMLElement;
  }

  setProgress(current: number, total: number): void {
    const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    this.fillEl.style.width = `${pct}%`;
    this.fillEl.setAttribute('aria-valuenow', String(pct));
    this.fillEl.setAttribute('aria-label', `Progreso de sección: ${pct}%`);
  }
}
