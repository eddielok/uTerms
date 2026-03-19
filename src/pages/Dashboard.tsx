import { Activity, AlertCircle, ArrowDownRight, ArrowUpRight, FileText, Settings, ShieldCheck, Users } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container container">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl font-bold mb-1">Privacy Operations</h1>
          <p className="text-muted">Monitor and manage your organization's compliance status.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition">
            <Settings size={18} /> Settings
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid kpis">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-success/10 text-success rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <ShieldCheck size={24} />
              </div>
              <span className="flex items-center text-sm font-medium text-success h-[24px]">
                <ArrowUpRight size={16} className="mr-1" /> 2.4%
              </span>
            </div>
            <div>
              <p className="text-muted text-sm font-medium mb-1">Global Consent Rate</p>
              <h3 className="text-3xl font-bold">92.4%</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-warning/10 text-warning rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <Activity size={24} />
              </div>
              <span className="flex items-center text-sm font-medium text-error h-[24px]">
                <ArrowDownRight size={16} className="mr-1" /> 12
              </span>
            </div>
            <div>
              <p className="text-muted text-sm font-medium mb-1">Unclassified Trackers</p>
              <h3 className="text-3xl font-bold">8</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 text-primary rounded-lg" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                <Users size={24} />
              </div>
              <span className="flex items-center text-sm font-medium text-success h-[24px]">
                <ArrowUpRight size={16} className="mr-1" /> 4
              </span>
            </div>
            <div>
              <p className="text-muted text-sm font-medium mb-1">Open DSR Requests</p>
              <h3 className="text-3xl font-bold">14</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <FileText size={24} />
              </div>
            </div>
            <div>
              <p className="text-muted text-sm font-medium mb-1">Active Policies</p>
              <h3 className="text-3xl font-bold">6</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="dashboard-grid main-content">
        {/* Recent Activity List */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="task-list">
              <div className="task-item">
                <div className="task-icon text-warning bg-warning/10" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <AlertCircle size={20} />
                </div>
                <div className="task-info">
                  <h4 className="font-medium text-sm">Review 8 unclassified cookies detected on marketing site</h4>
                  <p className="text-xs text-muted mt-1">Detected 2 hours ago • Marketing Team</p>
                </div>
                <button className="text-primary text-sm font-medium hover:underline">Review</button>
              </div>

              <div className="task-item">
                <div className="task-icon text-error bg-error/10" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <Users size={20} />
                </div>
                <div className="task-info">
                  <h4 className="font-medium text-sm">3 DSAR Requests approaching SLA deadline (48h remaining)</h4>
                  <p className="text-xs text-muted mt-1">European Region • Legal Team</p>
                </div>
                <button className="text-primary text-sm font-medium hover:underline">Manage</button>
              </div>

              <div className="task-item">
                <div className="task-icon text-primary bg-primary/10" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                  <FileText size={20} />
                </div>
                <div className="task-info">
                  <h4 className="font-medium text-sm">Draft Cookie Policy revision requires approval</h4>
                  <p className="text-xs text-muted mt-1">Updated yesterday • Compliance Team</p>
                </div>
                <button className="text-primary text-sm font-medium hover:underline">Review</button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic map / regions placeholder */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Consent by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="region-list">
              <div className="region-item">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Europe (GDPR)</span>
                  <span className="text-sm font-bold">89%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '89%' }}></div>
                </div>
              </div>
              <div className="region-item">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">California (CCPA)</span>
                  <span className="text-sm font-bold">95%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div className="region-item">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Other US</span>
                  <span className="text-sm font-bold">94%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div className="region-item">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Asia Pacific</span>
                  <span className="text-sm font-bold">82%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-warning" style={{ width: '82%', backgroundColor: '#f59e0b' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
