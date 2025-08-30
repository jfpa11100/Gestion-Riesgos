import { User } from "../../auth/interfaces/user.interface";
import { ProjectRisk } from "./project-risk.interface";

export interface Project {
  id?: string;
  ownerId?: string;
  name: string;
  members?: string[];
  project_risks?: ProjectRisk[];
  created_at: Date;
}
