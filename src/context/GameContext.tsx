'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateSelections, calculateRemainingUnits } from '@/lib/budget-engine';
import { generateReflection, saveReflectionResponse } from '@/lib/reflection-engine';
import { PolicyWithArea } from '@/lib/ai-negotiation/shared-types'; // Fix the import path
import { POLICY_AREAS } from '@/data/game-data';

type GamePhase = 'onboarding' | 'policy-selection' | 'stakeholder-negotiation' | 'ethical-reflection';

interface GameContextType {
  // State
  selectedPolicies: string[];
  negotiationLogs: any[];
  reflectionData: any;
  budgetValidation: {
    isValid: boolean;
    warnings: string[];
    totalUnits: number;
    tierDiversity: boolean;
  };
  
  // Actions
  setSelectedPolicies: (policies: string[]) => void;
  addSelectedPolicy: (policyId: string) => void;
  removeSelectedPolicy: (policyId: string) => void;
  setNegotiationLogs: (logs: any[]) => void;
  addNegotiationLog: (log: any) => void;
  saveReflection: (questionId: string, response: string) => void;
  setReflectionData: (data: any) => void;
  
  // Utilities
  getSelectedPolicyObjects: () => PolicyWithArea[];
  generateReflectionData: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [negotiationLogs, setNegotiationLogs] = useState<any[]>([]);
  const [reflectionData, setReflectionData] = useState(null);
  const [budgetValidation, setBudgetValidation] = useState({
    isValid: true,
    warnings: [],
    totalUnits: 0,
    tierDiversity: false
  });

  // Get selected policy objects
  const getSelectedPolicyObjects = () => {
    const policies: PolicyWithArea[] = [];
    POLICY_AREAS.forEach(area => {
      area.policies.forEach(policy => {
        if (selectedPolicies.includes(policy.id)) {
          policies.push({...policy, area: area.title});
        }
      });
    });
    return policies;
  };

  // Add a single policy
  const addSelectedPolicy = (policyId: string) => {
    setSelectedPolicies(prev => [...prev, policyId]);
  };

  // Remove a single policy
  const removeSelectedPolicy = (policyId: string) => {
    setSelectedPolicies(prev => prev.filter(id => id !== policyId));
  };

  // Add a negotiation log
  const addNegotiationLog = (log: any) => {
    setNegotiationLogs(prev => [...prev, log]);
  };

  // Generate reflection data
  const generateReflectionData = () => {
    const selectedPolicyObjects = getSelectedPolicyObjects();
    const reflection = generateReflection(selectedPolicyObjects);
    setReflectionData(reflection);
  };

  // Validate budget whenever selected policies change
  useEffect(() => {
    const selectedPolicyObjects = getSelectedPolicyObjects();
    const validation = validateSelections(selectedPolicyObjects);
    setBudgetValidation(validation);
  }, [selectedPolicies]);

  // Add the saveReflection implementation
  const saveReflection = (questionId: string, response: string) => {
    if (reflectionData) {
      const updatedReflectionData = {
        ...reflectionData,
        responses: {
          ...reflectionData.responses,
          [questionId]: response
        }
      };
      setReflectionData(updatedReflectionData);
    }
  };

  return (
    <GameContext.Provider
      value={{
        selectedPolicies,
        negotiationLogs,
        reflectionData,
        budgetValidation,
        setSelectedPolicies,
        addSelectedPolicy,
        removeSelectedPolicy,
        setNegotiationLogs,
        addNegotiationLog,
        getSelectedPolicyObjects,
        generateReflectionData,
        saveReflection,
        setReflectionData // Added this missing property
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};