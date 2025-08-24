import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, LineChart, ScatterChart, PieChart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart as RechartsScatterChart, Scatter, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface ChartBuilderProps {
  data: any[];
  fileName: string;
}

const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
  { id: 'line', name: 'Line Chart', icon: LineChart },
  { id: 'scatter', name: 'Scatter Plot', icon: ScatterChart },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function ChartBuilder({ data, fileName }: ChartBuilderProps) {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [groupBy, setGroupBy] = useState('');
  const [aggregation, setAggregation] = useState('sum');
  
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0] || {});
  }, [data]);
  
  const numericColumns = useMemo(() => {
    return columns.filter(col => {
      const sample = data.slice(0, 10);
      return sample.every(row => !isNaN(Number(row[col])) && row[col] !== '' && row[col] !== null);
    });
  }, [columns, data]);
  
  const textColumns = useMemo(() => {
    return columns.filter(col => !numericColumns.includes(col));
  }, [columns, numericColumns]);
  
  const chartData = useMemo(() => {
    if (!data || !xAxis) return [];
    
    if (chartType === 'pie') {
      // For pie chart, group by the selected column and count occurrences
      const groups: Record<string, number> = {};
      data.forEach(row => {
        const key = String(row[xAxis] || 'Unknown');
        groups[key] = (groups[key] || 0) + 1;
      });
      
      return Object.entries(groups)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10 for readability
    }
    
    if (chartType === 'scatter') {
      if (!yAxis) return [];
      return data
        .filter(row => !isNaN(Number(row[xAxis])) && !isNaN(Number(row[yAxis])))
        .map(row => ({
          x: Number(row[xAxis]),
          y: Number(row[yAxis]),
          name: row[groupBy] || 'Data Point'
        }))
        .slice(0, 1000); // Limit for performance
    }
    
    // For bar and line charts
    if (!yAxis) return [];
    
    if (groupBy) {
      // Group data and aggregate
      const groups: Record<string, number[]> = {};
      data.forEach(row => {
        const key = String(row[groupBy] || 'Unknown');
        if (!groups[key]) groups[key] = [];
        const value = Number(row[yAxis]);
        if (!isNaN(value)) groups[key].push(value);
      });
      
      return Object.entries(groups).map(([name, values]) => {
        let aggregatedValue = 0;
        switch (aggregation) {
          case 'sum':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'avg':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
            break;
          case 'count':
            aggregatedValue = values.length;
            break;
          case 'max':
            aggregatedValue = Math.max(...values);
            break;
          case 'min':
            aggregatedValue = Math.min(...values);
            break;
        }
        return { name, value: aggregatedValue };
      }).sort((a, b) => b.value - a.value).slice(0, 20);
    } else {
      // Direct mapping
      return data
        .filter(row => row[xAxis] && !isNaN(Number(row[yAxis])))
        .map(row => ({
          name: String(row[xAxis]),
          value: Number(row[yAxis])
        }))
        .slice(0, 50);
    }
  }, [data, xAxis, yAxis, groupBy, aggregation, chartType]);
  
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Select columns to create a chart
        </div>
      );
    }
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter fill="#3b82f6" />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Chart Builder</h2>
          <p className="text-sm text-muted-foreground">Create interactive visualizations from your data</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chart Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Chart Type</label>
              <div className="grid grid-cols-2 gap-2">
                {CHART_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={chartType === type.id ? "default" : "outline"}
                      onClick={() => setChartType(type.id)}
                      className="justify-start"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {type.name}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* X Axis */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {chartType === 'pie' ? 'Category' : 'X Axis'}
              </label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column..." />
                </SelectTrigger>
                <SelectContent>
                  {(chartType === 'scatter' ? numericColumns : columns).map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Y Axis */}
            {chartType !== 'pie' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Y Axis</label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    {numericColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Group By */}
            {chartType !== 'pie' && chartType !== 'scatter' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Group By (Optional)</label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {textColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Aggregation */}
            {groupBy && chartType !== 'pie' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Aggregation</label>
                <Select value={aggregation} onValueChange={setAggregation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Data Info */}
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{chartData.length} data points</Badge>
                <Badge variant="outline">{numericColumns.length} numeric columns</Badge>
                <Badge variant="outline">{textColumns.length} text columns</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Chart Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}