import { Risk } from "./risk.interface";

export interface Project {
  id?: string;
  members?: string[];
  name: string;
  owner?: string;
  risks?:Risk[];
  created_at: Date;
}
