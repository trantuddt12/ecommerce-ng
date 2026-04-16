import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-feature-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="feature-shell">
      <header class="hero">
        <p class="eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </header>

      <div class="cards">
        @for (item of highlights; track item.label) {
          <article class="card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    .feature-shell {
      display: grid;
      gap: 1rem;
    }

    .hero,
    .card {
      border-radius: 1.25rem;
      background: #fff;
      border: 1px solid rgba(148, 163, 184, 0.18);
      padding: 1.5rem;
    }

    .hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #fff;
    }

    .eyebrow,
    span {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.75rem;
      color: #64748b;
    }

    .hero .eyebrow {
      color: #bfdbfe;
    }

    h2 {
      margin: 0.5rem 0;
      font-size: 2rem;
    }

    .hero p:last-child {
      margin-bottom: 0;
      color: rgba(255, 255, 255, 0.82);
      max-width: 48rem;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    strong {
      display: block;
      margin-top: 0.5rem;
      font-size: 1.1rem;
      color: #0f172a;
    }

    @media (max-width: 960px) {
      .cards {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class FeatureShellComponent {
  @Input({ required: true }) eyebrow = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input({ required: true }) highlights: Array<{ label: string; value: string }> = [];
}
