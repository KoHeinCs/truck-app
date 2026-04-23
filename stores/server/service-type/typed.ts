export interface ServiceTypeListResponse {
  data: ServiceTypeData;
  httpStatus: number;
  message: string;
}

export interface ServiceTypeData {
  data: ServiceTypeItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  last: boolean;
  totalPages: number;
}

export interface ServiceTypeItem {
  id: string | number;
  serviceType: string;
  langEng: string;
  langMy?: string;
  active: boolean;
  version: number;
}
