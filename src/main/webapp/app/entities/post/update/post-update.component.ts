import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IMode } from 'app/entities/mode/mode.model';
import { ModeService } from 'app/entities/mode/service/mode.service';
import { ITag } from 'app/entities/tag/tag.model';
import { TagService } from 'app/entities/tag/service/tag.service';
import { PostService } from '../service/post.service';
import { IPost } from '../post.model';
import { PostFormGroup, PostFormService } from './post-form.service';

@Component({
  selector: 'jhi-post-update',
  templateUrl: './post-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PostUpdateComponent implements OnInit {
  isSaving = false;
  post: IPost | null = null;

  modesSharedCollection: IMode[] = [];
  tagsSharedCollection: ITag[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected postService = inject(PostService);
  protected postFormService = inject(PostFormService);
  protected modeService = inject(ModeService);
  protected tagService = inject(TagService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PostFormGroup = this.postFormService.createPostFormGroup();

  compareMode = (o1: IMode | null, o2: IMode | null): boolean => this.modeService.compareMode(o1, o2);

  compareTag = (o1: ITag | null, o2: ITag | null): boolean => this.tagService.compareTag(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ post }) => {
      this.post = post;
      if (post) {
        this.updateForm(post);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('sampleApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const post = this.postFormService.getPost(this.editForm);
    if (post.id !== null) {
      this.subscribeToSaveResponse(this.postService.update(post));
    } else {
      this.subscribeToSaveResponse(this.postService.create(post));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPost>>): void {
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

  protected updateForm(post: IPost): void {
    this.post = post;
    this.postFormService.resetForm(this.editForm, post);

    this.modesSharedCollection = this.modeService.addModeToCollectionIfMissing<IMode>(this.modesSharedCollection, post.mode);
    this.tagsSharedCollection = this.tagService.addTagToCollectionIfMissing<ITag>(this.tagsSharedCollection, ...(post.tags ?? []));
  }

  protected loadRelationshipsOptions(): void {
    this.modeService
      .query()
      .pipe(map((res: HttpResponse<IMode[]>) => res.body ?? []))
      .pipe(map((modes: IMode[]) => this.modeService.addModeToCollectionIfMissing<IMode>(modes, this.post?.mode)))
      .subscribe((modes: IMode[]) => (this.modesSharedCollection = modes));

    this.tagService
      .query()
      .pipe(map((res: HttpResponse<ITag[]>) => res.body ?? []))
      .pipe(map((tags: ITag[]) => this.tagService.addTagToCollectionIfMissing<ITag>(tags, ...(this.post?.tags ?? []))))
      .subscribe((tags: ITag[]) => (this.tagsSharedCollection = tags));
  }
}
