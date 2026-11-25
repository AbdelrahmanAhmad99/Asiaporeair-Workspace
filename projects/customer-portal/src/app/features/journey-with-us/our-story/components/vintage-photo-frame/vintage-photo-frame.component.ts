// ============================================================================
// vintage-photo-frame.component.ts
// Asiaporeair | Dumb Component — Vintage Photo Frame
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IVintagePhoto } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-vintage-photo-frame',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './vintage-photo-frame.component.html',
  styleUrls: ['./vintage-photo-frame.component.scss']
})
export class VintagePhotoFrameComponent {
  @Input({ required: true }) photo!: IVintagePhoto;
  @Input() animDelay: number = 0;
}