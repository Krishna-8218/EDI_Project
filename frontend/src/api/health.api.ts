import api from './client';
import { ApiResponse, AssetHealthPrediction, HealthOverviewStats } from '../types';

export const healthApi = {
  getHealthOverview: async (): Promise<ApiResponse<HealthOverviewStats>> => {
    return api.get<HealthOverviewStats>('/assets/health/overview');
  },

  getAssetHealth: async (assetId: string): Promise<ApiResponse<AssetHealthPrediction | null>> => {
    return api.get<AssetHealthPrediction | null>(`/assets/${assetId}/health`);
  },

  getAssetHealthHistory: async (assetId: string): Promise<ApiResponse<AssetHealthPrediction[]>> => {
    return api.get<AssetHealthPrediction[]>(`/assets/${assetId}/health/history`);
  },

  runAssetHealthPrediction: async (assetId: string): Promise<ApiResponse<AssetHealthPrediction>> => {
    return api.post<AssetHealthPrediction>(`/assets/${assetId}/predict`);
  },
};

export default healthApi;
