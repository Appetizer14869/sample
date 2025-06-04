import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IMode } from '../mode.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../mode.test-samples';

import { ModeService } from './mode.service';

const requireRestSample: IMode = {
  ...sampleWithRequiredData,
};

describe('Mode Service', () => {
  let service: ModeService;
  let httpMock: HttpTestingController;
  let expectedResult: IMode | IMode[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ModeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Mode', () => {
      const mode = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(mode).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Mode', () => {
      const mode = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(mode).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Mode', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Mode', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Mode', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Mode', () => {
      const queryObject: any = {
        page: 0,
        size: 20,
        query: '',
        sort: [],
      };
      service.search(queryObject).subscribe(() => expectedResult);

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(expectedResult).toBe(null);
    });

    describe('addModeToCollectionIfMissing', () => {
      it('should add a Mode to an empty array', () => {
        const mode: IMode = sampleWithRequiredData;
        expectedResult = service.addModeToCollectionIfMissing([], mode);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(mode);
      });

      it('should not add a Mode to an array that contains it', () => {
        const mode: IMode = sampleWithRequiredData;
        const modeCollection: IMode[] = [
          {
            ...mode,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addModeToCollectionIfMissing(modeCollection, mode);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Mode to an array that doesn't contain it", () => {
        const mode: IMode = sampleWithRequiredData;
        const modeCollection: IMode[] = [sampleWithPartialData];
        expectedResult = service.addModeToCollectionIfMissing(modeCollection, mode);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(mode);
      });

      it('should add only unique Mode to an array', () => {
        const modeArray: IMode[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const modeCollection: IMode[] = [sampleWithRequiredData];
        expectedResult = service.addModeToCollectionIfMissing(modeCollection, ...modeArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const mode: IMode = sampleWithRequiredData;
        const mode2: IMode = sampleWithPartialData;
        expectedResult = service.addModeToCollectionIfMissing([], mode, mode2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(mode);
        expect(expectedResult).toContain(mode2);
      });

      it('should accept null and undefined values', () => {
        const mode: IMode = sampleWithRequiredData;
        expectedResult = service.addModeToCollectionIfMissing([], null, mode, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(mode);
      });

      it('should return initial array if no Mode is added', () => {
        const modeCollection: IMode[] = [sampleWithRequiredData];
        expectedResult = service.addModeToCollectionIfMissing(modeCollection, undefined, null);
        expect(expectedResult).toEqual(modeCollection);
      });
    });

    describe('compareMode', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareMode(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 12662 };
        const entity2 = null;

        const compareResult1 = service.compareMode(entity1, entity2);
        const compareResult2 = service.compareMode(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 12662 };
        const entity2 = { id: 31905 };

        const compareResult1 = service.compareMode(entity1, entity2);
        const compareResult2 = service.compareMode(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 12662 };
        const entity2 = { id: 12662 };

        const compareResult1 = service.compareMode(entity1, entity2);
        const compareResult2 = service.compareMode(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
