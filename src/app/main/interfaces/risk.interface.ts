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
  impact?: number;
}
