// lookup-helper-card.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lookup-helper-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './lookup-helper-card.component.html',
  styleUrls: ['./lookup-helper-card.component.scss']
})
export class LookupHelperCardComponent { }