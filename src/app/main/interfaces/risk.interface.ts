export interface CategoryRisk{
  topic: string;
  category: string;
  risks: Risk[];
}

export interface Risk {
  id: string;
  risk: string;
  category:string;
  probability?: number;
  impact?: number;
}
