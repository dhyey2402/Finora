export interface AuditLog {
  id: number;
  company_id: number | null;
  user_id: number | null;
  action: string;
  table_name: string;
  record_id: number | null;
  details: Record<string, any> | null;
  timestamp: string;
}
