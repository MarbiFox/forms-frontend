import type { SectionTransition } from '../types';

/** Bloque de introducción de sección (icono, título, contexto) */
export function renderSectionIntro(
  container: HTMLElement,
  data: SectionTransition,
  compact = false,
): void {
  container.innerHTML = '';
  const block = document.createElement('div');
  block.className = compact ? 'section-intro section-intro--compact' : 'section-intro';
  block.innerHTML = `
    <div class="section-intro__icon" aria-hidden="true">${data.icon}</div>
    <h2 class="section-intro__title">${data.title}</h2>
    <p class="section-intro__hint">${data.hint}</p>
  `;
  container.appendChild(block);
}
