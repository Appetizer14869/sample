import dayjs from 'dayjs/esm';
import { IMode } from 'app/entities/mode/mode.model';
import { ITag } from 'app/entities/tag/tag.model';

export interface IPost {
  id: number;
  title?: string | null;
  content?: string | null;
  date?: dayjs.Dayjs | null;
  mode?: IMode | null;
  tags?: ITag[] | null;
}

export type NewPost = Omit<IPost, 'id'> & { id: null };
