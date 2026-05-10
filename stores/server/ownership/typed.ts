export interface OwnershipListResponse {
  data: OwnershipData;
  httpStatus: number;
  message: string;
}

export interface OwnershipData {
  data: OwnershipItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  last: boolean;
  totalPages: number;
}

export interface OwnershipItem {
  id: string;
  truckStatus?: string;
  plateNo?: string;
  licenseCity?: string;
  licenseStartDate?: string;
  licenseEndDate?: string;
  balance?: number;
  profit?: number;
  model?: string;
  make?: string;
  modelYear?: string | number;
  truck?: {
    id?: string;
    plateNo?: string;
    model?: string;
    make?: string;
    modelYear?: string | number;
  };
  owner?: {
    id?: string;
    fullName?: string;
    username?: string;
  } | null;
}
