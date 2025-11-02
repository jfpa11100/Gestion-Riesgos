import { Sprint } from "./sprint.interface";

export interface CategoryRisk{
  topic: string;
  category: string;
  risks: Risk[];
}

export interface SprintRisks{
  sprint: number;
  risks: Risk[]
}
export interface Risk {
  id: string;
  sprintId: string;
  risk: string;
  category:string;
  probability?: number;
  assignee:string | null;
  impact?: number;
  status: string;
  action_type?: string;
  action_description?: string;
  action_goal?: string;
  start_date?: string;
  end_date?: string;
  priority?: string;
  required_resources?: string[];
}
