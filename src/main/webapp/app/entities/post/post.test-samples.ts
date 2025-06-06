import dayjs from 'dayjs/esm';

import { IPost, NewPost } from './post.model';

export const sampleWithRequiredData: IPost = {
  id: 8730,
  title: 'lawful above unless',
  content: '../fake-data/blob/hipster.txt',
  date: dayjs('2025-06-03T14:21'),
};

export const sampleWithPartialData: IPost = {
  id: 28272,
  title: 'unless or supportive',
  content: '../fake-data/blob/hipster.txt',
  date: dayjs('2025-06-04T04:19'),
};

export const sampleWithFullData: IPost = {
  id: 9917,
  title: 'clearly darn icy',
  content: '../fake-data/blob/hipster.txt',
  date: dayjs('2025-06-03T20:18'),
};

export const sampleWithNewData: NewPost = {
  title: 'willfully settler',
  content: '../fake-data/blob/hipster.txt',
  date: dayjs('2025-06-03T14:03'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
