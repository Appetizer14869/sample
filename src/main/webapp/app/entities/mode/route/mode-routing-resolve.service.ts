import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IMode } from '../mode.model';
import { ModeService } from '../service/mode.service';

const modeResolve = (route: ActivatedRouteSnapshot): Observable<null | IMode> => {
  const id = route.params.id;
  if (id) {
    return inject(ModeService)
      .find(id)
      .pipe(
        mergeMap((mode: HttpResponse<IMode>) => {
          if (mode.body) {
            return of(mode.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default modeResolve;
