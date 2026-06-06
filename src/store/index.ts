import { create } from 'zustand';
import type {
  User,
  Aircraft,
  Declaration,
  Message,
  BlacklistRecord,
  AirspaceInfo,
  Material,
  ReviewStep,
  DeclarationStatus,
  LicenceData,
  FlightPlan,
  EnterpriseMaterial,
  ChangeRecord,
  DisposalRecord,
} from '@/types';
import {
  mockUser,
  mockAircraft,
  mockDeclarations,
  mockMessages,
  mockBlacklist,
  mockAirspaces,
  materialTemplates,
} from '@/data/mockData';
import { generateId, formatDate } from '@/utils';

interface AppState {
  user: User;
  aircraft: Aircraft[];
  declarations: Declaration[];
  messages: Message[];
  blacklist: BlacklistRecord[];
  airspaces: AirspaceInfo[];
  currentDeclarationId: string | null;
  sidebarCollapsed: boolean;

  setCurrentDeclaration: (id: string | null) => void;
  toggleSidebar: () => void;
  markMessageAsRead: (messageId: string) => void;
  markAllMessagesAsRead: () => void;
  deleteMessage: (messageId: string) => void;
  getUnreadMessageCount: () => number;
  addMessage: (message: Omit<Message, 'id' | 'userId' | 'createdAt' | 'read'>) => void;

  addDeclaration: (declaration: Omit<Declaration, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'materials'>) => string;
  updateDeclaration: (id: string, updates: Partial<Declaration>) => void;
  deleteDeclaration: (id: string) => void;
  getDeclarationById: (id: string) => Declaration | undefined;
  getCurrentDeclaration: () => Declaration | undefined;

  updateFlightPlan: (declarationId: string, flightPlan: Omit<FlightPlan, 'id' | 'declarationId'>) => void;

  addMaterial: (declarationId: string, material: Omit<Material, 'id' | 'declarationId' | 'uploadedAt'>) => void;
  removeMaterial: (declarationId: string, materialId: string) => void;
  getMissingRequiredMaterials: (declarationId: string) => string[];

