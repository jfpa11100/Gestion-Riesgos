export interface CategoryRisk{
  topic: string;
  category: string;
  risks: Risk[];
}

export interface Risk {
  id: string;
  risk: string;
  description: string;
}
