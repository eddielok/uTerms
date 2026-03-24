import type { ReactNode } from 'react';
import './Table.css';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  width?: string;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({ 
  columns, 
  data, 
  keyExtractor, 
  emptyMessage = "No data available",
  className = "" 
}: TableProps<T>) {
  return (
    <div className={`custom-table-container ${className}`}>
      <div className="custom-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={col.headerClassName || ''}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)}>
                  {columns.map((col, colIdx) => {
                    const content =
                      typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as ReactNode);
                    return (
                      <td key={colIdx} className={col.className || ''}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
