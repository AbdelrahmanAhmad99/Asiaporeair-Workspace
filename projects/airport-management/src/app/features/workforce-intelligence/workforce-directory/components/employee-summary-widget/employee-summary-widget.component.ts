

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEmployeeSummaryDto } from '../../store/employee.model';

@Component({
  selector: 'aoms-employee-summary-widget',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-summary-widget.component.html',
  styleUrl: './employee-summary-widget.component.scss',
})
export class EmployeeSummaryWidgetComponent {
  readonly employee = input.required<IEmployeeSummaryDto>();

  protected readonly tenure = computed(() => {
    const hired = this.employee().hireDate;
    if (!hired) return '—';
    const ms = Date.now() - new Date(hired).getTime();
    const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor((ms % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''} ${months > 0 ? ', ' + months + ' mo' : ''}`;
  });

  protected readonly hireDateFormatted = computed(() => {
    const d = this.employee().hireDate;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' });
  });
}