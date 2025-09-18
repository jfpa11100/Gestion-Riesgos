import { Risk } from "./risk.interface";

export interface Sprint {
  id: string;
  sprint:number;
  mitigation_date:Date;
  risks: Risk[];
  created_at:Date
}
