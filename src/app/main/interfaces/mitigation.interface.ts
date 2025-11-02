import { ActionPriority, ActionStatus, ActionType } from "../pages/mitigation-form/mitigation-form.component";

export interface MitigationAction {
    riskId: string;
    sprintId: string;
    actionType: ActionType;
    description: string;
    objective: string;
    responsible: string;
    requiredResources: string[];
    startDate: string;
    endDate: string;
    status: ActionStatus;
    priority: ActionPriority;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
  }

  export interface MitigationActionResponse {
    data: MitigationAction;
    message: string;
    success: boolean;
  }
