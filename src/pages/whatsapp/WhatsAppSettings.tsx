import React, { useState, useEffect } from 'react';
import { Settings, Save, TestTube, CheckCircle, XCircle, Clock, TrendingUp, Zap, Bell } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig.ts';
import { Sidebar } from '../../components/sideNavbar.tsx';
import { Topbar } from '../../components/topNavbar.tsx';

interface WhatsAppConfig {
    configured: boolean;
    api_key?: string;
    server_address?: string;
    auto_send_invoices?: boolean;
    auto_send_deadline_alerts?: boolean;
    message_send_time?: string;
    deadline_check_time?: string;
    deadline_alert_days_before?: number;
    daily_quota_limit?: number;
    quota_buffer?: number;
    connection_status?: string;
    last_connection_test?: string;
}

const WhatsAppSettings: React.FC = () => {
    const [config, setConfig] = useState<WhatsAppConfig>({ configured: false });
    const [formData, setFormData] = useState({
        api_key: '923234689090-72755279-84da-4dec-9d36-406c3cbd9895',
        server_address: 'https://myapi.pk/',
        auto_send_invoices: true,
        auto_send_deadline_alerts: true,
        message_send_time: '09:00',
        deadline_check_time: '09:00',
        deadline_alert_days_before: 2,
        daily_quota_limit: 200,
        quota_buffer: 5
    });
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        document.title = 'WhatsApp Settings | Net Khata';
        fetchConfig();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchConfig = async () => {
        try {
            const response = await axiosInstance.get('/api/whatsapp/config');
            setConfig(response.data);

            if (response.data.configured) {
                setFormData({
                    api_key: response.data.api_key || formData.api_key,
                    server_address: response.data.server_address || formData.server_address,
                    auto_send_invoices: response.data.auto_send_invoices ?? true,
                    auto_send_deadline_alerts: response.data.auto_send_deadline_alerts ?? true,
                    message_send_time: response.data.message_send_time || '09:00',
                    deadline_check_time: response.data.deadline_check_time || '09:00',
                    deadline_alert_days_before: response.data.deadline_alert_days_before || 2,
                    daily_quota_limit: response.data.daily_quota_limit || 200,
                    quota_buffer: response.data.quota_buffer || 5
                });
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await axiosInstance.put('/api/whatsapp/config', formData);
            alert('Configuration saved successfully!');
            fetchConfig();
            setSaving(false);
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Failed to save configuration');
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        if (!formData.api_key || !formData.server_address) {
            alert('Please fill in API credentials first');
            return;
        }

        try {
            setTesting(true);
            setTestResult(null);

            const response = await axiosInstance.post('/api/whatsapp/config/test-connection');

            setTestResult({
                success: response.data.success,
                message: response.data.message || (response.data.success ? 'Connection successful!' : 'Connection failed')
            });

            setTesting(false);
        } catch (error) {
            setTestResult({
                success: false,
                message: 'Connection test failed'
            });
            setTesting(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar toggleSidebar={toggleSidebar} />
                <main className={`flex-1 overflow-y-auto bg-slate-50 p-0 sm:p-6 pt-20 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0 lg:ml-20'}`}>
                    <div className="max-w-[1400px] mx-auto space-y-4">
                    <div className="bg-white rounded-[10px] border border-slate-200 p-5">
                        <h1 className="text-[15px] font-medium text-slate-900 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Settings className="w-4 h-4 text-blue-600" />
                            </span>
                            WhatsApp Settings
                        </h1>
                        <p className="text-[11px] text-slate-400 mt-1">Configure your WhatsApp messaging system</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-[10px] border border-slate-200">
                            <div className="flex items-center gap-2.5 mb-4">
                                <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                </span>
                                <div>
                                    <h2 className="text-[13px] font-medium text-slate-900">API Configuration</h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Set up your WhatsApp API credentials</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-600 mb-1.5">API Key</label>
                                    <input
                                        type="text"
                                        value={formData.api_key}
                                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                        className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Server Address</label>
                                    <input
                                        type="text"
                                        value={formData.server_address}
                                        onChange={(e) => setFormData({ ...formData, server_address: e.target.value })}
                                        className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testing}
                                    className="h-9 px-4 rounded-md bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors duration-150 flex items-center gap-1.5"
                                >
                                    {testing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <TestTube className="w-4 h-4" />
                                            Test Connection
                                        </>
                                    )}
                                </button>

                                {testResult && (
                                    <div className={`mt-3 p-3 rounded-md border flex items-center gap-2 ${testResult.success
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-rose-50 border-rose-200'
                                        }`}>
                                        {testResult.success ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-700" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-rose-600" />
                                        )}
                                        <p className={`text-[13px] font-medium ${testResult.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                                            {testResult.message}
                                        </p>
                                    </div>
                                )}

                                {config.connection_status && (
                                    <div className="mt-3 text-[12px] text-slate-500">
                                        <p>Last Test: {config.last_connection_test ? new Date(config.last_connection_test).toLocaleString() : 'Never'}</p>
                                        <p className={`font-medium ${config.connection_status === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                                            Status: {config.connection_status}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[10px] border border-slate-200">
                            <div className="flex items-center gap-2.5 mb-4">
                                <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-blue-600" />
                                </span>
                                <div>
                                    <h2 className="text-[13px] font-medium text-slate-900">Automation</h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Configure automatic messaging</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[10px] border border-slate-200">
                                    <div>
                                        <p className="text-[13px] font-medium text-slate-700">Auto-send Invoices</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Automatically send generated invoices to customers</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.auto_send_invoices}
                                            onChange={(e) => setFormData({ ...formData, auto_send_invoices: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/[0.12] rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[10px] border border-slate-200">
                                    <div>
                                        <p className="text-[13px] font-medium text-slate-700">Auto-send Deadline Alerts</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Send automatic reminders before payment due dates</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.auto_send_deadline_alerts}
                                            onChange={(e) => setFormData({ ...formData, auto_send_deadline_alerts: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/[0.12] rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[10px] border border-slate-200">
                            <div className="flex items-center gap-2.5 mb-4">
                                <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </span>
                                <div>
                                    <h2 className="text-[13px] font-medium text-slate-900">Schedule Settings</h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Configure when messages are sent</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Message Send Time</label>
                                    <input
                                        type="time"
                                        value={formData.message_send_time}
                                        onChange={(e) => setFormData({ ...formData, message_send_time: e.target.value })}
                                        className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Deadline Check Time</label>
                                    <input
                                        type="time"
                                        value={formData.deadline_check_time}
                                        onChange={(e) => setFormData({ ...formData, deadline_check_time: e.target.value })}
                                        className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Alert Days Before</label>
                                    <input
                                        type="number"
                                        value={formData.deadline_alert_days_before}
                                        onChange={(e) => setFormData({ ...formData, deadline_alert_days_before: parseInt(e.target.value) })}
                                        min="1"
                                        max="7"
                                        className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[10px] border border-slate-200">
                            <div className="flex items-center gap-2.5 mb-4">
                                <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                </span>
                                <div>
                                    <h2 className="text-[13px] font-medium text-slate-900">Quota Management</h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Configure daily message limits</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Daily Quota Limit</label>
                                    <input
                                        type="number"
                                        value={formData.daily_quota_limit}
                                        onChange={(e) => setFormData({ ...formData, daily_quota_limit: parseInt(e.target.value) })}
                                        min="1"
                                        max="500"
                                        className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1.5">Maximum messages per day (recommended: 200)</p>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Safety Buffer</label>
                                    <input
                                        type="number"
                                        value={formData.quota_buffer}
                                        onChange={(e) => setFormData({ ...formData, quota_buffer: parseInt(e.target.value) })}
                                        min="0"
                                        max="50"
                                        className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1.5">Reserved buffer to prevent quota overflow</p>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-slate-50 rounded-[10px] border border-slate-200">
                                <p className="text-[13px] text-slate-600">
                                    <span className="font-medium text-slate-700">Effective Limit: </span>
                                    {formData.daily_quota_limit - formData.quota_buffer} messages/day
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="h-10 px-5 rounded-md bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors duration-150 flex items-center gap-1.5"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WhatsAppSettings;
