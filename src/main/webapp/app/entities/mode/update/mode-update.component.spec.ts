import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ModeService } from '../service/mode.service';
import { IMode } from '../mode.model';
import { ModeFormService } from './mode-form.service';

import { ModeUpdateComponent } from './mode-update.component';

describe('Mode Management Update Component', () => {
  let comp: ModeUpdateComponent;
  let fixture: ComponentFixture<ModeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let modeFormService: ModeFormService;
  let modeService: ModeService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModeUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(ModeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ModeUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    modeFormService = TestBed.inject(ModeFormService);
    modeService = TestBed.inject(ModeService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call User query and add missing value', () => {
      const mode: IMode = { id: 31905 };
      const user: IUser = { id: 3944 };
      mode.user = user;

      const userCollection: IUser[] = [{ id: 3944 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ mode });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const mode: IMode = { id: 31905 };
      const user: IUser = { id: 3944 };
      mode.user = user;

      activatedRoute.data = of({ mode });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContainEqual(user);
      expect(comp.mode).toEqual(mode);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMode>>();
      const mode = { id: 12662 };
      jest.spyOn(modeFormService, 'getMode').mockReturnValue(mode);
      jest.spyOn(modeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ mode });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: mode }));
      saveSubject.complete();

      // THEN
      expect(modeFormService.getMode).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(modeService.update).toHaveBeenCalledWith(expect.objectContaining(mode));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMode>>();
      const mode = { id: 12662 };
      jest.spyOn(modeFormService, 'getMode').mockReturnValue({ id: null });
      jest.spyOn(modeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ mode: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: mode }));
      saveSubject.complete();

      // THEN
      expect(modeFormService.getMode).toHaveBeenCalled();
      expect(modeService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMode>>();
      const mode = { id: 12662 };
      jest.spyOn(modeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ mode });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(modeService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUser', () => {
      it('should forward to userService', () => {
        const entity = { id: 3944 };
        const entity2 = { id: 6275 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
