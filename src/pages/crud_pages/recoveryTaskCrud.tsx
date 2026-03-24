import React, { useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CRUDPage } from '../../components/crudPage.tsx';
import { RecoveryTaskForm } from '../../components/forms/recoveryTaskForm.tsx';

interface RecoveryTask {
  id: string;
  invoice_id: string;
  invoice_number: string;
  customer_name: string;
  customer_internet_id: string;
  total_amount: number;
  assigned_to: string;
  assigned_to_name: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const RecoveryTaskManagement: React.FC = () => {
  useEffect(() => {
    document.title = "Net Khata - Recovery Task Management";
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const columns = useMemo<ColumnDef<RecoveryTask>[]>(
    () => [
      {
        header: 'Invoice',
        accessorKey: 'invoice_number',
        cell: info => {
          const row = info.row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-slate-700 font-mono">{row.invoice_number || '-'}</span>
              <span className="text-[11px] text-slate-400">{row.customer_name}</span>
              <span className="text-[11px] font-medium text-blue-600">{row.customer_internet_id}</span>
            </div>
          );
        },
      },
      {
        header: 'Amount',
        accessorKey: 'total_amount',
        cell: info => {
          const value = info.getValue() as number | null;
          if (!value) return <span className="text-slate-400">-</span>;
          return (
            <span className="text-[13px] font-medium text-slate-900 tabular-nums">
              <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
              {value.toLocaleString()}
            </span>
          );
        },
      },
      {
        header: 'Assigned To',
        accessorKey: 'assigned_to_name',
        cell: info => (
          <span className="text-[13px] text-slate-600">{(info.getValue() as string) || '-'}</span>
        ),
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
        header: 'Notes',
        accessorKey: 'notes',
        cell: info => {
          const value = info.getValue() as string | null;
          if (!value) return <span className="text-slate-400">-</span>;
          return (
            <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-slate-600" title={value}>
              {value}
            </div>
          );
        },
      },
      {
        header: 'Created At',
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
    <CRUDPage<RecoveryTask>
      title="Recovery Task"
      endpoint="recovery-tasks"
      columns={columns}
      FormComponent={RecoveryTaskForm}
    />
  );
};

export default RecoveryTaskManagement;
