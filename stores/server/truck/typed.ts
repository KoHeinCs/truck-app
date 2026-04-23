export interface TruckListResponse {
  data: TruckData;
  httpStatus: number;
  message: string;
}

export interface TruckData {
  data: TruckItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  last: boolean;
  totalPages: number;
}

export interface TruckItem {
  id: string;
  plateNo: string;
  model: string;
  modelYear: string | number;
  engineNo?: string;
  chassisNo?: string;
  fuelType?: string;
  frontTireSize?: string;
}
