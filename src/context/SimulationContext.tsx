import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    scenarios as initialScenarios,
    ASSET_PARAMS as initialAssetParams,
    Scenario,
    AssetType,
    RCParams,
} from '../data/scenarios';

interface SimulationContextType {
    scenarios: Scenario[];
    assetParams: Record<AssetType, { new: RCParams; aged: RCParams }>;
    addScenario: (s: Scenario) => void;
    deleteScenario: (id: string) => void;
    updateAssetParams: (type: AssetType, condition: 'new' | 'aged', params: RCParams) => void;
    logs: string[];
    addLog: (msg: string) => void;
    clearLogs: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
    // Load from localStorage or use defaults
    const [scenarios, setScenarios] = useState<Scenario[]>(() => {
        const saved = localStorage.getItem('dt_scenarios');
        return saved ? JSON.parse(saved) : initialScenarios;
    });

    const [assetParams, setAssetParams] = useState<Record<AssetType, { new: RCParams; aged: RCParams }>>(() => {
        const saved = localStorage.getItem('dt_asset_params');
        return saved ? JSON.parse(saved) : initialAssetParams;
    });

    const [logs, setLogs] = useState<string[]>([]);

    // Persistence
    useEffect(() => {
        localStorage.setItem('dt_scenarios', JSON.stringify(scenarios));
    }, [scenarios]);

    useEffect(() => {
        localStorage.setItem('dt_asset_params', JSON.stringify(assetParams));
    }, [assetParams]);

    const addScenario = (s: Scenario) => {
        setScenarios(prev => [s, ...prev]);
        addLog(`✅ Scenario added: ${s.name}`);
    };

    const deleteScenario = (id: string) => {
        setScenarios(prev => prev.filter(s => s.id !== id));
        addLog(`🗑️ Scenario deleted: ${id}`);
    };

    const updateAssetParams = (type: AssetType, condition: 'new' | 'aged', params: RCParams) => {
        setAssetParams(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [condition]: params
            }
        }));
        addLog(`⚙️ Parameters updated for ${type} (${condition})`);
    };

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
    };

    const clearLogs = () => setLogs([]);

    return (
        <SimulationContext.Provider value={{
            scenarios, assetParams, addScenario, deleteScenario, updateAssetParams, logs, addLog, clearLogs
        }}>
            {children}
        </SimulationContext.Provider>
    );
};

export const useSimulation = () => {
    const context = useContext(SimulationContext);
    if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
    return context;
};
