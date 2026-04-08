export type CaseStatus = 'pending' | 'active' | 'complete';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface InvestigationCase {
  id: string;
  employeeName: string;
  category: string;
  department: string;
  supervisor: string;
  caseNumber: string;
  dateOpened: string;
  status: CaseStatus;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'hr_insight_cases';

const SEED_CASES: InvestigationCase[] = [
  {
    id: 'case-4421',
    employeeName: 'Maria Rodriguez',
    category: 'Workplace Conduct',
    department: 'Operations',
    supervisor: 'Carlos Méndez',
    caseNumber: 'WM-4421',
    dateOpened: 'Mar 25, 2026',
    status: 'active',
    messages: [],
  },
  {
    id: 'case-3815',
    employeeName: 'Jorge Torres',
    category: 'Harassment',
    department: 'Field Services',
    supervisor: 'Ana Ortiz',
    caseNumber: 'WM-3815',
    dateOpened: 'Mar 22, 2026',
    status: 'pending',
    messages: [],
  },
  {
    id: 'case-3201',
    employeeName: 'Carmen Vélez',
    category: 'Attendance',
    department: 'Sales',
    supervisor: 'Luis Reyes',
    caseNumber: 'WM-3201',
    dateOpened: 'Mar 14, 2026',
    status: 'complete',
    messages: [],
  },
];

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function getCases(): InvestigationCase[] {
  if (!isClient()) return SEED_CASES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CASES));
      return SEED_CASES;
    }
    return JSON.parse(raw) as InvestigationCase[];
  } catch {
    return SEED_CASES;
  }
}

export function getCase(id: string): InvestigationCase | null {
  return getCases().find((c) => c.id === id) ?? null;
}

function saveCases(cases: InvestigationCase[]): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function createCase(
  data: Omit<InvestigationCase, 'id' | 'caseNumber' | 'dateOpened' | 'status' | 'messages'>
): InvestigationCase {
  const cases = getCases();
  const num = 4000 + cases.length + 1;
  const newCase: InvestigationCase = {
    ...data,
    id: `case-${num}`,
    caseNumber: `WM-${num}`,
    dateOpened: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    status: 'pending',
    messages: [],
  };
  saveCases([...cases, newCase]);
  return newCase;
}

export function addMessage(caseId: string, message: ChatMessage): void {
  const cases = getCases();
  const updated = cases.map((c) =>
    c.id === caseId ? { ...c, messages: [...c.messages, message] } : c
  );
  saveCases(updated);
}

export function updateMessages(caseId: string, messages: ChatMessage[]): void {
  const cases = getCases();
  const updated = cases.map((c) => (c.id === caseId ? { ...c, messages } : c));
  saveCases(updated);
}

export function updateStatus(caseId: string, status: CaseStatus): void {
  const cases = getCases();
  const updated = cases.map((c) => (c.id === caseId ? { ...c, status } : c));
  saveCases(updated);
}

export function getCaseStats(cases: InvestigationCase[]) {
  return {
    total: cases.length,
    pending: cases.filter((c) => c.status === 'pending').length,
    active: cases.filter((c) => c.status === 'active').length,
    complete: cases.filter((c) => c.status === 'complete').length,
  };
}
