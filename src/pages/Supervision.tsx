import { useState } from 'react';
import {
  Search,
  MapPin,
  AlertTriangle,
  User,
  FileText,
  Map as MapIcon,
  Ban,
  Info,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate, maskIdCard } from '@/utils';

type TabType = 'airspace' | 'blacklist';
type AirspaceTypeFilter = 'all' | 'controlled' | 'restricted' | 'prohibited' | 'uncontrolled';

export default function Supervision() {
  const { airspaces, blacklist } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('airspace');
  const [searchQuery, setSearchQuery] = useState('');
  const [airspaceTypeFilter, setAirspaceTypeFilter] = useState<AirspaceTypeFilter>('all');
  const [expandedBlacklist, setExpandedBlacklist] = useState<string | null>(null);

  const tabs = [
    { key: 'airspace', label: '空域查询', icon: MapIcon },
    { key: 'blacklist', label: '黑名单查询', icon: Ban },
  ];

  const airspaceTypeLabels: Record<string, string> = {
    controlled: '管制空域',
    restricted: '限制空域',
    prohibited: '禁止空域',
    uncontrolled: '非管制空域',
  };

  const airspaceTypeColors: Record<string, string> = {
    controlled: 'bg-yellow-100 text-yellow-700',
    restricted: 'bg-orange-100 text-orange-700',
    prohibited: 'bg-red-100 text-red-700',
    uncontrolled: 'bg-green-100 text-green-700',
  };

  const filteredAirspaces = airspaces.filter((as) => {
    const matchSearch =
      as.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      as.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = airspaceTypeFilter === 'all' || as.type === airspaceTypeFilter;
    return matchSearch && matchType;
  });

  const filteredBlacklist = blacklist.filter(
    (bl) =>
      bl.name.includes(searchQuery) ||
      bl.idCard.includes(searchQuery) ||
      bl.reason.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">监管查询</h2>
        <p className="text-gray-500 mt-1">查询空域信息和黑名单记录</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
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
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'airspace' ? '搜索空域名称或描述...' : '搜索姓名、身份证号或原因...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {activeTab === 'airspace' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'uncontrolled', label: '非管制', color: 'bg-green-500' },
                  { key: 'controlled', label: '管制', color: 'bg-yellow-500' },
                  { key: 'restricted', label: '限制', color: 'bg-orange-500' },
                  { key: 'prohibited', label: '禁止', color: 'bg-red-500' },
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setAirspaceTypeFilter(type.key as AirspaceTypeFilter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      airspaceTypeFilter === type.key
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.color && (
                      <div className={`w-2 h-2 rounded-full ${type.color}`} />
                    )}
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAirspaces.map((as) => (
                  <div
                    key={as.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{as.name}</h4>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${airspaceTypeColors[as.type]}`}
                          >
                            {airspaceTypeLabels[as.type]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{as.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Info className="w-4 h-4" />
                        高度范围：{as.altitudeMin}m - {as.altitudeMax}m
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAirspaces.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                  <MapIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>未找到匹配的空域信息</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'blacklist' && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">重要提示</h4>
                    <p className="text-sm text-red-700 mt-1">
                      被列入黑名单的用户将无法进行任何飞行申报。黑名单记录会在处罚期满后自动解除，
                      如有异议可提交申诉。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredBlacklist.map((bl) => (
                  <div
                    key={bl.id}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        setExpandedBlacklist(expandedBlacklist === bl.id ? null : bl.id)
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Ban className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-gray-800">{bl.name}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${bl.status === 'active'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                              {bl.status === 'active' ? '处罚中' : '已过期'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            身份证：{maskIdCard(bl.idCard)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            处罚日期：{formatDate(bl.penaltyDate)}
                          </p>
                          <p className="text-xs text-gray-400">
                            到期日期：{formatDate(bl.expiryDate)}
                          </p>
                        </div>
                        {expandedBlacklist === bl.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {expandedBlacklist === bl.id && (
                      <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                        <div className="pt-4 space-y-3">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">违规原因</p>
                            <p className="text-gray-800">{bl.reason}</p>
                          </div>
                          <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                              <Eye className="w-4 h-4" />
                              查看详情
                            </button>
                            {bl.status === 'active' && (
                              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                                <FileText className="w-4 h-4" />
                                提交申诉
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredBlacklist.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>未找到匹配的黑名单记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
