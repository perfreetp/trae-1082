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
  Plane,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  Search as SearchIcon,
  FileCheck,
  Building,
  IdCard,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate, formatDateTime, maskIdCard, maskPhone, formatFileSize } from '@/utils';
import {
  statusLabels,
  statusColors,
  taskTypeLabels,
  riskLevelLabels,
  riskLevelColors,
} from '@/data/mockData';

type TabType = 'airspace' | 'blacklist' | 'declaration' | 'subject' | 'licence';
type AirspaceTypeFilter = 'all' | 'controlled' | 'restricted' | 'prohibited' | 'uncontrolled';

export default function Supervision() {
  const { airspaces, blacklist, declarations, user, aircraft, isBlacklisted, getBlacklistRecord } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('airspace');
  const [searchQuery, setSearchQuery] = useState('');
  const [airspaceTypeFilter, setAirspaceTypeFilter] = useState<AirspaceTypeFilter>('all');
  const [expandedBlacklist, setExpandedBlacklist] = useState<string | null>(null);
  const [declarationSearchId, setDeclarationSearchId] = useState('');
  const [searchedDeclaration, setSearchedDeclaration] = useState<typeof declarations[0] | null>(null);
  const [searchError, setSearchError] = useState('');
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [searchedSubject, setSearchedSubject] = useState<any>(null);
  const [subjectSearchError, setSubjectSearchError] = useState('');
  const [licenceSearchQuery, setLicenceSearchQuery] = useState('');
  const [searchedLicence, setSearchedLicence] = useState<any>(null);
  const [licenceSearchError, setLicenceSearchError] = useState('');

  const tabs = [
    { key: 'airspace', label: '空域查询', icon: MapIcon },
    { key: 'blacklist', label: '黑名单查询', icon: Ban },
    { key: 'declaration', label: '申报查询', icon: FileText },
    { key: 'subject', label: '主体汇总', icon: Building },
    { key: 'licence', label: '许可核验', icon: FileCheck },
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

  const changeStatusLabels: Record<string, string> = {
    requested: '已申请',
    reviewing: '审核中',
    supplement: '待补充',
    approved: '已通过',
    rejected: '已驳回',
  };

  const changeStatusColors: Record<string, string> = {
    requested: 'bg-blue-100 text-blue-600',
    reviewing: 'bg-yellow-100 text-yellow-600',
    supplement: 'bg-orange-100 text-orange-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600',
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

  const handleDeclarationSearch = () => {
    setSearchError('');
    if (!declarationSearchId.trim()) {
      setSearchError('请输入申报编号');
      return;
    }
    const found = declarations.find(
      (d) => d.id.toLowerCase() === declarationSearchId.trim().toLowerCase()
    );
    if (found) {
      setSearchedDeclaration(found);
    } else {
      setSearchError('未找到该申报编号的记录');
      setSearchedDeclaration(null);
    }
  };

  const handleSubjectSearch = () => {
    setSubjectSearchError('');
    setSearchedSubject(null);
    if (!subjectSearchQuery.trim()) {
      setSubjectSearchError('请输入身份证号或企业信用代码');
      return;
    }
    const query = subjectSearchQuery.trim().toLowerCase();
    const isCurrentUser = user.idCard.toLowerCase().includes(query) || 
                         (user.creditCode && user.creditCode.toLowerCase().includes(query));
    if (isCurrentUser) {
      const userDeclarations = declarations.filter((d) => d.userId === user.id);
      const userBlacklisted = isBlacklisted();
      const userBlacklistRecord = getBlacklistRecord();
      const validLicences = userDeclarations.filter(
        (d) => d.status === 'approved' && d.licenceExpiry && new Date(d.licenceExpiry) > new Date()
      );
      const lastDisposal = userDeclarations
        .flatMap((d) => d.disposalRecords || [])
        .sort((a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime())[0];
      
      setSearchedSubject({
        user,
        declarations: userDeclarations,
        aircraft,
        isBlacklisted: userBlacklisted,
        blacklistRecord: userBlacklistRecord,
        validLicences,
        lastDisposal,
      });
    } else {
      setSubjectSearchError('未找到该主体信息');
    }
  };

  const handleLicenceSearch = () => {
    setLicenceSearchError('');
    setSearchedLicence(null);
    if (!licenceSearchQuery.trim()) {
      setLicenceSearchError('请输入许可编号');
      return;
    }
    const query = licenceSearchQuery.trim().toUpperCase();
    const found = declarations.find((d) => {
      if (d.status !== 'approved') return false;
      const licenceNo = `FK-${d.id.slice(-8).toUpperCase()}`;
      return licenceNo === query || d.id.toUpperCase() === query;
    });
    if (found) {
      const licenceNo = `FK-${found.id.slice(-8).toUpperCase()}`;
      let licenceStatus = 'valid';
      let statusNote = '';
      if (found.status === 'revoked') {
        licenceStatus = 'invalid';
        statusNote = '申报已撤销，许可无效';
      } else if (found.status === 'rejected') {
        licenceStatus = 'invalid';
        statusNote = '申报已驳回，许可无效';
      } else if (found.lastChangeResult === 'rejected') {
        licenceStatus = 'restricted';
        statusNote = '变更申请被驳回，许可受限';
      } else if (found.licenceExpiry && new Date(found.licenceExpiry) < new Date()) {
        licenceStatus = 'expired';
        statusNote = '许可已过期';
      }
      setSearchedLicence({
        declaration: found,
        licenceNo,
        status: licenceStatus,
        statusNote,
      });
    } else {
      setLicenceSearchError('未找到该许可编号的记录');
    }
  };

  const getAircraftModels = (aircraftIds: string[]) => {
    return aircraftIds
      .map((id) => aircraft.find((a) => a.id === id)?.model)
      .filter(Boolean)
      .join('、');
  };

  const userBlacklisted = isBlacklisted();
  const userBlacklistRecord = getBlacklistRecord();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">监管查询</h2>
        <p className="text-gray-500 mt-1">查询空域信息、黑名单记录、申报详情、主体汇总和许可核验</p>
      </div>

      {userBlacklisted && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Ban className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">限制标识：当前查询主体在黑名单中</h4>
              <p className="text-sm text-red-700 mt-1">
                限制原因：{userBlacklistRecord?.reason || '未知'} · 处罚到期日：{userBlacklistRecord ? formatDate(userBlacklistRecord.expiryDate) : '未知'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as TabType);
                  setSearchedDeclaration(null);
                  setDeclarationSearchId('');
                  setSearchError('');
                  setSearchedSubject(null);
                  setSubjectSearchQuery('');
                  setSubjectSearchError('');
                  setSearchedLicence(null);
                  setLicenceSearchQuery('');
                  setLicenceSearchError('');
                }}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
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
          {activeTab === 'airspace' && (
            <div className="space-y-4">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索空域名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

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
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索姓名、身份证号或原因..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

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

          {activeTab === 'declaration' && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="请输入申报编号，如：dec_001"
                    value={declarationSearchId}
                    onChange={(e) => setDeclarationSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDeclarationSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={handleDeclarationSearch}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <SearchIcon className="w-4 h-4" />
                  查询
                </button>
              </div>

              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{searchError}</p>
                </div>
              )}

              {searchedDeclaration && (
                <div className="space-y-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{searchedDeclaration.title}</h3>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[searchedDeclaration.status]}`}>
                            {statusLabels[searchedDeclaration.status]}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskLevelColors[searchedDeclaration.riskLevel]}`}>
                            {riskLevelLabels[searchedDeclaration.riskLevel]}
                          </span>
                          <span className="text-sm text-gray-500">
                            申报编号：{searchedDeclaration.id.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        主体信息
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">申请人</span>
                          <span className="text-gray-800 font-medium">{user.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">身份证号</span>
                          <span className="text-gray-800">{maskIdCard(user.idCard)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">联系电话</span>
                          <span className="text-gray-800">{maskPhone(user.phone)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">用户类型</span>
                          <span className="text-gray-800">{user.userType === 'enterprise' ? '企业用户' : '个人用户'}</span>
                        </div>
                        {user.userType === 'enterprise' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">企业名称</span>
                              <span className="text-gray-800">{user.enterpriseName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">统一社会信用代码</span>
                              <span className="text-gray-800">{user.creditCode}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">实名认证</span>
                          <span className={user.realNameVerified ? 'text-green-600' : 'text-orange-600'}>
                            {user.realNameVerified ? '已认证' : '未认证'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        飞行计划
                      </h4>
                      {searchedDeclaration.flightPlan ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">飞行空域</span>
                            <span className="text-gray-800 font-medium">{searchedDeclaration.flightPlan.airspaceName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">高度范围</span>
                            <span className="text-gray-800">{searchedDeclaration.flightPlan.altitudeMin}m - {searchedDeclaration.flightPlan.altitudeMax}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">开始时间</span>
                            <span className="text-gray-800">{formatDateTime(searchedDeclaration.flightPlan.startTime)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">结束时间</span>
                            <span className="text-gray-800">{formatDateTime(searchedDeclaration.flightPlan.endTime)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">飞行频次</span>
                            <span className="text-gray-800">{searchedDeclaration.flightPlan.frequency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">任务类型</span>
                            <span className="text-gray-800">{taskTypeLabels[searchedDeclaration.taskType]}</span>
                          </div>
                          {searchedDeclaration.flightPlan.aircraftIds.length > 0 && (
                            <div>
                              <span className="text-gray-500 block mb-1">使用飞行器</span>
                              <div className="flex items-center gap-2">
                                <Plane className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-800">{getAircraftModels(searchedDeclaration.flightPlan.aircraftIds)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">暂无飞行计划</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      材料清单
                    </h4>
                    {searchedDeclaration.materials.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchedDeclaration.materials.map((mat) => (
                          <div key={mat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="font-medium text-gray-800">{mat.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(mat.size)}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              mat.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {mat.status === 'verified' ? '已核验' : '已上传'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">暂无上传材料</p>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      审核记录
                    </h4>
                    {searchedDeclaration.reviewSteps && searchedDeclaration.reviewSteps.length > 0 ? (
                      <div className="relative">
                        {searchedDeclaration.reviewSteps.map((step, index) => (
                          <div key={step.id} className="relative pb-6 last:pb-0">
                            {index < (searchedDeclaration.reviewSteps?.length || 0) - 1 && (
                              <div
                                className={`absolute left-3 top-8 w-0.5 h-full ${
                                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                              />
                            )}
                            <div className="flex items-start gap-4">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.status === 'completed' ? 'bg-green-500' :
                                step.status === 'processing' ? 'bg-blue-500' :
                                step.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                              }`}>
                                {step.status === 'completed' ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : step.status === 'processing' ? (
                                  <Clock className="w-4 h-4 text-white animate-pulse" />
                                ) : step.status === 'rejected' ? (
                                  <XCircle className="w-4 h-4 text-white" />
                                ) : null}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-gray-800">{step.stepName}</h5>
                                  {step.reviewer && (
                                    <span className="text-sm text-gray-500">
                                      {step.reviewer} · {step.reviewedAt ? formatDateTime(step.reviewedAt) : ''}
                                    </span>
                                  )}
                                </div>
                                {step.opinion && (
                                  <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                    审核意见：{step.opinion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">暂无审核记录</p>
                    )}
                  </div>

                  {searchedDeclaration.changeRecords && searchedDeclaration.changeRecords.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-purple-500" />
                        变更记录
                      </h4>
                      <div className="space-y-4">
                        {searchedDeclaration.changeRecords.map((record) => (
                          <div key={record.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-purple-500" />
                                <span className="font-medium text-gray-800">变更申请</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${changeStatusColors[record.status]}`}>
                                {changeStatusLabels[record.status]}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">
                                <span className="text-gray-400">申请原因：</span>{record.reason}
                              </p>
                              <p className="text-gray-500">申请时间：{formatDateTime(record.requestedAt)}</p>
                              {record.acceptedAt && (
                                <p className="text-gray-500">受理时间：{formatDateTime(record.acceptedAt)}</p>
                              )}
                              {record.processedAt && (
                                <p className="text-gray-500">处理时间：{formatDateTime(record.processedAt)}</p>
                              )}
                              {record.processor && (
                                <p className="text-gray-500">处理人：{record.processor}</p>
                              )}
                              {record.opinion && (
                                <p className="text-gray-600 mt-2 p-2 bg-white rounded">
                                  <span className="text-gray-400">处理意见：</span>{record.opinion}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchedDeclaration.disposalRecords && searchedDeclaration.disposalRecords.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        处置时间线
                      </h4>
                      <div className="relative">
                        {searchedDeclaration.disposalRecords
                          .sort((a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime())
                          .map((record, index) => (
                            <div key={record.id} className="relative pb-6 last:pb-0">
                              {index < searchedDeclaration.disposalRecords!.length - 1 && (
                                <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-200" />
                              )}
                              <div className="flex items-start gap-4">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  record.type.includes('approve') ? 'bg-green-500' :
                                  record.type.includes('reject') ? 'bg-red-500' :
                                  record.type.includes('change') ? 'bg-purple-500' :
                                  record.type.includes('correction') ? 'bg-orange-500' :
                                  record.type === 'revoke' ? 'bg-gray-500' :
                                  'bg-blue-500'
                                }`}>
                                  {record.type.includes('approve') ? (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  ) : record.type.includes('reject') ? (
                                    <XCircle className="w-4 h-4 text-white" />
                                  ) : record.type.includes('change') ? (
                                    <RefreshCw className="w-4 h-4 text-white" />
                                  ) : record.type.includes('correction') ? (
                                    <FileText className="w-4 h-4 text-white" />
                                  ) : record.type === 'revoke' ? (
                                    <XCircle className="w-4 h-4 text-white" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium text-gray-800">{record.title}</h5>
                                    <span className="text-sm text-gray-500">
                                      {record.operator} · {formatDateTime(record.operatedAt)}
                                    </span>
                                  </div>
                                  {record.description && (
                                    <p className="mt-1 text-sm text-gray-600">{record.description}</p>
                                  )}
                                  {record.opinion && (
                                    <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                      {record.opinion}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {searchedDeclaration.status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-800">许可状态：已颁发</h4>
                          <div className="mt-2 space-y-1 text-sm text-green-700">
                            <p>许可编号：FK-{searchedDeclaration.id.slice(-8).toUpperCase()}</p>
                            {searchedDeclaration.approvedAt && (
                              <p>签发日期：{formatDate(searchedDeclaration.approvedAt)}</p>
                            )}
                            {searchedDeclaration.licenceExpiry && (
                              <p>有效期至：{formatDate(searchedDeclaration.licenceExpiry)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!searchedDeclaration && !searchError && (
                <div className="py-16 text-center text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>请输入申报编号进行查询</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subject' && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="请输入身份证号或企业统一社会信用代码"
                    value={subjectSearchQuery}
                    onChange={(e) => setSubjectSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubjectSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={handleSubjectSearch}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <SearchIcon className="w-4 h-4" />
                  查询
                </button>
              </div>

              {subjectSearchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{subjectSearchError}</p>
                </div>
              )}

              {searchedSubject && (
                <div className="space-y-6">
                  <div className={`rounded-xl p-5 ${searchedSubject.isBlacklisted ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <Building className={`w-6 h-6 flex-shrink-0 mt-0.5 ${searchedSubject.isBlacklisted ? 'text-red-500' : 'text-blue-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-800">{searchedSubject.user.name}</h3>
                          {searchedSubject.isBlacklisted && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              黑名单中
                            </span>
                          )}
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">身份证号：</span>
                            <span className="text-gray-800">{maskIdCard(searchedSubject.user.idCard)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">联系电话：</span>
                            <span className="text-gray-800">{maskPhone(searchedSubject.user.phone)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">用户类型：</span>
                            <span className="text-gray-800">{searchedSubject.user.userType === 'enterprise' ? '企业用户' : '个人用户'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">实名认证：</span>
                            <span className={searchedSubject.user.realNameVerified ? 'text-green-600' : 'text-orange-600'}>
                              {searchedSubject.user.realNameVerified ? '已认证' : '未认证'}
                            </span>
                          </div>
                        </div>
                        {searchedSubject.isBlacklisted && searchedSubject.blacklistRecord && (
                          <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">限制原因：</span>{searchedSubject.blacklistRecord.reason}
                              <span className="ml-4">
                                <span className="font-medium">处罚到期日：</span>{formatDate(searchedSubject.blacklistRecord.expiryDate)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-800">{searchedSubject.declarations.length}</p>
                          <p className="text-sm text-gray-500">总申报数</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-800">{searchedSubject.validLicences.length}</p>
                          <p className="text-sm text-gray-500">有效许可</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Plane className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-800">{searchedSubject.aircraft.length}</p>
                          <p className="text-sm text-gray-500">飞行器数</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <RefreshCw className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-800">
                            {searchedSubject.declarations.filter((d: any) => 
                              d.changeRecords && d.changeRecords.length > 0
                            ).length}
                          </p>
                          <p className="text-sm text-gray-500">变更记录</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h4 className="font-semibold text-gray-800 mb-4">全部申报记录</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">申报标题</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">任务类型</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">提交时间</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchedSubject.declarations.map((dec: any) => (
                            <tr key={dec.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <p className="font-medium text-gray-800">{dec.title}</p>
                                <p className="text-xs text-gray-500">{dec.id.toUpperCase()}</p>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {taskTypeLabels[dec.taskType]}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[dec.status]}`}>
                                  {statusLabels[dec.status]}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-sm">
                                {formatDate(dec.createdAt)}
                              </td>
                              <td className="py-3 px-4">
                                <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  查看
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h4 className="font-semibold text-gray-800 mb-4">飞行器绑定历史</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchedSubject.aircraft.map((ac: any) => (
                        <div key={ac.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Plane className="w-5 h-5 text-blue-500" />
                              <span className="font-medium text-gray-800">{ac.model}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              ac.status === 'bound' ? 'bg-green-100 text-green-600' :
                              ac.status === 'unbound' ? 'bg-gray-100 text-gray-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {ac.status === 'bound' ? '已绑定' : ac.status === 'unbound' ? '已解绑' : '已过期'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>序列号：{ac.serialNumber}</p>
                            {ac.boundAt && (
                              <p>绑定时间：{formatDate(ac.boundAt)}</p>
                            )}
                            {ac.expiryDate && (
                              <p>有效期至：{formatDate(ac.expiryDate)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {searchedSubject.lastDisposal && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h4 className="font-semibold text-gray-800 mb-4">最近一次处置结果</h4>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{searchedSubject.lastDisposal.title}</span>
                          <span className="text-sm text-gray-500">
                            {searchedSubject.lastDisposal.operator} · {formatDateTime(searchedSubject.lastDisposal.operatedAt)}
                          </span>
                        </div>
                        {searchedSubject.lastDisposal.opinion && (
                          <p className="text-sm text-gray-600">{searchedSubject.lastDisposal.opinion}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!searchedSubject && !subjectSearchError && (
                <div className="py-16 text-center text-gray-400">
                  <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>请输入身份证号或企业信用代码进行查询</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'licence' && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <FileCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="请输入许可编号，如：FK-XXXXXXXX"
                    value={licenceSearchQuery}
                    onChange={(e) => setLicenceSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLicenceSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={handleLicenceSearch}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <SearchIcon className="w-4 h-4" />
                  核验
                </button>
              </div>

              {licenceSearchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{licenceSearchError}</p>
                </div>
              )}

              {searchedLicence && (
                <div className="space-y-6">
                  <div className={`rounded-xl p-6 border ${
                    searchedLicence.status === 'valid' ? 'bg-green-50 border-green-200' :
                    searchedLicence.status === 'restricted' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${
                        searchedLicence.status === 'valid' ? 'bg-green-100' :
                        searchedLicence.status === 'restricted' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        {searchedLicence.status === 'valid' ? (
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        ) : searchedLicence.status === 'restricted' ? (
                          <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800">{searchedLicence.licenceNo}</h3>
                        <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          searchedLicence.status === 'valid' ? 'bg-green-200 text-green-800' :
                          searchedLicence.status === 'restricted' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {searchedLicence.status === 'valid' ? '许可有效' :
                           searchedLicence.status === 'restricted' ? '许可受限' :
                           '许可无效'}
                        </div>
                        {searchedLicence.statusNote && (
                          <p className={`mt-2 text-sm ${
                            searchedLicence.status === 'valid' ? 'text-green-700' :
                            searchedLicence.status === 'restricted' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {searchedLicence.statusNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        申报信息
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">申报标题</span>
                          <span className="text-gray-800 font-medium">{searchedLicence.declaration.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">申报编号</span>
                          <span className="text-gray-800">{searchedLicence.declaration.id.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">任务类型</span>
                          <span className="text-gray-800">{taskTypeLabels[searchedLicence.declaration.taskType]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">签发日期</span>
                          <span className="text-gray-800">
                            {searchedLicence.declaration.approvedAt ? formatDate(searchedLicence.declaration.approvedAt) : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">有效期至</span>
                          <span className={`font-medium ${
                            searchedLicence.declaration.licenceExpiry && new Date(searchedLicence.declaration.licenceExpiry) < new Date()
                              ? 'text-red-600' : 'text-gray-800'
                          }`}>
                            {searchedLicence.declaration.licenceExpiry ? formatDate(searchedLicence.declaration.licenceExpiry) : '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        飞行信息
                      </h4>
                      {searchedLicence.declaration.flightPlan ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">飞行空域</span>
                            <span className="text-gray-800 font-medium">{searchedLicence.declaration.flightPlan.airspaceName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">高度范围</span>
                            <span className="text-gray-800">{searchedLicence.declaration.flightPlan.altitudeMin}m - {searchedLicence.declaration.flightPlan.altitudeMax}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">飞行时间</span>
                            <span className="text-gray-800 text-sm">
                              {formatDate(searchedLicence.declaration.flightPlan.startTime)} 至 {formatDate(searchedLicence.declaration.flightPlan.endTime)}
                            </span>
                          </div>
                          {searchedLicence.declaration.flightPlan.aircraftIds.length > 0 && (
                            <div>
                              <span className="text-gray-500 block mb-1">使用飞行器</span>
                              <div className="flex items-center gap-2">
                                <Plane className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-800">{getAircraftModels(searchedLicence.declaration.flightPlan.aircraftIds)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">暂无飞行信息</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!searchedLicence && !licenceSearchError && (
                <div className="py-16 text-center text-gray-400">
                  <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>请输入许可编号进行核验</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
