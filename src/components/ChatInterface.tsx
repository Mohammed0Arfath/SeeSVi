import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Code, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sql?: string;
  data?: any[];
}

interface ChatInterfaceProps {
  data: any[];
  fileName: string;
}

export function ChatInterface({ data, fileName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi! I'm ready to help you analyze your data from **${fileName}**. I can answer questions about your dataset, create visualizations, and run SQL queries.\n\nHere are some things you can ask me:\n• "Show me the top 10 rows by revenue"\n• "What's the correlation between price and sales?"\n• "Create a chart of monthly trends"\n• "How many unique customers do we have?"\n\nWhat would you like to explore?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSQL, setShowSQL] = useState<Record<string, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response (replace with actual OpenAI integration)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateMockResponse(input, data),
        timestamp: new Date(),
        sql: generateMockSQL(input),
        data: generateMockData(input, data),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  const generateMockResponse = (query: string, data: any[]) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('top') || lowerQuery.includes('highest')) {
      return `Based on your data, here are the top results. I've sorted the data by the most relevant metric and found some interesting insights.\n\nThe analysis shows clear patterns in your dataset with ${data.length} total records.`;
    }
    
    if (lowerQuery.includes('correlation') || lowerQuery.includes('relationship')) {
      return `I've analyzed the correlations in your dataset. There are several interesting relationships between the numeric variables.\n\nThe strongest correlations indicate meaningful business relationships that could help with decision making.`;
    }
    
    if (lowerQuery.includes('chart') || lowerQuery.includes('visualization')) {
      return `I've created a visualization based on your request. The chart shows the key trends and patterns in your data.\n\nThis visualization helps identify important insights that might not be obvious from looking at raw numbers.`;
    }
    
    if (lowerQuery.includes('count') || lowerQuery.includes('how many')) {
      return `Based on the analysis of your dataset:\n\n• Total records: ${data.length.toLocaleString()}\n• Unique values vary by column\n• Data spans multiple categories with good distribution`;
    }
    
    return `I've analyzed your query about the dataset. Based on the data patterns, I can provide specific insights about your ${data.length} records.\n\nWould you like me to create a visualization or run a specific analysis?`;
  };
  
  const generateMockSQL = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('top')) {
      return 'SELECT * FROM df ORDER BY revenue DESC LIMIT 10';
    }
    
    if (lowerQuery.includes('count')) {
      return 'SELECT COUNT(*) as total_records, COUNT(DISTINCT customer_id) as unique_customers FROM df';
    }
    
    if (lowerQuery.includes('correlation')) {
      return 'SELECT CORR(price, sales) as price_sales_correlation FROM df WHERE price IS NOT NULL AND sales IS NOT NULL';
    }
    
    return 'SELECT * FROM df WHERE condition = true LIMIT 100';
  };
  
  const generateMockData = (query: string, data: any[]) => {
    if (query.toLowerCase().includes('top')) {
      return data.slice(0, 10);
    }
    return null;
  };
  
  const toggleSQL = (messageId: string) => {
    setShowSQL(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };
  
  const downloadData = (data: any[], messageId: string) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${messageId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');
    return csvContent;
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Chat with Your Data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask questions about your dataset and get AI-powered insights
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' ? 'bg-primary' : 'bg-secondary'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                )}
              </div>
              
              <div className={`flex-1 space-y-2 ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
                <div className={`rounded-lg p-3 max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                
                {message.type === 'assistant' && message.sql && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSQL(message.id)}
                        className="h-7 text-xs"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        {showSQL[message.id] ? 'Hide' : 'Show'} SQL
                      </Button>
                      
                      {message.data && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadData(message.data!, message.id)}
                          className="h-7 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                    
                    {showSQL[message.id] && (
                      <div className="bg-background border rounded-md p-3">
                        <code className="text-sm font-mono">{message.sql}</code>
                      </div>
                    )}
                    
                    {message.data && (
                      <div className="bg-background border rounded-md p-3 overflow-x-auto">
                        <table className="text-xs w-full">
                          <thead>
                            <tr className="border-b">
                              {Object.keys(message.data[0] || {}).slice(0, 6).map(key => (
                                <th key={key} className="text-left p-1 font-medium">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {message.data.slice(0, 5).map((row, i) => (
                              <tr key={i} className="border-b">
                                {Object.keys(message.data![0] || {}).slice(0, 6).map(key => (
                                  <td key={key} className="p-1 truncate max-w-24">
                                    {String(row[key] || '—')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {message.data.length > 5 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Showing 5 of {message.data.length} results
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing your data...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <Separator />
        
        {/* Input */}
        <div className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your data..."
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setInput("Show me the top 10 rows by revenue")}>
              Top 10 by revenue
            </Badge>
            <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setInput("What's the correlation between key metrics?")}>
              Correlations
            </Badge>
            <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setInput("Create a monthly trend chart")}>
              Monthly trends
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}