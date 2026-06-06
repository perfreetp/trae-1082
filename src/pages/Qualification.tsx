import { useState } from 'react';
import {
  User,
  Building2,
  Plane,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Plus,
  Trash2,
  Shield,
  FileText,
  CreditCard,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { maskIdCard, maskPhone, formatDate } from '@/utils';

type TabType = 'personal' | 'enterprise' | 'aircraft';

export default function Qualification() {
  const { user, aircraft } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const tabs = [
    { key: 'personal', label: '实名认证', icon: User },
    { key: 'enterprise', label: '企业授权', icon: Building2 },
    { key: 'aircraft', label: '飞行器管理', icon: Plane },
  ];

  const aircraftStatusColors: Record<string, string> = {
    bound: 'bg-green-100 text-green-600',
    unbound: 'bg-gray-100 text-gray-600',
    expired: 'bg-red-100 text-red-600',
  };

  const aircraftStatusLabels: Record<string, string> = {
    bound: '已绑定',
    unbound: '未绑定',
    expired: '已过期',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">主体资质</h2>
        <p className="text-gray-500 mt-1">管理您的实名认证、企业授权和飞行器信息</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">个人信息</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{user.name}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">身份证号</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{maskIdCard(user.idCard)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{maskPhone(user.phone)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">认证状态</h3>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  {user.realNameVerified ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {user.realNameVerified ? '实名认证已通过' : '实名认证待认证'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.realNameVerified
                        ? '您的身份信息已通过审核'
                        : '请上传身份证正反面照片完成实名认证'}
                    </p>
                  </div>
                  {!user.realNameVerified && (
                    <button className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                      去认证
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">证件照片</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">身份证人像面</p>
                    <p className="text-xs text-gray-400 mt-1">点击或拖拽上传</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">身份证国徽面</p>
                    <p className="text-xs text-gray-400 mt-1">点击或拖拽上传</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enterprise' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">企业信息</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">企业名称</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{user.enterpriseName}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">统一社会信用代码</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{user.creditCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">企业认证状态</h3>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  {user.enterpriseVerified ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <Clock className="w-8 h-8 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {user.enterpriseVerified ? '企业认证已通过' : '企业认证审核中'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.enterpriseVerified
                        ? '您的企业信息已通过审核'
                        : '您的企业认证正在审核中，请耐心等待'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">企业资质文件</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">营业执照.pdf</p>
                        <p className="text-xs text-gray-500">2.5 MB · 已上传</p>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">法人授权书.pdf</p>
                        <p className="text-xs text-gray-500">1.2 MB · 已上传</p>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aircraft' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">我的飞行器</h3>
                <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                  <Plus className="w-4 h-4" />
                  添加飞行器
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aircraft.map((ac) => (
                  <div key={ac.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Plane className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${aircraftStatusColors[ac.status]}`}>
                        {aircraftStatusLabels[ac.status]}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{ac.model}</h4>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>注册号：{ac.registrationNo}</p>
                      <p>适航证：{ac.airworthinessCert}</p>
                      <p>绑定时间：{formatDate(ac.boundAt)}</p>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button className="flex-1 text-sm text-blue-600 hover:text-blue-700 py-2">
                        查看详情
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
