

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface IWizardStep {
  index: number;
  label: string;
  sublabel: string;
}

const STEPS: IWizardStep[] = [
  { index: 0, label: 'Role Selection', sublabel: 'Professional identity' },
  { index: 1, label: 'Data Entry', sublabel: 'Credentials & details' },
  { index: 2, label: 'Confirmation', sublabel: 'Account provisioned' },
];

@Component({
  selector: 'aoms-onboarding-step-indicator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './onboarding-step-indicator.component.html',
  styleUrl: './onboarding-step-indicator.component.scss',
})
export class OnboardingStepIndicatorComponent {
  readonly currentStep = input.required<number>();
  readonly selectedRole = input<string | null>(null);

  protected readonly steps = STEPS;

  protected isCompleted(step: IWizardStep): boolean { return this.currentStep() > step.index; }
  protected isActive(step: IWizardStep): boolean { return this.currentStep() === step.index; }
  protected isPending(step: IWizardStep): boolean { return this.currentStep() < step.index; }
}