export interface UserTeamResponse {
  data: UserTeamData;
  httpStatus: number;
  message: string;
}

export interface UserTeamData {
  data: UserTeamItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  last: boolean;
  totalPages: number;
}

export interface UserTeamItem {
  id: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  email: string;
  role: string;
  active: boolean;
  notLocked: boolean;
}

