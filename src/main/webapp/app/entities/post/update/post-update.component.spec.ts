import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IMode } from 'app/entities/mode/mode.model';
import { ModeService } from 'app/entities/mode/service/mode.service';
import { ITag } from 'app/entities/tag/tag.model';
import { TagService } from 'app/entities/tag/service/tag.service';
import { IPost } from '../post.model';
import { PostService } from '../service/post.service';
import { PostFormService } from './post-form.service';

import { PostUpdateComponent } from './post-update.component';

describe('Post Management Update Component', () => {
  let comp: PostUpdateComponent;
  let fixture: ComponentFixture<PostUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let postFormService: PostFormService;
  let postService: PostService;
  let modeService: ModeService;
  let tagService: TagService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PostUpdateComponent],
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
      .overrideTemplate(PostUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PostUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    postFormService = TestBed.inject(PostFormService);
    postService = TestBed.inject(PostService);
    modeService = TestBed.inject(ModeService);
    tagService = TestBed.inject(TagService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Mode query and add missing value', () => {
      const post: IPost = { id: 2872 };
      const mode: IMode = { id: 12662 };
      post.mode = mode;

      const modeCollection: IMode[] = [{ id: 12662 }];
      jest.spyOn(modeService, 'query').mockReturnValue(of(new HttpResponse({ body: modeCollection })));
      const additionalModes = [mode];
      const expectedCollection: IMode[] = [...additionalModes, ...modeCollection];
      jest.spyOn(modeService, 'addModeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ post });
      comp.ngOnInit();

      expect(modeService.query).toHaveBeenCalled();
      expect(modeService.addModeToCollectionIfMissing).toHaveBeenCalledWith(
        modeCollection,
        ...additionalModes.map(expect.objectContaining),
      );
      expect(comp.modesSharedCollection).toEqual(expectedCollection);
    });

    it('should call Tag query and add missing value', () => {
      const post: IPost = { id: 2872 };
      const tags: ITag[] = [{ id: 19931 }];
      post.tags = tags;

      const tagCollection: ITag[] = [{ id: 19931 }];
      jest.spyOn(tagService, 'query').mockReturnValue(of(new HttpResponse({ body: tagCollection })));
      const additionalTags = [...tags];
      const expectedCollection: ITag[] = [...additionalTags, ...tagCollection];
      jest.spyOn(tagService, 'addTagToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ post });
      comp.ngOnInit();

      expect(tagService.query).toHaveBeenCalled();
      expect(tagService.addTagToCollectionIfMissing).toHaveBeenCalledWith(tagCollection, ...additionalTags.map(expect.objectContaining));
      expect(comp.tagsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const post: IPost = { id: 2872 };
      const mode: IMode = { id: 12662 };
      post.mode = mode;
      const tags: ITag = { id: 19931 };
      post.tags = [tags];

      activatedRoute.data = of({ post });
      comp.ngOnInit();

      expect(comp.modesSharedCollection).toContainEqual(mode);
      expect(comp.tagsSharedCollection).toContainEqual(tags);
      expect(comp.post).toEqual(post);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPost>>();
      const post = { id: 21634 };
      jest.spyOn(postFormService, 'getPost').mockReturnValue(post);
      jest.spyOn(postService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ post });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: post }));
      saveSubject.complete();

      // THEN
      expect(postFormService.getPost).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(postService.update).toHaveBeenCalledWith(expect.objectContaining(post));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPost>>();
      const post = { id: 21634 };
      jest.spyOn(postFormService, 'getPost').mockReturnValue({ id: null });
      jest.spyOn(postService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ post: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: post }));
      saveSubject.complete();

      // THEN
      expect(postFormService.getPost).toHaveBeenCalled();
      expect(postService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPost>>();
      const post = { id: 21634 };
      jest.spyOn(postService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ post });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(postService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareMode', () => {
      it('should forward to modeService', () => {
        const entity = { id: 12662 };
        const entity2 = { id: 31905 };
        jest.spyOn(modeService, 'compareMode');
        comp.compareMode(entity, entity2);
        expect(modeService.compareMode).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareTag', () => {
      it('should forward to tagService', () => {
        const entity = { id: 19931 };
        const entity2 = { id: 16779 };
        jest.spyOn(tagService, 'compareTag');
        comp.compareTag(entity, entity2);
        expect(tagService.compareTag).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
