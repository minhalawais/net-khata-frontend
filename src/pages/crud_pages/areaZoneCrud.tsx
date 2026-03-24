import React, { useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CRUDPage } from '../../components/crudPage.tsx';
import { AreaZoneForm } from '../../components/forms/areaZoneForm.tsx';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

interface AreaZone {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  sub_zones_count?: number;
}

const AreaZoneManagement: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Area Management | Net Khata";
  }, []);

  const columns = useMemo<ColumnDef<AreaZone>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: (info) => <span className="text-[13px] font-medium text-slate-800">{info.getValue() as string}</span>,
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: info => (
          <div className="max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap text-[13px] text-slate-500" title={info.getValue() as string}>
            {(info.getValue() as string) || 'No description'}
          </div>
        ),
      },
      {
        header: 'Sub-Zones',
        accessorKey: 'sub_zones_count',
        cell: info => (
          <button
            onClick={() => navigate(`/areas/${info.row.original.id}/sub-zones`)}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span className="tabular-nums">{(info.getValue() as number) || 0}</span> sub-zones
          </button>
        ),
      }
    ],
    [navigate]
  );

  return (
    <CRUDPage<AreaZone>
      title="Area/Zone"
      endpoint="areas"
      columns={columns}
      FormComponent={AreaZoneForm}
    />
  );
};

export default AreaZoneManagement;

