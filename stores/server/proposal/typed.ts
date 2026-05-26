export interface ProposalListResponse {
  data: ProposalPageData;
  httpStatus: number;
  message: string;
}

export interface ProposalDetailResponse {
  data: ProposalDetail;
  httpStatus: number;
  message: string;
}

export interface ProposalPageData {
  data: ProposalItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  last: boolean;
  totalPages: number;
}

export interface ProposalItem {
  ownershipId: string;
  proposalNo: string;
  plateNo: string;
  proposalAmount: number;
  proposalDate: string;
  status: string;
  serviceType: string;
  serviceDate: string;
  createdBy: string;
  serviceShop: string;
}

export interface ProposalDetail {
  id: string;
  version: number;
  proposalNo: string;
  ownershipRefId: string;
  plateNo: string;
  proposalAmount: number;
  proposalDate: string;
  status: string;
  serviceType: string;
  serviceShop: string;
  serviceDate: string;
  description?: string;
  createdBy: string;
  createdUserFullName?: string;
  createdUserPhone?: string;
  ownerId?: string;
  ownerFullName?: string;
  ownerPhone?: string;
}
