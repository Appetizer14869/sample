import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IMode, NewMode } from '../mode.model';

export type PartialUpdateMode = Partial<IMode> & Pick<IMode, 'id'>;

export type EntityResponseType = HttpResponse<IMode>;
export type EntityArrayResponseType = HttpResponse<IMode[]>;

@Injectable({ providedIn: 'root' })
export class ModeService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/modes');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/modes/_search');

  create(mode: NewMode): Observable<EntityResponseType> {
    return this.http.post<IMode>(this.resourceUrl, mode, { observe: 'response' });
  }

  update(mode: IMode): Observable<EntityResponseType> {
    return this.http.put<IMode>(`${this.resourceUrl}/${this.getModeIdentifier(mode)}`, mode, { observe: 'response' });
  }

  partialUpdate(mode: PartialUpdateMode): Observable<EntityResponseType> {
    return this.http.patch<IMode>(`${this.resourceUrl}/${this.getModeIdentifier(mode)}`, mode, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IMode>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IMode[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IMode[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IMode[]>()], asapScheduler)));
  }

  getModeIdentifier(mode: Pick<IMode, 'id'>): number {
    return mode.id;
  }

  compareMode(o1: Pick<IMode, 'id'> | null, o2: Pick<IMode, 'id'> | null): boolean {
    return o1 && o2 ? this.getModeIdentifier(o1) === this.getModeIdentifier(o2) : o1 === o2;
  }

  addModeToCollectionIfMissing<Type extends Pick<IMode, 'id'>>(
    modeCollection: Type[],
    ...modesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const modes: Type[] = modesToCheck.filter(isPresent);
    if (modes.length > 0) {
      const modeCollectionIdentifiers = modeCollection.map(modeItem => this.getModeIdentifier(modeItem));
      const modesToAdd = modes.filter(modeItem => {
        const modeIdentifier = this.getModeIdentifier(modeItem);
        if (modeCollectionIdentifiers.includes(modeIdentifier)) {
          return false;
        }
        modeCollectionIdentifiers.push(modeIdentifier);
        return true;
      });
      return [...modesToAdd, ...modeCollection];
    }
    return modeCollection;
  }
}
