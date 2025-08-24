import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Code, Download, Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const callOpenAI = async (userQuery: string, data: any[]) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a data analyst AI. You have access to a dataset with ${data.length} rows. Answer questions about this data concisely and provide SQL queries when relevant. The table is called 'df'. Here's a sample of the data structure: ${JSON.stringify(data.slice(0, 2))}`
            },
            {
              role: 'user',
              content: userQuery
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        content: result.choices[0]?.message?.content || 'Sorry, I could not process your request.',
        sql: extractSQL(result.choices[0]?.message?.content || ''),
        data: generateMockData(userQuery, data) // For now, keep mock data generation
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  };

  const extractSQL = (content: string) => {
    const sqlMatch = content.match(/```sql\n([\s\S]*?)\n```/);
    return sqlMatch ? sqlMatch[1] : null;
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
    setApiKeyDialogOpen(false);
  };

  const removeApiKey = () => {
    setApiKey('');
    localStorage.removeItem('openai_api_key');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      let assistantMessage: Message;
      
      if (apiKey) {
        // Use OpenAI API
        const response = await callOpenAI(currentInput, data);
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.content,
          timestamp: new Date(),
          sql: response.sql,
          data: response.data,
        };
      } else {
        // Fallback to mock response
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: generateMockResponse(currentInput, data) + '\n\n*Note: Using mock responses. Set your OpenAI API key for AI-powered analysis.*',
          timestamp: new Date(),
          sql: generateMockSQL(currentInput),
          data: generateMockData(currentInput, data),
        };
      }
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error connecting to OpenAI. Using fallback response instead.\n\n${generateMockResponse(currentInput, data)}`,
        timestamp: new Date(),
        sql: generateMockSQL(currentInput),
        data: generateMockData(currentInput, data),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Chat with Your Data
              {apiKey && <Badge variant="secondary" className="text-xs">AI Enabled</Badge>}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ask questions about your dataset and get AI-powered insights
            </p>
          </div>
          
          <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>OpenAI API Key Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">OpenAI API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key is stored locally in your browser
                  </p>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={removeApiKey} disabled={!apiKey}>
                    Remove Key
                  </Button>
                  <Button onClick={() => saveApiKey(apiKey)} disabled={!apiKey.trim()}>
                    Save Key
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Without an API key, you'll receive mock responses for demonstration purposes.</p>
                  <p className="mt-1">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">OpenAI's platform</a>.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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