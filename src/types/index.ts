export type ActivityStatus = 'Planned' | 'In Progress' | 'Completed' | 'Overdue' | 'Delayed' | 'Not Started';

export type ActivityLevel = 'L1_Semester' | 'L2_Department' | 'L3_Course' | 'L4_Unit' | 'L5_Activity' | 'L6_Session';

export type DecisionType = 'AUTO_LINKED' | 'HUMAN_CONFIRMED' | 'HUMAN_REJECTED' | 'UNMATCHED' | 'MANUALLY_MAPPED';

export type DeliveryMode = 'Classroom' | 'Laboratory' | 'Seminar' | 'Workshop' | 'Other';

export interface AcademicActivity {
  id: string;
  activity_id: string; // e.g. CSE-DSA-L5-0042
  activity_name: string;
  level: ActivityLevel;
  department: string;
  course: string;
  unit: string;
  activity_type: 'Lecture' | 'Practical' | 'Tutorial' | 'Assessment' | 'Guest Lecture' | 'Workshop' | 'Seminar';
  faculty: string;
  class_section: string;
  location: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  planned_content: string;
  actual_content?: string;
  completion_percentage: number;
  status: ActivityStatus;
  deviation_days: number; // positive = delayed, 0 = on track, negative = ahead
  deviation_status: 'On Track' | 'Delayed' | 'Ahead' | 'Not Started';
  planned_sessions: number;
  actual_sessions?: number;
  historical_avg_sessions: number;
  historical_variance_pct: number;
  linked_event_ids?: string[];
  notes?: string;
}

export interface ExecutionReport {
  id: string;
  report_id: string;
  course: string;
  unit_topic: string;
  planned_date: string;
  actual_date: string;
  raw_content: string;
  delivery_mode: DeliveryMode;
  resources_used: string;
  remarks: string;
  submitted_by: string;
  submitted_at: string;
  class_section: string;
  status: 'Draft' | 'Submitted' | 'Processed';
}

export interface CandidateMatch {
  activity_id: string;
  activity_name: string;
  course: string;
  unit: string;
  semantic_score: number; // 0..100
  course_score: number;   // 0..100
  class_score: number;    // 0..100
  context_score: number;  // 0..100
  final_confidence: number; // 0..100
  match_explanation: string;
}

export interface ExtractedEvent {
  id: string;
  report_id: string;
  raw_text: string;
  activity_description: string;
  department: string;
  course: string;
  unit: string;
  class_section: string;
  faculty: string;
  location?: string;
  event_date: string;
  delivery_mode: DeliveryMode;
  status: 'PENDING' | 'AUTO_LINKED' | 'REVIEW_REQUIRED' | 'UNMATCHED' | 'CONFIRMED' | 'REJECTED';
  confidence_score: number;
  candidates: CandidateMatch[];
  matched_activity_id?: string;
  decision_type?: DecisionType;
  approved_by?: string;
  timestamp: string;
  processing_stages?: {
    raw_received: boolean;
    extracted: boolean;
    normalized: boolean;
    candidates_retrieved: boolean;
    semantic_scored: boolean;
    decision_made: boolean;
  };
}

export interface AuditLog {
  id: string;
  event_id: string;
  report_id: string;
  activity_id?: string;
  source: string;
  source_excerpt: string;
  extracted_data: {
    activity: string;
    course?: string;
    class_section?: string;
    date: string;
  };
  candidate_activities: string[];
  confidence_score: number;
  decision: string;
  decision_type: DecisionType;
  performed_by: string;
  timestamp: string;
  previous_value?: string;
  new_value?: string;
  notes?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: {
    document_name: string;
    section: string;
    snippet: string;
  }[];
  structured_data?: any;
}

export interface AcademicDocument {
  id: string;
  title: string;
  category: 'Academic Plan' | 'Course Plan' | 'Department Schedule' | 'Lab Schedule' | 'AICTE Report' | 'Execution Log';
  department: string;
  course?: string;
  file_name: string;
  file_size: string;
  upload_date: string;
  uploaded_by: string;
  status: 'Indexed' | 'Pending' | 'Processed';
  version: string;
}

export interface ConfidenceThresholds {
  auto_link_threshold: number; // default 90
  review_threshold: number;    // default 50
  weights: {
    semantic: number;  // 0.55
    course: number;    // 0.20
    class: number;     // 0.15
    context: number;   // 0.10
  };
}

export interface GranularityGroup {
  planned_activity_id: string;
  planned_activity_name: string;
  course: string;
  unit: string;
  target_sessions: number;
  executed_sessions: number;
  execution_events: {
    id: string;
    sub_topic: string;
    faculty: string;
    date: string;
    duration: string;
    notes: string;
  }[];
}
