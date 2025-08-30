import { User } from "../../auth/interfaces/user.interface";

export interface Project {
  id?: string;
  name: string;
  members?: string[];
  created_at: Date;
}
