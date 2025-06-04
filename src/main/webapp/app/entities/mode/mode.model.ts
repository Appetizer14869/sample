import { IUser } from 'app/entities/user/user.model';

export interface IMode {
  id: number;
  name?: string | null;
  handle?: string | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewMode = Omit<IMode, 'id'> & { id: null };
