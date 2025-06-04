import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IMode, NewMode } from '../mode.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IMode for edit and NewModeFormGroupInput for create.
 */
type ModeFormGroupInput = IMode | PartialWithRequiredKeyOf<NewMode>;

type ModeFormDefaults = Pick<NewMode, 'id'>;

type ModeFormGroupContent = {
  id: FormControl<IMode['id'] | NewMode['id']>;
  name: FormControl<IMode['name']>;
  handle: FormControl<IMode['handle']>;
  user: FormControl<IMode['user']>;
};

export type ModeFormGroup = FormGroup<ModeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ModeFormService {
  createModeFormGroup(mode: ModeFormGroupInput = { id: null }): ModeFormGroup {
    const modeRawValue = {
      ...this.getFormDefaults(),
      ...mode,
    };
    return new FormGroup<ModeFormGroupContent>({
      id: new FormControl(
        { value: modeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(modeRawValue.name, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      handle: new FormControl(modeRawValue.handle, {
        validators: [Validators.required, Validators.minLength(2)],
      }),
      user: new FormControl(modeRawValue.user),
    });
  }

  getMode(form: ModeFormGroup): IMode | NewMode {
    return form.getRawValue() as IMode | NewMode;
  }

  resetForm(form: ModeFormGroup, mode: ModeFormGroupInput): void {
    const modeRawValue = { ...this.getFormDefaults(), ...mode };
    form.reset(
      {
        ...modeRawValue,
        id: { value: modeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ModeFormDefaults {
    return {
      id: null,
    };
  }
}