  submitDeclaration: (id: string) => void;
  saveAsDraft: (declaration: Omit<Declaration, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status' | 'materials'> & { materials?: Material[] }) => string;
  requestCorrection: (id: string, opinion: string) => void;
  resubmitAfterCorrection: (id: string) => void;
  requestChange: (id: string, reason: string) => void;
  acceptChange: (id: string) => void;
  requestChangeSupplement: (id: string, opinion: string) => void;
  approveChange: (id: string, opinion: string) => void;
  rejectChange: (id: string, opinion: string) => void;
  requestRevocation: (id: string, reason: string) => void;
  approveDeclaration: (id: string) => void;
  rejectDeclaration: (id: string, opinion: string) => void;

  addAircraft: (aircraft: Omit<Aircraft, 'id' | 'userId' | 'boundAt'>) => void;
  updateAircraft: (id: string, updates: Partial<Aircraft>) => void;
  removeAircraft: (id: string) => void;
  unbindAircraft: (id: string) => void;
  getAvailableAircraft: () => Aircraft[];

  addEnterpriseMaterial: (material: Omit<EnterpriseMaterial, 'id' | 'uploadedAt' | 'status'>) => void;
  removeEnterpriseMaterial: (materialId: string) => void;

  updateUser: (updates: Partial<User>) => void;
  isBlacklisted: () => boolean;
  getBlacklistRecord: () => BlacklistRecord | undefined;

  isAirspaceProhibited: (airspaceId: string) => boolean;
  generateLicence: (declarationId: string) => LicenceData | null;
  downloadLicence: (declarationId: string) => void;

  autoGenerateMessages: () => void;
}

const createInitialReviewSteps = (declarationId: string): ReviewStep[] => [
  {
    id: generateId(),
    declarationId,
    stepName: '材料初审',
    stepOrder: 1,
    status: 'pending',
  },
  {
    id: generateId(),
    declarationId,
    stepName: '空域审核',
    stepOrder: 2,
    status: 'pending',
  },
  {
    id: generateId(),
    declarationId,
    stepName: '安全评估',
    stepOrder: 3,
    status: 'pending',
  },
  {
    id: generateId(),
    declarationId,
    stepName: '最终审批',
    stepOrder: 4,
    status: 'pending',
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  user: mockUser,
  aircraft: mockAircraft,
  declarations: mockDeclarations,
  messages: mockMessages,
  blacklist: mockBlacklist,
  airspaces: mockAirspaces,
  currentDeclarationId: null,
  sidebarCollapsed: false,

  setCurrentDeclaration: (id) => set({ currentDeclarationId: id }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  markMessageAsRead: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ),
    })),

  markAllMessagesAsRead: () =>
    set((state) => ({
      messages: state.messages.map((msg) => ({ ...msg, read: true })),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),

  getUnreadMessageCount: () => {
    const { messages } = get();
    return messages.filter((m) => !m.read).length;
  },

  addMessage: (message) => {
    const { user } = get();
    const newMessage: Message = {
      ...message,
      id: generateId(),
      userId: user.id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      messages: [newMessage, ...state.messages],
    }));
  },

  addDeclaration: (declaration) => {
    const { user } = get();
    const id = generateId();
    const newDeclaration: Declaration = {
      ...declaration,
      id,
      userId: user.id,
      materials: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      declarations: [...state.declarations, newDeclaration],
      currentDeclarationId: id,
    }));
    return id;
  },

  updateDeclaration: (id, updates) =>
    set((state) => ({
      declarations: state.declarations.map((dec) =>
        dec.id === id ? { ...dec, ...updates, updatedAt: new Date().toISOString() } : dec
      ),
    })),

  deleteDeclaration: (id) =>
    set((state) => ({
      declarations: state.declarations.filter((dec) => dec.id !== id),
      currentDeclarationId: state.currentDeclarationId === id ? null : state.currentDeclarationId,
    })),

  getDeclarationById: (id) => {
    const { declarations } = get();
    return declarations.find((dec) => dec.id === id);
  },

  getCurrentDeclaration: () => {
    const { declarations, currentDeclarationId } = get();
    return declarations.find((dec) => dec.id === currentDeclarationId);
  },

  updateFlightPlan: (declarationId, flightPlan) => {
    const { updateDeclaration } = get();
    updateDeclaration(declarationId, {
      flightPlan: {
        ...flightPlan,
        id: generateId(),
        declarationId,
      },
    });
  },

  addMaterial: (declarationId, material) => {
    const newMaterial: Material = {
      ...material,
      id: generateId(),
      declarationId,
      uploadedAt: new Date().toISOString(),
    };
    set((state) => ({
      declarations: state.declarations.map((dec) =>
        dec.id === declarationId
          ? { ...dec, materials: [...dec.materials, newMaterial], updatedAt: new Date().toISOString() }
          : dec
      ),
    }));
  },

  removeMaterial: (declarationId, materialId) =>
    set((state) => ({
      declarations: state.declarations.map((dec) =>
        dec.id === declarationId
          ? { ...dec, materials: dec.materials.filter((m) => m.id !== materialId), updatedAt: new Date().toISOString() }
          : dec
      ),
    })),

  getMissingRequiredMaterials: (declarationId) => {
    const declaration = get().getDeclarationById(declarationId);
    if (!declaration) return [];
    const uploadedTypes = declaration.materials.map((m) => m.type);
    return materialTemplates
      .filter((t) => t.required && !uploadedTypes.includes(t.type))
      .map((t) => t.name);
  },

  submitDeclaration: (id) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const reviewSteps = createInitialReviewSteps(id);
    reviewSteps[0].status = 'processing';

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'submit',
      title: '提交申报',
      operator: '申请人',
      operatedAt: new Date().toISOString(),
    };

    updateDeclaration(id, {
      status: 'reviewing',
      submittedAt: new Date().toISOString(),
      reviewSteps,
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'review',
      title: '申报已提交',
      content: `您的"${declaration.title}"申报已成功提交，正在等待材料初审。`,
      declarationId: id,
    });
  },

  saveAsDraft: (declaration) => {
    const { user, addDeclaration, updateDeclaration } = get();
    const id = generateId();
    const newDeclaration: Declaration = {
      ...declaration,
      id,
      userId: user.id,
      status: 'draft',
      materials: declaration.materials || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      declarations: [...state.declarations, newDeclaration],
      currentDeclarationId: id,
    }));
    return id;
  },

  requestCorrection: (id, opinion) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const reviewSteps = declaration.reviewSteps?.map((step, index) =>
      index === 0
        ? { ...step, status: 'rejected' as const, opinion, reviewer: '审核员', reviewedAt: new Date().toISOString() }
        : step
    ) || createInitialReviewSteps(id);

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'correction_request',
      title: '要求补正材料',
      operator: '审核员',
      operatedAt: new Date().toISOString(),
      opinion,
    };

    updateDeclaration(id, {
      status: 'correction',
      reviewSteps,
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'review',
      title: '申报需要补正',
      content: `您的"${declaration.title}"申报需要补充材料：${opinion}。请及时补正后重新提交。`,
      declarationId: id,
    });
  },

  resubmitAfterCorrection: (id) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const reviewSteps = declaration.reviewSteps?.map((step) => ({
      ...step,
      status: step.stepOrder === 1 ? 'processing' as const : 'pending' as const,
    })) || createInitialReviewSteps(id);

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'correction_submit',
      title: '补正材料重新提交',
      operator: '申请人',
      operatedAt: new Date().toISOString(),
    };

    updateDeclaration(id, {
      status: 'reviewing',
      reviewSteps,
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'review',
      title: '补正材料已提交',
      content: `您的"${declaration.title}"补正材料已提交，正在重新审核。`,
      declarationId: id,
    });
  },

  requestChange: (id, reason) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const changeRecord: ChangeRecord = {
      id: generateId(),
      declarationId: id,
      reason,
      status: 'requested',
      requestedAt: new Date().toISOString(),
    };

    const existingChanges = declaration.changeRecords || [];

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'change_request',
      title: '提交变更申请',
      description: reason,
      operator: '申请人',
      operatedAt: new Date().toISOString(),
    };

    updateDeclaration(id, {
      status: 'changing',
      changeReason: reason,
      changeRequestedAt: new Date().toISOString(),
      changeRecords: [...existingChanges, changeRecord],
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'change',
      title: '变更申请已提交',
      content: `您的"${declaration.title}"变更申请已提交，原因：${reason}。请等待审核。`,
      declarationId: id,
    });
  },

  acceptChange: (id) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const changeRecords = declaration.changeRecords?.map((cr) =>
      cr.status === 'requested'
        ? { ...cr, status: 'reviewing' as const, acceptedAt: new Date().toISOString() }
        : cr
    );

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'change_accept',
      title: '受理变更申请',
      operator: '审核员',
      operatedAt: new Date().toISOString(),
    };

    updateDeclaration(id, {
      status: 'change_reviewing',
      changeRecords,
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'change',
      title: '变更申请已受理',
      content: `您的"${declaration.title}"变更申请已受理，正在审核中。`,
      declarationId: id,
    });
  },

  requestChangeSupplement: (id, opinion) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const changeRecords = declaration.changeRecords?.map((cr) =>
      cr.status === 'reviewing'
        ? { ...cr, status: 'supplement' as const, opinion }
        : cr
    );

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'change_supplement',
      title: '要求补充变更说明',
      operator: '审核员',
      operatedAt: new Date().toISOString(),
      opinion,
    };

    updateDeclaration(id, {
      status: 'change_reviewing',
      changeRecords,
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'change',
      title: '变更申请需补充说明',
      content: `您的"${declaration.title}"变更申请需要补充说明：${opinion}。`,
      declarationId: id,
    });
  },

  approveChange: (id, opinion) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const changeRecords = declaration.changeRecords?.map((cr) =>
      cr.status === 'reviewing' || cr.status === 'supplement'
        ? {
            ...cr,
            status: 'approved' as const,
            processedAt: new Date().toISOString(),
            processor: '审核员',
            opinion,
            result: 'approved' as const,
          }
        : cr
    );

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'change_approve',
      title: '变更申请通过',
      operator: '审核员',
      operatedAt: new Date().toISOString(),
      opinion,
    };

    updateDeclaration(id, {
      status: 'change_approved',
      changeRecords,
      lastChangeResult: 'approved',
      lastChangeProcessedAt: new Date().toISOString(),
      lastChangeProcessor: '审核员',
      lastChangeOpinion: opinion,
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'change',
      title: '变更申请已通过',
      content: `您的"${declaration.title}"变更申请已通过。处理意见：${opinion}`,
      declarationId: id,
    });
  },

  rejectChange: (id, opinion) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const changeRecords = declaration.changeRecords?.map((cr) =>
      cr.status === 'reviewing' || cr.status === 'supplement' || cr.status === 'requested'
        ? {
            ...cr,
            status: 'rejected' as const,
            processedAt: new Date().toISOString(),
            processor: '审核员',
            opinion,
            result: 'rejected' as const,
          }
        : cr
    );

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'change_reject',
      title: '变更申请驳回',
      operator: '审核员',
      operatedAt: new Date().toISOString(),
      opinion,
    };

    updateDeclaration(id, {
      status: 'change_rejected',
      changeRecords,
      lastChangeResult: 'rejected',
      lastChangeProcessedAt: new Date().toISOString(),
      lastChangeProcessor: '审核员',
      lastChangeOpinion: opinion,
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'change',
      title: '变更申请已驳回',
      content: `您的"${declaration.title}"变更申请已被驳回。驳回原因：${opinion}`,
      declarationId: id,
    });
  },

  requestRevocation: (id, reason) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'revoke',
      title: '撤销申报',
      description: reason,
      operator: '申请人',
      operatedAt: new Date().toISOString(),
    };

    updateDeclaration(id, {
      status: 'revoked',
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'review',
      title: '撤销申请已提交',
      content: `您的"${declaration.title}"已撤销，原因：${reason}。`,
      declarationId: id,
    });
  },

  approveDeclaration: (id) => {
    const { updateDeclaration, addMessage, getDeclarationById, generateLicence } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const reviewSteps = declaration.reviewSteps?.map((step) => ({
      ...step,
      status: 'completed' as const,
      opinion: '审核通过',
      reviewer: '审核员',
      reviewedAt: new Date().toISOString(),
    })) || createInitialReviewSteps(id);

    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + 90);

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'approve',
      title: '审核通过',
      operator: '审核员',
      operatedAt: new Date().toISOString(),
      opinion: '审核通过',
    };

    updateDeclaration(id, {
      status: 'approved',
      reviewSteps,
      approvedAt: now.toISOString(),
      licenceExpiry: expiryDate.toISOString(),
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    const licence = generateLicence(id);

    addMessage({
      type: 'review',
      title: '申报已通过',
      content: `恭喜！您的"${declaration.title}"已通过审核，许可编号：${licence?.licenceNo || 'FLY-' + id.toUpperCase()}。请及时下载许可文件。`,
      declarationId: id,
    });
  },

  rejectDeclaration: (id, opinion) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    const reviewSteps = declaration.reviewSteps?.map((step) => ({
      ...step,
      status: step.stepOrder === 4 ? 'rejected' as const : step.status,
      opinion,
      reviewer: '审核员',
      reviewedAt: new Date().toISOString(),
    })) || createInitialReviewSteps(id);

    const disposalRecord: DisposalRecord = {
      id: generateId(),
      declarationId: id,
      type: 'reject',
      title: '审核驳回',
      operator: '审核员',
      operatedAt: new Date().toISOString(),
      opinion,
    };

    updateDeclaration(id, {
      status: 'rejected',
      reviewSteps,
      disposalRecords: [...(declaration.disposalRecords || []), disposalRecord],
    });

    addMessage({
      type: 'review',
      title: '申报已驳回',
      content: `很抱歉，您的"${declaration.title}"未能通过审核。驳回原因：${opinion}。如有疑问请联系监管部门。`,
      declarationId: id,
    });
  },

  addAircraft: (aircraft) => {
    const { user } = get();
    const newAircraft: Aircraft = {
      ...aircraft,
      id: generateId(),
      userId: user.id,
      boundAt: new Date().toISOString(),
    };
    set((state) => ({
      aircraft: [...state.aircraft, newAircraft],
    }));
  },

  updateAircraft: (id, updates) =>
    set((state) => ({
      aircraft: state.aircraft.map((ac) =>
        ac.id === id ? { ...ac, ...updates } : ac
      ),
    })),

  removeAircraft: (id) =>
    set((state) => ({
      aircraft: state.aircraft.filter((ac) => ac.id !== id),
    })),

  unbindAircraft: (id) =>
    set((state) => ({
      aircraft: state.aircraft.map((ac) =>
        ac.id === id ? { ...ac, status: 'unbound' as const } : ac
      ),
    })),

  getAvailableAircraft: () => {
    const { aircraft } = get();
    return aircraft.filter((ac) => ac.status === 'bound');
  },

  addEnterpriseMaterial: (material) => {
    const { updateUser, user } = get();
    const newMaterial: EnterpriseMaterial = {
      ...material,
      id: generateId(),
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
    };
    const currentMaterials = user.enterpriseMaterials || [];
    updateUser({
      enterpriseMaterials: [...currentMaterials, newMaterial],
    });
  },

  removeEnterpriseMaterial: (materialId) => {
    const { updateUser, user } = get();
    const currentMaterials = user.enterpriseMaterials || [];
    updateUser({
      enterpriseMaterials: currentMaterials.filter((m) => m.id !== materialId),
    });
  },

  updateUser: (updates) =>
    set((state) => ({
      user: { ...state.user, ...updates },
    })),

  isBlacklisted: () => {
    const { user, blacklist } = get();
    return blacklist.some(
      (bl) => bl.idCard === user.idCard && bl.status === 'active'
    );
  },

  getBlacklistRecord: () => {
    const { user, blacklist } = get();
    return blacklist.find((bl) => bl.idCard === user.idCard && bl.status === 'active');
  },

  isAirspaceProhibited: (airspaceId) => {
    const { airspaces } = get();
    const airspace = airspaces.find((a) => a.id === airspaceId);
    return airspace?.type === 'prohibited';
  },

  generateLicence: (declarationId) => {
    const { getDeclarationById, aircraft, user } = get();
    const declaration = getDeclarationById(declarationId);
    if (!declaration || declaration.status !== 'approved' || !declaration.flightPlan) return null;

    const aircraftModels = declaration.flightPlan.aircraftIds
      .map((id) => aircraft.find((ac) => ac.id === id)?.model)
      .filter(Boolean) as string[];

    const licence: LicenceData = {
      declarationId: declaration.id,
      declarationTitle: declaration.title,
      airspaceName: declaration.flightPlan.airspaceName,
      altitudeMin: declaration.flightPlan.altitudeMin,
      altitudeMax: declaration.flightPlan.altitudeMax,
      startTime: declaration.flightPlan.startTime,
      endTime: declaration.flightPlan.endTime,
      aircraftModels,
      applicant: user.name,
      licenceNo: `FK-${declaration.id.slice(-8).toUpperCase()}`,
      issuedAt: declaration.approvedAt || new Date().toISOString(),
      expiryAt: declaration.licenceExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return licence;
  },

  downloadLicence: (declarationId) => {
    const { generateLicence } = get();
    const licence = generateLicence(declarationId);
    if (!licence) return;

    const content = `
═══════════════════════════════════════════════
          低空飞行作业许可证书
═══════════════════════════════════════════════

许可证编号：${licence.licenceNo}
申请人：${licence.applicant}

申报信息：
  申报编号：${licence.declarationId}
  任务名称：${licence.declarationTitle}

飞行信息：
  空域：${licence.airspaceName}
  高度范围：${licence.altitudeMin}m - ${licence.altitudeMax}m
  飞行时间：${formatDate(licence.startTime)} 至 ${formatDate(licence.endTime)}
  飞行器：${licence.aircraftModels.join('、')}

许可信息：
  签发日期：${formatDate(licence.issuedAt)}
  有效期至：${formatDate(licence.expiryAt)}

═══════════════════════════════════════════════
                    低空飞行监管部门
                        专用章
═══════════════════════════════════════════════

注意事项：
1. 请严格按照许可范围进行飞行作业
2. 飞行前请确认天气和空域状况
3. 遇紧急情况请立即降落并报告
4. 本许可不得转借、涂改、伪造
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `飞行许可证_${licence.licenceNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  autoGenerateMessages: () => {
  },
}));
