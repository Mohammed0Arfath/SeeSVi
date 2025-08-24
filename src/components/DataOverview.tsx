import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Database, TrendingUp, AlertCircle } from 'lucide-react';

interface DataOverviewProps {
  data: any[];
  fileName: string;
}

export function DataOverview({ data, fileName }: DataOverviewProps) {
  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const columns = Object.keys(data[0] || {});
    const rowCount = data.length;
    
    // Type analysis
    const columnTypes: Record<string, string> = {};
    const nullCounts: Record<string, number> = {};
    const numericColumns: string[] = [];
    const textColumns: string[] = [];
    const dateColumns: string[] = [];
    
    columns.forEach(col => {
      let numericCount = 0;
      let nullCount = 0;
      let dateCount = 0;
      
      data.slice(0, Math.min(100, data.length)).forEach(row => {
        const value = row[col];
        
        if (value === null || value === undefined || value === '') {
          nullCount++;
        } else if (!isNaN(Number(value)) && value !== '') {
          numericCount++;
        } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          dateCount++;
        }
      });
      
      nullCounts[col] = nullCount;
      
      if (numericCount > data.length * 0.7) {
        columnTypes[col] = 'numeric';
        numericColumns.push(col);
      } else if (dateCount > data.length * 0.5) {
        columnTypes[col] = 'date';
        dateColumns.push(col);
      } else {
        columnTypes[col] = 'text';
        textColumns.push(col);
      }
    });
    
    // Basic statistics for numeric columns
    const numericStats: Record<string, any> = {};
    numericColumns.forEach(col => {
      const values = data
        .map(row => Number(row[col]))
        .filter(val => !isNaN(val));
      
      if (values.length > 0) {
        values.sort((a, b) => a - b);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const median = values[Math.floor(values.length / 2)];
        
        numericStats[col] = {
          min: Math.min(...values),
          max: Math.max(...values),
          mean: mean,
          median: median,
          count: values.length
        };
      }
    });
    
    return {
      rowCount,
      columnCount: columns.length,
      columns,
      columnTypes,
      nullCounts,
      numericColumns,
      textColumns,
      dateColumns,
      numericStats
    };
  }, [data]);
  
  if (!analysis) return null;
  
  const totalCells = analysis.rowCount * analysis.columnCount;
  const totalNulls = Object.values(analysis.nullCounts).reduce((sum, count) => sum + count, 0);
  const completeness = ((totalCells - totalNulls) / totalCells * 100).toFixed(1);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">{fileName}</h2>
          <p className="text-sm text-muted-foreground">Data Overview & Analysis</p>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-chart-1" />
              <div>
                <div className="text-2xl font-bold">{analysis.rowCount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Rows</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-chart-2" />
              <div>
                <div className="text-2xl font-bold">{analysis.columnCount}</div>
                <div className="text-xs text-muted-foreground">Columns</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-3" />
              <div>
                <div className="text-2xl font-bold">{completeness}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-chart-4" />
              <div>
                <div className="text-2xl font-bold">{analysis.numericColumns.length}</div>
                <div className="text-xs text-muted-foreground">Numeric</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Column Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Column Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.numericColumns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Numeric ({analysis.numericColumns.length})</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {analysis.numericColumns.map(col => (
                    <Badge key={col} variant="outline" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {analysis.textColumns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Text ({analysis.textColumns.length})</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {analysis.textColumns.map(col => (
                    <Badge key={col} variant="outline" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {analysis.dateColumns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Date ({analysis.dateColumns.length})</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {analysis.dateColumns.map(col => (
                    <Badge key={col} variant="outline" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.columns.slice(0, 8).map(col => {
                const nullPercent = (analysis.nullCounts[col] / analysis.rowCount * 100).toFixed(1);
                return (
                  <div key={col} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate mr-2">{col}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${100 - Number(nullPercent)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12">
                        {100 - Number(nullPercent)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sample Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sample Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {analysis.columns.slice(0, 8).map(col => (
                    <th key={col} className="text-left p-2 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b">
                    {analysis.columns.slice(0, 8).map(col => (
                      <td key={col} className="p-2 truncate max-w-32">
                        {String(row[col] || '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {analysis.columns.length > 8 && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing first 8 columns of {analysis.columns.length} total
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}