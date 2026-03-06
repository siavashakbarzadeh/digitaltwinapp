import { AssetType, DeviceCondition } from './data/scenarios';

export interface HistoryEntry {
    id: string;
    timestamp: string;
    assetType: AssetType;
    scenarioName: string;
    condition: DeviceCondition;
    mae: number;
    rmse: number;
    soh: number;
}

export type Tab = 'hub' | 'literature' | 'offline_twin' | 'online_twin' | 'twin_view' | 'comparison' | 'scenarios' | 'info';
