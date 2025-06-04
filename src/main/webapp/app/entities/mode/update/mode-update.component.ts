import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IMode } from '../mode.model';
import { ModeService } from '../service/mode.service';
import { ModeFormGroup, ModeFormService } from './mode-form.service';

@Component({
  selector: 'jhi-mode-update',
  templateUrl: './mode-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ModeUpdateComponent implements OnInit {
  isSaving = false;
  mode: IMode | null = null;

  usersSharedCollection: IUser[] = [];

  protected modeService = inject(ModeService);
  protected modeFormService = inject(ModeFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ModeFormGroup = this.modeFormService.createModeFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ mode }) => {
      this.mode = mode;
      if (mode) {
        this.updateForm(mode);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const mode = this.modeFormService.getMode(this.editForm);
    if (mode.id !== null) {
      this.subscribeToSaveResponse(this.modeService.update(mode));
    } else {
      this.subscribeToSaveResponse(this.modeService.create(mode));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMode>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(mode: IMode): void {
    this.mode = mode;
    this.modeFormService.resetForm(this.editForm, mode);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, mode.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.mode?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
