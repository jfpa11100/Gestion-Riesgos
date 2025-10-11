import { Risk } from "./risk.interface";

export interface Sprint {
  id: string;
  prioritizationTechnique: 'quantitative' | 'qualitative';
  sprint:number;
  mitigation_date:Date;
  risks: Risk[];
  available: boolean;
  created_at:Date
}
