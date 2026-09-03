'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AcademicActivity,
  ExecutionReport,
  ExtractedEvent,
  AuditLog,
  AcademicDocument,
  ConfidenceThresholds,
  GranularityGroup,
  CandidateMatch
} from '../types';
import {
  INITIAL_ACADEMIC_ACTIVITIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOCUMENTS,
  INITIAL_GRANULARITY_GROUPS,
  INITIAL_REVIEW_QUEUE,
  INITIAL_UNMATCHED_QUEUE
} from '../lib/initialData';
import {
  DEFAULT_THRESHOLDS,
  extractEntitiesFromRawReport,
  scoreCandidates,
  evaluateDecision
} from '../lib/aiEngine';

interface AppContextType {
  // State
  activities: AcademicActivity[];
  executionReports: ExecutionReport[];
  reviewQueue: ExtractedEvent[];
  unmatchedQueue: ExtractedEvent[];
  auditLogs: AuditLog[];
  documents: AcademicDocument[];
  thresholds: ConfidenceThresholds;
  granularityGroups: GranularityGroup[];
  activeEvent: ExtractedEvent | null;
  notification: { message: string; type: 'success' | 'info' | 'warning' } | null;
  userRole: string;

  // Actions
  setActiveEvent: (event: ExtractedEvent | null) => void;
  submitExecutionReport: (data: {
    course: string;
    unit_topic: string;
    planned_date: string;
    actual_date: string;
    raw_content: string;
    delivery_mode: any;
    resources_used: string;
    remarks: string;
    class_section?: string;
  }) => ExtractedEvent;
  approveReviewEvent: (eventId: string, chosenActivityId?: string) => void;
  rejectReviewEvent: (eventId: string, reason?: string) => void;
  mapUnmatchedManually: (eventId: string, targetActivityId: string) => void;
  addUnmatchedAsExtraActivity: (eventId: string, title?: string) => void;
  rejectUnmatchedActivity: (eventId: string) => void;
  updateThresholds: (thresholds: ConfidenceThresholds) => void;
  setUserRole: (role: string) => void;
  resetDemoData: () => void;
  triggerDemoPreset: (preset: 'high_linked_lists' | 'medium_sql' | 'low_placement') => ExtractedEvent;
  dismissNotification: () => void;
  showNotification: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<AcademicActivity[]>(INITIAL_ACADEMIC_ACTIVITIES);
  const [executionReports, setExecutionReports] = useState<ExecutionReport[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ExtractedEvent[]>(INITIAL_REVIEW_QUEUE);
  const [unmatchedQueue, setUnmatchedQueue] = useState<ExtractedEvent[]>(INITIAL_UNMATCHED_QUEUE);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [documents, setDocuments] = useState<AcademicDocument[]>(INITIAL_DOCUMENTS);
  const [thresholds, setThresholds] = useState<ConfidenceThresholds>(DEFAULT_THRESHOLDS);
  const [granularityGroups, setGranularityGroups] = useState<GranularityGroup[]>(INITIAL_GRANULARITY_GROUPS);
  const [activeEvent, setActiveEvent] = useState<ExtractedEvent | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [userRole, setUserRole] = useState<string>('HOD');

  // Load from LocalStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedActivities = localStorage.getItem('af_activities');
      if (savedActivities) {
        try { setActivities(JSON.parse(savedActivities)); } catch (e) {}
      }
      const savedLogs = localStorage.getItem('af_audit_logs');
      if (savedLogs) {
        try { setAuditLogs(JSON.parse(savedLogs)); } catch (e) {}
      }
    }
  }, []);

  // Sync to LocalStorage on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('af_activities', JSON.stringify(activities));
      localStorage.setItem('af_audit_logs', JSON.stringify(auditLogs));
    }
  }, [activities, auditLogs]);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  };

  const dismissNotification = () => setNotification(null);

  const submitExecutionReport = (data: {
    course: string;
    unit_topic: string;
    planned_date: string;
    actual_date: string;
    raw_content: string;
    delivery_mode: any;
    resources_used: string;
    remarks: string;
    class_section?: string;
  }): ExtractedEvent => {
    const reportId = `rep-${Date.now().toString().slice(-4)}`;
    const newReport: ExecutionReport = {
      id: reportId,
      report_id: reportId,
      course: data.course,
      unit_topic: data.unit_topic,
      planned_date: data.planned_date || new Date().toISOString().split('T')[0],
      actual_date: data.actual_date || new Date().toISOString().split('T')[0],
      raw_content: data.raw_content,
      delivery_mode: data.delivery_mode || 'Classroom',
      resources_used: data.resources_used || 'Presentation & Chalkboard',
      remarks: data.remarks || '',
      submitted_by: 'Prof. Kumar',
      submitted_at: new Date().toISOString(),
      class_section: data.class_section || 'CSE-C',
      status: 'Processed',
    };

    setExecutionReports((prev) => [newReport, ...prev]);

    // 1. AI Extraction
    const extracted = extractEntitiesFromRawReport(data.raw_content, {
      course: data.course,
      unit: data.unit_topic,
      class_section: data.class_section,
      date: data.actual_date,
      faculty: 'Prof. Kumar',
    });

    // 2. Candidate Retrieval & Scoring
    const candidates = scoreCandidates(extracted, activities, thresholds);

    // 3. Decision Engine
    const decision = evaluateDecision(candidates, thresholds);

    const eventId = `evt-${Date.now().toString().slice(-4)}`;
    const newExtractedEvent: ExtractedEvent = {
      id: eventId,
      report_id: reportId,
      raw_text: data.raw_content,
      activity_description: extracted.activity_description,
      department: extracted.department,
      course: extracted.course,
      unit: extracted.unit,
      class_section: extracted.class_section,
      faculty: extracted.faculty,
      event_date: extracted.event_date,
      delivery_mode: data.delivery_mode || 'Classroom',
      status: decision.status,
      confidence_score: decision.confidence_score,
      candidates,
      matched_activity_id: decision.matched_activity_id,
      decision_type: decision.decision_type,
      timestamp: new Date().toISOString(),
      processing_stages: {
        raw_received: true,
        extracted: true,
        normalized: true,
        candidates_retrieved: true,
        semantic_scored: true,
        decision_made: true,
      },
    };

    setActiveEvent(newExtractedEvent);

    // If AUTO_LINKED: Update master academic plan activity directly!
    if (decision.status === 'AUTO_LINKED' && decision.matched_activity_id) {
      setActivities((prev) =>
        prev.map((act) => {
          if (act.activity_id === decision.matched_activity_id) {
            const planStart = new Date(act.planned_start).getTime();
            const actDate = new Date(data.actual_date || new Date()).getTime();
            const diffDays = Math.round((actDate - planStart) / (1000 * 3600 * 24));
            const devDays = Math.max(0, diffDays);

            return {
              ...act,
              status: 'Completed',
              completion_percentage: 100,
              actual_start: data.actual_date,
              actual_end: data.actual_date,
              actual_content: data.raw_content,
              actual_sessions: (act.actual_sessions || act.planned_sessions) || 1,
              deviation_days: devDays,
              deviation_status: devDays === 0 ? 'On Track' : 'Delayed',
              linked_event_ids: [...(act.linked_event_ids || []), eventId],
            };
          }
          return act;
        })
      );

      // Audit Log for Auto-Link
      const bestCand = candidates[0];
      const newAudit: AuditLog = {
        id: `aud-${Date.now().toString().slice(-4)}`,
        event_id: eventId,
        report_id: reportId,
        activity_id: bestCand.activity_id,
        source: 'Faculty Execution Report',
        source_excerpt: data.raw_content,
        extracted_data: {
          activity: extracted.activity_description,
          course: extracted.course,
          class_section: extracted.class_section,
          date: extracted.event_date,
        },
        candidate_activities: candidates.map((c) => `${c.activity_id}: ${c.activity_name} (${c.final_confidence}%)`),
        confidence_score: decision.confidence_score,
        decision: `AI Engine Auto-linked to ${bestCand.activity_id} (${bestCand.activity_name})`,
        decision_type: 'AUTO_LINKED',
        performed_by: 'AcademicFlow AI Semantic Matcher',
        timestamp: new Date().toISOString(),
        previous_value: 'Status: Planned, Progress: 0%',
        new_value: 'Status: Completed, Progress: 100%, Deviation: On Track',
      };

      setAuditLogs((prev) => [newAudit, ...prev]);
      showNotification(`Auto-linked "${extracted.activity_description}" with ${decision.confidence_score}% confidence!`, 'success');
    } else if (decision.status === 'REVIEW_REQUIRED') {
      // Add to Review Queue
      setReviewQueue((prev) => [newExtractedEvent, ...prev]);
      showNotification(`Report sent to Human Review Queue (Confidence: ${decision.confidence_score}%)`, 'warning');
    } else {
      // Unmatched
      setUnmatchedQueue((prev) => [newExtractedEvent, ...prev]);
      showNotification(`Report flagged as Unmatched Activity (Confidence: ${decision.confidence_score}%)`, 'warning');
    }

    return newExtractedEvent;
  };

  const approveReviewEvent = (eventId: string, chosenActivityId?: string) => {
    const event = reviewQueue.find((e) => e.id === eventId);
    if (!event) return;

    const targetId = chosenActivityId || event.matched_activity_id || event.candidates[0]?.activity_id;

    // Update Academic Activity
    setActivities((prev) =>
      prev.map((act) => {
        if (act.activity_id === targetId) {
          return {
            ...act,
            status: 'Completed',
            completion_percentage: 100,
            actual_start: event.event_date,
            actual_end: event.event_date,
            actual_content: event.raw_text,
            deviation_days: act.deviation_days || 0,
            deviation_status: act.deviation_days > 0 ? 'Delayed' : 'On Track',
            linked_event_ids: [...(act.linked_event_ids || []), eventId],
          };
        }
        return act;
      })
    );

    // Audit Log
    const newAudit: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      event_id: eventId,
      report_id: event.report_id,
      activity_id: targetId,
      source: 'Human Review Confirmation',
      source_excerpt: event.raw_text,
      extracted_data: {
        activity: event.activity_description,
        course: event.course,
        class_section: event.class_section,
        date: event.event_date,
      },
      candidate_activities: event.candidates.map((c) => `${c.activity_id}: ${c.activity_name} (${c.final_confidence}%)`),
      confidence_score: event.confidence_score,
      decision: `Human confirmed link to ${targetId}`,
      decision_type: 'HUMAN_CONFIRMED',
      performed_by: 'Dr. R. Sharma (HOD - CSE)',
      timestamp: new Date().toISOString(),
      previous_value: 'Status: In Review Queue',
      new_value: 'Status: Completed (Human Confirmed)',
    };

    setAuditLogs((prev) => [newAudit, ...prev]);
    setReviewQueue((prev) => prev.filter((e) => e.id !== eventId));
    showNotification(`Activity confirmed and linked to ${targetId}!`, 'success');
  };

  const rejectReviewEvent = (eventId: string, reason = 'Not aligned with course plan') => {
    const event = reviewQueue.find((e) => e.id === eventId);
    if (!event) return;

    const newAudit: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      event_id: eventId,
      report_id: event.report_id,
      activity_id: event.matched_activity_id,
      source: 'Human Review Rejection',
      source_excerpt: event.raw_text,
      extracted_data: {
        activity: event.activity_description,
        course: event.course,
        class_section: event.class_section,
        date: event.event_date,
      },
      candidate_activities: event.candidates.map((c) => `${c.activity_id}: ${c.activity_name} (${c.final_confidence}%)`),
      confidence_score: event.confidence_score,
      decision: `Human rejected: ${reason}`,
      decision_type: 'HUMAN_REJECTED',
      performed_by: 'Dr. R. Sharma (HOD - CSE)',
      timestamp: new Date().toISOString(),
      previous_value: 'Status: In Review Queue',
      new_value: 'Status: Rejected by Coordinator',
    };

    setAuditLogs((prev) => [newAudit, ...prev]);
    setReviewQueue((prev) => prev.filter((e) => e.id !== eventId));
    showNotification(`Activity match rejected.`, 'info');
  };

  const mapUnmatchedManually = (eventId: string, targetActivityId: string) => {
    const event = unmatchedQueue.find((e) => e.id === eventId);
    if (!event) return;

    setActivities((prev) =>
      prev.map((act) => {
        if (act.activity_id === targetActivityId) {
          return {
            ...act,
            status: 'Completed',
            completion_percentage: 100,
            actual_start: event.event_date,
            actual_end: event.event_date,
            actual_content: event.raw_text,
            linked_event_ids: [...(act.linked_event_ids || []), eventId],
          };
        }
        return act;
      })
    );

    const newAudit: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      event_id: eventId,
      report_id: event.report_id,
      activity_id: targetActivityId,
      source: 'Manual Mapping from Unmatched Queue',
      source_excerpt: event.raw_text,
      extracted_data: {
        activity: event.activity_description,
        course: event.course,
        class_section: event.class_section,
        date: event.event_date,
      },
      candidate_activities: event.candidates.map((c) => `${c.activity_id}: ${c.activity_name} (${c.final_confidence}%)`),
      confidence_score: event.confidence_score,
      decision: `Manually mapped to ${targetActivityId}`,
      decision_type: 'MANUALLY_MAPPED',
      performed_by: 'Dr. R. Sharma (HOD - CSE)',
      timestamp: new Date().toISOString(),
      previous_value: 'Status: Unmatched',
      new_value: `Status: Manually Mapped to ${targetActivityId}`,
    };

    setAuditLogs((prev) => [newAudit, ...prev]);
    setUnmatchedQueue((prev) => prev.filter((e) => e.id !== eventId));
    showNotification(`Activity manually mapped to ${targetActivityId}.`, 'success');
  };

  const addUnmatchedAsExtraActivity = (eventId: string, title?: string) => {
    const event = unmatchedQueue.find((e) => e.id === eventId);
    if (!event) return;

    const newActivityId = `CSE-EXTRA-${Date.now().toString().slice(-4)}`;
    const newAct: AcademicActivity = {
      id: `act-extra-${Date.now()}`,
      activity_id: newActivityId,
      activity_name: title || event.activity_description || 'Extra Co-Curricular Session',
      level: 'L5_Activity',
      department: event.department || 'Computer Science & Engineering',
      course: event.course || 'Special Co-Curricular',
      unit: 'Extra Unit',
      activity_type: 'Workshop',
      faculty: event.faculty || 'Special Speaker',
      class_section: event.class_section || 'CSE-All',
      location: 'Auditorium / Hybrid',
      planned_start: event.event_date,
      planned_end: event.event_date,
      actual_start: event.event_date,
      actual_end: event.event_date,
      planned_content: 'Added as extra academic/co-curricular activity',
      actual_content: event.raw_text,
      completion_percentage: 100,
      status: 'Completed',
      deviation_days: 0,
      deviation_status: 'On Track',
      planned_sessions: 1,
      actual_sessions: 1,
      historical_avg_sessions: 1,
      historical_variance_pct: 0,
    };

    setActivities((prev) => [newAct, ...prev]);

    const newAudit: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      event_id: eventId,
      report_id: event.report_id,
      activity_id: newActivityId,
      source: 'Created as New Extra Plan Activity',
      source_excerpt: event.raw_text,
      extracted_data: {
        activity: event.activity_description,
        course: event.course,
        class_section: event.class_section,
        date: event.event_date,
      },
      candidate_activities: [],
      confidence_score: event.confidence_score,
      decision: `Added as new Master Plan Activity (${newActivityId})`,
      decision_type: 'HUMAN_CONFIRMED',
      performed_by: 'Dr. R. Sharma (HOD - CSE)',
      timestamp: new Date().toISOString(),
      previous_value: 'Status: Unmatched',
      new_value: `Added as New Activity: ${newActivityId}`,
    };

    setAuditLogs((prev) => [newAudit, ...prev]);
    setUnmatchedQueue((prev) => prev.filter((e) => e.id !== eventId));
    showNotification(`Created and linked new activity ${newActivityId}!`, 'success');
  };

  const rejectUnmatchedActivity = (eventId: string) => {
    const event = unmatchedQueue.find((e) => e.id === eventId);
    if (!event) return;

    const newAudit: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      event_id: eventId,
      report_id: event.report_id,
      source: 'Unmatched Activity Marked Outside Scope',
      source_excerpt: event.raw_text,
      extracted_data: {
        activity: event.activity_description,
        course: event.course,
        class_section: event.class_section,
        date: event.event_date,
      },
      candidate_activities: [],
      confidence_score: event.confidence_score,
      decision: 'Marked Outside Academic Scope / Rejected',
      decision_type: 'HUMAN_REJECTED',
      performed_by: 'Dr. R. Sharma (HOD - CSE)',
      timestamp: new Date().toISOString(),
      previous_value: 'Status: Unmatched',
      new_value: 'Status: Rejected Outside Scope',
    };

    setAuditLogs((prev) => [newAudit, ...prev]);
    setUnmatchedQueue((prev) => prev.filter((e) => e.id !== eventId));
    showNotification(`Activity marked outside academic scope.`, 'info');
  };

  const updateThresholds = (newThresholds: ConfidenceThresholds) => {
    setThresholds(newThresholds);
    showNotification('Confidence thresholds & AI weights updated!', 'success');
  };

  const resetDemoData = () => {
    setActivities(INITIAL_ACADEMIC_ACTIVITIES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setReviewQueue(INITIAL_REVIEW_QUEUE);
    setUnmatchedQueue(INITIAL_UNMATCHED_QUEUE);
    setThresholds(DEFAULT_THRESHOLDS);
    setActiveEvent(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('af_activities');
      localStorage.removeItem('af_audit_logs');
    }
    showNotification('System demo data reset to initial baseline.', 'info');
  };

  const triggerDemoPreset = (preset: 'high_linked_lists' | 'medium_sql' | 'low_placement') => {
    if (preset === 'high_linked_lists') {
      return submitExecutionReport({
        course: 'Data Structures',
        unit_topic: 'Unit III: Linked Lists',
        planned_date: '2026-08-25',
        actual_date: '2026-08-25',
        raw_content: 'Finished linked lists today for CSE-C.',
        delivery_mode: 'Laboratory',
        resources_used: 'Lab PCs & Compiler',
        remarks: 'Implemented singly and doubly linked list insertion/deletion successfully.',
        class_section: 'CSE-C',
      });
    } else if (preset === 'medium_sql') {
      return submitExecutionReport({
        course: 'Database Management Systems',
        unit_topic: 'Unit 4: SQL Basics',
        planned_date: '2026-08-28',
        actual_date: '2026-08-28',
        raw_content: 'Did SQL practice today.',
        delivery_mode: 'Laboratory',
        resources_used: 'PostgreSQL Server',
        remarks: 'Practiced SELECT and aggregate queries.',
        class_section: 'CSE-B',
      });
    } else {
      return submitExecutionReport({
        course: 'Career Readiness & Soft Skills',
        unit_topic: 'Special Training',
        planned_date: '2026-09-01',
        actual_date: '2026-09-01',
        raw_content: 'Conducted placement aptitude training.',
        delivery_mode: 'Workshop',
        resources_used: 'Auditorium Projector & Handouts',
        remarks: 'Numerical aptitude and reasoning workshop for final years.',
        class_section: 'CSE-All',
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        activities,
        executionReports,
        reviewQueue,
        unmatchedQueue,
        auditLogs,
        documents,
        thresholds,
        granularityGroups,
        activeEvent,
        notification,
        userRole,
        setActiveEvent,
        submitExecutionReport,
        approveReviewEvent,
        rejectReviewEvent,
        mapUnmatchedManually,
        addUnmatchedAsExtraActivity,
        rejectUnmatchedActivity,
        updateThresholds,
        setUserRole,
        resetDemoData,
        triggerDemoPreset,
        dismissNotification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
