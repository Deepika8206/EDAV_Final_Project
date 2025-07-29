import React from 'react';
import { Home, Users, FileText, Activity, Settings, Shield } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userType: 'patient' | 'hospital';
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, userType }) => {
  const patientTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'access-log', label: 'Access Log', icon: Activity },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const hospitalTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'emergency', label: 'Emergency Access', icon: Shield },
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'audit', label: 'Audit Trail', icon: Activity },
  ];

  const tabs = userType === 'patient' ? patientTabs : hospitalTabs;

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};