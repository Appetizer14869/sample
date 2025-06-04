import { IMode, NewMode } from './mode.model';

export const sampleWithRequiredData: IMode = {
  id: 13795,
  name: 'smug',
  handle: 'like deprave',
};

export const sampleWithPartialData: IMode = {
  id: 5580,
  name: 'anxiously inside sticky',
  handle: 'come er',
};

export const sampleWithFullData: IMode = {
  id: 23160,
  name: 'winding deliberately hmph',
  handle: 'carefully why',
};

export const sampleWithNewData: NewMode = {
  name: 'beep colligate toward',
  handle: 'save whenever',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
