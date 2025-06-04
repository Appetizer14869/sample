import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../mode.test-samples';

import { ModeFormService } from './mode-form.service';

describe('Mode Form Service', () => {
  let service: ModeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModeFormService);
  });

  describe('Service methods', () => {
    describe('createModeFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createModeFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            handle: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });

      it('passing IMode should create a new form with FormGroup', () => {
        const formGroup = service.createModeFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            handle: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });
    });

    describe('getMode', () => {
      it('should return NewMode for default Mode initial value', () => {
        const formGroup = service.createModeFormGroup(sampleWithNewData);

        const mode = service.getMode(formGroup) as any;

        expect(mode).toMatchObject(sampleWithNewData);
      });

      it('should return NewMode for empty Mode initial value', () => {
        const formGroup = service.createModeFormGroup();

        const mode = service.getMode(formGroup) as any;

        expect(mode).toMatchObject({});
      });

      it('should return IMode', () => {
        const formGroup = service.createModeFormGroup(sampleWithRequiredData);

        const mode = service.getMode(formGroup) as any;

        expect(mode).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IMode should not enable id FormControl', () => {
        const formGroup = service.createModeFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewMode should disable id FormControl', () => {
        const formGroup = service.createModeFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
