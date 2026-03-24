import React, { useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CRUDPage } from '../../components/crudPage.tsx';
import { TaskForm } from '../../components/forms/taskForm.tsx';
import { Users, Calendar, AlertCircle } from 'lucide-react';

interface Assignee {
  id: string;
  name: string;
}

interface Task {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  task_type: 'installation' | 'maintenance' | 'complaint' | 'recovery';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  assignees: Assignee[];
  assigned_to: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

const TaskManagement: React.FC = () => {
  useEffect(() => {
    document.title = "Task Management | Net Khata";
  }, []);

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'installation': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'maintenance': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'complaint': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'recovery': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'critical': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        header: 'Task Type',
        accessorKey: 'task_type',
        cell: info => {
          const value = info.getValue() as string | null;
          if (!value) return <span className="text-slate-400">-</span>;
          return (
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border ${getTaskTypeColor(value)}`}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          );
        },
      },
      {
        header: 'Customer',
        accessorKey: 'customer_name',
        cell: info => (
          <span className="text-[13px] text-slate-700">
            {(info.getValue() as string) || '-'}
          </span>
        ),
      },
      {
        header: 'Priority',
        accessorKey: 'priority',
        cell: info => {
          const value = info.getValue() as string | null;
          if (!value) return <span className="text-slate-400">-</span>;
          return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded border ${getPriorityColor(value)}`}>
              <AlertCircle className="h-3.5 w-3.5" />
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          );
        },
      },
      {
        header: 'Due Date',
        accessorKey: 'due_date',
        cell: info => {
          const value = info.getValue() as string | null;
          if (!value) return <span className="text-slate-400">-</span>;
          const date = new Date(value);
          return (
            <div className="flex items-center gap-1.5 text-[13px] text-slate-600 tabular-nums">
              <Calendar className="h-4 w-4 text-slate-400" />
              {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: info => {
          const value = info.getValue() as string | null;
          if (!value) return <span className="text-slate-400">-</span>;
          return (
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border ${getStatusColor(value)}`}>
              {value.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          );
        },
      },
      {
        header: 'Assigned To',
        accessorKey: 'assignees',
        cell: info => {
          const assignees = info.getValue() as Assignee[] | null;
          if (!assignees || assignees.length === 0) return <span className="text-slate-400">-</span>;
          return (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-[13px] text-slate-600">
                {assignees.length === 1
                  ? assignees[0].name
                  : `${assignees[0].name} +${assignees.length - 1}`}
              </span>
            </div>
          );
        },
      },
      {
        header: 'Created',
        accessorKey: 'created_at',
        cell: info => {
          const value = info.getValue() as string | null;
          if (!value) return <span className="text-slate-400">-</span>;
          return <span className="text-[13px] text-slate-600 tabular-nums">{new Date(value).toLocaleDateString()}</span>;
        },
      },
    ],
    []
  );

  return (
    <CRUDPage<Task>
      title="Task"
      endpoint="tasks"
      columns={columns}
      FormComponent={TaskForm}
    />
  );
};

export default TaskManagement;
