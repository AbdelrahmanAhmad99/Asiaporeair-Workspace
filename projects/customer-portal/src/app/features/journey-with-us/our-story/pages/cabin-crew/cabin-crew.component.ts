// ============================================================================
// cabin-crew.component.ts
// Asiaporeair | Smart Page — Our Cabin Crew
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CrewSpotlightCardComponent } from '../../components/crew-spotlight-card/crew-spotlight-card.component';
import { CREW_SPOTLIGHTS, ICrewSpotlight } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-cabin-crew',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, CrewSpotlightCardComponent],
  templateUrl: './cabin-crew.component.html',
  styleUrls: ['./cabin-crew.component.scss']
})
export class CabinCrewComponent {

  readonly crewSpotlights = signal<ICrewSpotlight[]>(CREW_SPOTLIGHTS);

  readonly crewValues = [
    {
      id: 'warmth',
      title: 'Genuine Warmth',
      desc: 'Service that comes from the heart — not a script. Every passenger is greeted as a welcome guest.',
      icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
    },
    {
      id: 'excellence',
      title: 'Pursuit of Excellence',
      desc: 'We never settle. From how we fold a napkin to how we read a passenger\'s mood — details matter.',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
    },
    {
      id: 'safety',
      title: 'Safety as Foundation',
      desc: 'Trained to the highest international standards, our crew place safety above everything — without compromise.',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
    },
    {
      id: 'connection',
      title: 'Cultural Intelligence',
      desc: 'Our crew represent over 40 nationalities. That diversity is not incidental — it is a source of strength.',
      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
    }
  ];

  readonly trainingFacts = [
    'Minimum 4 weeks intensive residential training programme',
    'Formal instruction in fine dining service',
    'Advanced safety and emergency response certification',
    'Cultural sensitivity and luxury hospitality modules',
    'Annual recurrent training and service excellence refreshers'
  ];
}