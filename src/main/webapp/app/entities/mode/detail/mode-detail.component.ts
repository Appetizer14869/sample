import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IMode } from '../mode.model';

@Component({
  selector: 'jhi-mode-detail',
  templateUrl: './mode-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class ModeDetailComponent {
  mode = input<IMode | null>(null);

  previousState(): void {
    window.history.back();
  }
}
