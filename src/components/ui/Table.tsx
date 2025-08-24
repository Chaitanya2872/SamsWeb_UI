import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { TableColumn } from '@/types';
import LoadingSpinner from './LoadingSpinner';

// EmptyState component definition
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = 'No data available', 
  description, 
  icon,
  className 
}) => (
  <div className={clsx('flex flex-col items-center justify-center py-12 text-center', className)}>
    {icon && <div className="mb-4 text-secondary-400">{icon}</div>}
    <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
    {description && (
      <p className="mt-2 text-sm text-secondary-500 max-w-md">{description}</p>
    )}
  </div>
);

interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  sortable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function Table<T = Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  emptyDescription,
  sortable = false,
  onSort,
  sortKey,
  sortDirection,
  actions,
  onRowClick,
  className,
  size = 'md'
}: TableProps<T>) {
  const [internalSortKey, setInternalSortKey] = useState<string | null>(null);
  const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc'>('asc');

  const currentSortKey = sortKey || internalSortKey;
  const currentSortDirection = sortDirection || internalSortDirection;

  const handleSort = (key: string) => {
    if (!sortable) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    if (currentSortKey === key && currentSortDirection === 'asc') {
      newDirection = 'desc';
    }

    if (onSort) {
      onSort(key, newDirection);
    } else {
      setInternalSortKey(key);
      setInternalSortDirection(newDirection);
    }
  };

  const sizeClasses = {
    sm: {
      table: 'text-sm',
      cell: 'px-3 py-2',
      header: 'px-3 py-3'
    },
    md: {
      table: 'text-sm',
      cell: 'px-4 py-3',
      header: 'px-4 py-3'
    },
    lg: {
      table: 'text-base',
      cell: 'px-6 py-4',
      header: 'px-6 py-4'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={clsx('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className={clsx('min-w-full divide-y divide-secondary-200', sizeClasses[size].table)}>
          {/* Header */}
          <thead className="bg-secondary-50">
            <tr>
              {columns.map((column, index) => {
                const isSortable = sortable && column.sortable !== false;
                const isSorted = currentSortKey === column.key;

                return (
                  <th
                    key={`${column.key as string}-${index}`}
                    className={clsx(
                      'text-left text-xs font-medium text-secondary-500 uppercase tracking-wider',
                      sizeClasses[size].header,
                      isSortable && 'cursor-pointer select-none hover:bg-secondary-100 transition-colors'
                    )}
                    onClick={() => isSortable && handleSort(column.key as string)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {isSortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={clsx(
                              'w-3 h-3 -mb-0.5',
                              isSorted && currentSortDirection === 'asc'
                                ? 'text-primary-600'
                                : 'text-secondary-400'
                            )}
                          />
                          <ChevronDown
                            className={clsx(
                              'w-3 h-3',
                              isSorted && currentSortDirection === 'desc'
                                ? 'text-primary-600'
                                : 'text-secondary-400'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
              {actions && (
                <th className={clsx('relative', sizeClasses[size].header)}>
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-secondary-200">
            {data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={clsx(
                  'transition-colors',
                  onRowClick
                    ? 'cursor-pointer hover:bg-secondary-50 active:bg-secondary-100'
                    : 'hover:bg-secondary-25'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={`${column.key as string}-${colIndex}`}
                    className={clsx(
                      'text-secondary-900 whitespace-nowrap',
                      sizeClasses[size].cell
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] || '—')
                    }
                  </td>
                ))}
                {actions && (
                  <td className={clsx('text-right', sizeClasses[size].cell)}>
                    <div className="flex items-center justify-end">
                      {actions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;