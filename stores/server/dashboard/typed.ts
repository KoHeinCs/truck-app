export interface SalesPerformanceItem {
  monthlyProfit: number;
  salesMonth: string;
  totalSold: number;
}

export interface SalesPerformanceResponse {
  data: SalesPerformanceItem[];
  httpStatus: number;
  message: string;
}

export interface TopProfitTruck {
  id: string;
  equipmentName: string;
  truckPlateNo: string;
  profit: number;
}

export interface TruckStatsData {
  topProfitTrucks: TopProfitTruck[];
  totalActiveTrucks: number;
  totalSoldTrucks: number;
  totalTrucks: number;
}

export interface TruckStatsResponse {
  data: TruckStatsData;
  httpStatus: number;
  message: string;
}

export interface ProposalStatsData {
  totalInformTasks: number;
}

export interface ProposalStatsResponse {
  data: ProposalStatsData;
  httpStatus: number;
  message: string;
}
