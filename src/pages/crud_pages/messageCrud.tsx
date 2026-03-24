import React, { useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CRUDPage } from '../../components/crudPage.tsx';
import { MessageForm } from '../../components/forms/messageForm.tsx';

interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  is_active: boolean;
}

const MessageManagement: React.FC = () => {
  useEffect(() => {
    document.title = "Message Management | Net Khata";
  }, []);
  const columns = useMemo<ColumnDef<Message>[]>(
    () => [
      {
        header: 'Sender',
        accessorKey: 'sender',
        cell: info => <span className="text-[13px] font-medium text-slate-800">{info.getValue() as string}</span>,
      },
      {
        header: 'Recipient',
        accessorKey: 'recipient',
        cell: info => <span className="text-[13px] text-slate-700">{info.getValue() as string}</span>,
      },
      {
        header: 'Subject',
        accessorKey: 'subject',
        cell: info => <span className="text-[13px] text-slate-700">{info.getValue() as string}</span>,
      },
      {
        header: 'Content',
        accessorKey: 'content',
        cell: info => (
          <div className="max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap text-[13px] text-slate-500" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        ),
      },
      {
        header: 'Read',
        accessorKey: 'is_read',
        cell: info => (
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${info.getValue()
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
            {info.getValue() ? 'Yes' : 'No'}
          </span>
        ),
      },
      {
        header: 'Created At',
        accessorKey: 'created_at',
        cell: info => <span className="text-[11px] text-slate-400 tabular-nums">{new Date(info.getValue() as string).toLocaleString()}</span>,
      },
    ],
    []
  );

  return (
    <CRUDPage<Message>
      title="Message"
      endpoint="messages"
      columns={columns}
      FormComponent={MessageForm}
    />
  );
};

export default MessageManagement;

