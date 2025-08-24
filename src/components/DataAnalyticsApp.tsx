import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, BarChart3, MessageSquare, Upload, Sparkles } from 'lucide-react';
import { DataUpload } from './DataUpload';
import { DataOverview } from './DataOverview';
import { ChartBuilder } from './ChartBuilder';
import { ChatInterface } from './ChatInterface';

export function DataAnalyticsApp() {
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleDataLoaded = (newData: any[], newFileName: string) => {
    setData(newData);
    setFileName(newFileName);
    setActiveTab('overview');
  };

  const resetData = () => {
    setData([]);
    setFileName('');
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-card backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">DataFluent</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Data Analytics</p>
              </div>
            </div>
            
            {data.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium">{fileName}</div>
                  <div className="text-xs text-muted-foreground">
                    {data.length.toLocaleString()} rows loaded
                  </div>
                </div>
                <Button variant="outline" onClick={resetData}>
                  <Upload className="h-4 w-4 mr-2" />
                  New Dataset
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {data.length === 0 ? (
          /* Upload State */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Transform Your Data into{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Insights
                </span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Upload your CSV file and let AI help you discover patterns, create visualizations, 
                and answer questions about your data.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Database className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Smart EDA</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatic data profiling and quality analysis
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Visual Builder</h3>
                    <p className="text-sm text-muted-foreground">
                      Interactive charts with drag-and-drop simplicity
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">AI Chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Ask questions in natural language about your data
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <DataUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          /* Analysis State */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-fit grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Charts
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {Object.keys(data[0] || {}).length} columns
                </Badge>
                <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                  {data.length.toLocaleString()} rows
                </Badge>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <DataOverview data={data} fileName={fileName} />
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <ChartBuilder data={data} fileName={fileName} />
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <ChatInterface data={data} fileName={fileName} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built with React, TypeScript, and AI. Ready for OpenAI integration.</p>
            <p className="mt-2">
              Supports CSV analysis, SQL queries, and intelligent data insights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}