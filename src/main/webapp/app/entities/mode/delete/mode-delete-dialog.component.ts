import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IMode } from '../mode.model';
import { ModeService } from '../service/mode.service';

@Component({
  templateUrl: './mode-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ModeDeleteDialogComponent {
  mode?: IMode;

  protected modeService = inject(ModeService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.modeService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
