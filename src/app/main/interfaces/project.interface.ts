import { Risk } from "./risk.interface";
import { Sprint } from "./sprint.interface";

export interface Project {
  id?: string;
  members?: string[];
  name: string;
  description: string;
  owner?: string;
  risks?:Risk[];
  sprints: Sprint[];
  created_at?: Date;
}
