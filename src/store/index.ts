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
  requestCorrection: (id: string) => void;
  resubmitAfterCorrection: (id: string) => void;
  requestChange: (id: string, reason: string) => void;
  requestRevocation: (id: string, reason: string) => void;

  addAircraft: (aircraft: Omit<Aircraft, 'id' | 'userId' | 'boundAt'>) => void;
  updateAircraft: (id: string, updates: Partial<Aircraft>) => void;
  removeAircraft: (id: string) => void;
  getAvailableAircraft: () => Aircraft[];

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

    updateDeclaration(id, {
      status: 'reviewing',
      submittedAt: new Date().toISOString(),
      reviewSteps,
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

  requestCorrection: (id) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    updateDeclaration(id, { status: 'correction' });

    addMessage({
      type: 'review',
      title: '申报需要补正',
      content: `您的"${declaration.title}"申报需要补充材料，请及时补正后重新提交。`,
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

    updateDeclaration(id, {
      status: 'reviewing',
      reviewSteps,
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

    updateDeclaration(id, { status: 'reviewing' });

    addMessage({
      type: 'review',
      title: '变更申请已提交',
      content: `您的"${declaration.title}"变更申请已提交，原因：${reason}。请等待审核。`,
      declarationId: id,
    });
  },

  requestRevocation: (id, reason) => {
    const { updateDeclaration, addMessage, getDeclarationById } = get();
    const declaration = getDeclarationById(id);
    if (!declaration) return;

    updateDeclaration(id, { status: 'revoked' });

    addMessage({
      type: 'review',
      title: '撤销申请已提交',
      content: `您的"${declaration.title}"已撤销，原因：${reason}。`,
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

  getAvailableAircraft: () => {
    const { aircraft } = get();
    return aircraft.filter((ac) => ac.status === 'bound');
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
