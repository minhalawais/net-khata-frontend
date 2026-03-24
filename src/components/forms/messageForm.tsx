import React, { useEffect, useState, Fragment } from 'react';
import { getToken } from '../../utils/auth.ts';
import { Combobox, Transition } from '@headlessui/react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig.ts';

interface MessageFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isEditing: boolean;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

export function MessageForm({ formData, handleInputChange, isEditing }: MessageFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = getToken();
      try {
        const response = await axiosInstance.get('/customers/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(response.data);
      } catch (error) {
        console.error('Failed to fetch customers', error);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers =
    query === ''
      ? customers
      : customers.filter((customer) => {
          const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
          return fullName.includes(query.toLowerCase()) ||
                 customer.id.toLowerCase().includes(query.toLowerCase());
        });

  const handleCustomerChange = (selectedCustomers: Customer[]) => {
    setSelectedCustomers(selectedCustomers);
    handleInputChange({
      target: {
        name: 'recipient_ids',
        value: selectedCustomers.map(customer => customer.id).join(',')
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const selectAllCustomers = () => {
    setSelectedCustomers(customers);
    handleInputChange({
      target: {
        name: 'recipient_ids',
        value: customers.map(customer => customer.id).join(',')
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const labelClass = 'block text-[11px] font-medium text-slate-600 mb-1.5';
  const controlClass = 'w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150';

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Recipients <span className="text-rose-500 ml-0.5">*</span></label>
        <Combobox value={selectedCustomers} onChange={handleCustomerChange} multiple>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150">
            <Combobox.Input
              className="w-full h-9 border-none py-0 pl-3 pr-9 text-[13px] leading-5 text-slate-700 placeholder:text-slate-400 focus:ring-0"
              displayValue={(customers: Customer[]) =>
                customers.map(c => `${c.first_name} ${c.last_name}`).join(', ')
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Select recipients..."
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2.5">
              <FaChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-[13px] border border-slate-200 focus:outline-none">
              <div className="px-3 py-2 border-b border-slate-100">
                <button
                  onClick={selectAllCustomers}
                  className="text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150"
                  type="button"
                >
                  Select All
                </button>
              </div>
              {filteredCustomers.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-3 px-3 text-slate-400 text-[12px]">
                  Nothing found.
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <Combobox.Option
                    key={customer.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-9 pr-3 ${
                        active ? 'bg-blue-50 text-slate-700' : 'text-slate-600'
                      }`
                    }
                    value={customer}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {customer.first_name} {customer.last_name}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-blue-600' : 'text-blue-600'
                            }`}
                          >
                            <FaCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      </div>

      <div>
        <label className={labelClass}>Subject <span className="text-rose-500 ml-0.5">*</span></label>
        <input
          type="text"
          name="subject"
          value={formData.subject || ''}
          onChange={handleInputChange}
          placeholder="Subject"
          className={controlClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Message Content <span className="text-rose-500 ml-0.5">*</span></label>
        <textarea
          name="content"
          value={formData.content || ''}
          onChange={handleInputChange}
          placeholder="Message Content"
          className="w-full px-3 py-2.5 min-h-[120px] border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150 resize-none"
          rows={5}
          required
        />
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            name="is_read"
            checked={formData.is_read || false}
            onChange={handleInputChange}
            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/[0.12]"
          />
          <label htmlFor="is_read" className="text-[13px] text-slate-600">Mark as Read</label>
        </div>
      )}
    </div>
  );
}
