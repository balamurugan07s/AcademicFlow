import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status: string): { bg: string; text: string; border: string; dot: string } {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'auto_linked':
    case 'human_confirmed':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700 font-semibold',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'in progress':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700 font-semibold',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'delayed':
    case 'review_required':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700 font-semibold',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'overdue':
    case 'human_rejected':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700 font-semibold',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'unmatched':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700 font-semibold',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'on track':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700 font-semibold',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-600 font-medium',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getDeviationBadge(deviationDays: number, status: string): { label: string; badgeClass: string } {
  if (status === 'Not Started' || status === 'Planned') {
    return { label: '—', badgeClass: 'text-slate-400 font-normal' };
  }
  if (deviationDays <= 0) {
    return { label: 'On Track', badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium text-xs' };
  }
  return { label: `+${deviationDays} Days`, badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium text-xs' };
}
