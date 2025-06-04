import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { ModeDetailComponent } from './mode-detail.component';

describe('Mode Management Detail Component', () => {
  let comp: ModeDetailComponent;
  let fixture: ComponentFixture<ModeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./mode-detail.component').then(m => m.ModeDetailComponent),
              resolve: { mode: () => of({ id: 12662 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(ModeDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load mode on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', ModeDetailComponent);

      // THEN
      expect(instance.mode()).toEqual(expect.objectContaining({ id: 12662 }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
