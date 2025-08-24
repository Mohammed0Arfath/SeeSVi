# SeeSVi - AI-Powered Data Analytics

A modern, responsive web application that transforms CSV data into actionable insights using AI-powered analytics, smart visualizations, and natural language queries.

## Features

### 🚀 Smart Data Upload
- Drag & drop CSV file upload
- Automatic data type inference
- Date parsing and validation
- Real-time upload progress

### 📊 Intelligent EDA (Exploratory Data Analysis)
- Automatic data profiling and quality analysis
- Column type detection (numeric, text, date)
- Data completeness metrics
- Sample data preview
- Statistical summaries for numeric columns

### 📈 Interactive Chart Builder
- Multiple chart types: Bar, Line, Scatter, Pie
- Drag-and-drop column selection
- Grouping and aggregation options
- Responsive visualizations using Recharts
- Export capabilities

### 💬 AI Chat Interface
- Natural language queries about your data
- SQL query generation and execution
- Grounded responses (no hallucinations)
- Chat history preservation
- Result table downloads
- SQL query visibility toggle

### 🎨 Modern Design
- Dark theme with blue/purple gradients
- Glassmorphism effects and smooth animations
- Responsive layout for all screen sizes
- Professional data visualization aesthetic
- Accessible UI components

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Recharts** for data visualization
- **Papa Parse** for CSV parsing

### AI Integration Ready
- **OpenAI SDK** support for chat functionality
- Function calling architecture for tool usage
- SQL.js integration for browser-based queries
- Structured data analysis pipeline

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (for chat functionality)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd seesvi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:8080 in your browser

## Usage

### 1. Upload Your Data
- Drag and drop a CSV file or click to browse
- Supported file size: up to 200MB
- Automatic data validation and type inference

### 2. Explore Data Overview
- View dataset summary and statistics
- Check data quality and completeness
- Examine column types and distributions
- Preview sample data

### 3. Create Visualizations
- Select chart type (Bar, Line, Scatter, Pie)
- Choose X and Y axes from your columns
- Apply grouping and aggregation
- Export charts as images

### 4. Chat with Your Data
- Ask natural language questions about your dataset
- Examples:
  - "Show me the top 10 customers by revenue"
  - "What's the correlation between price and sales?"
  - "Create a monthly trend chart"
  - "How many unique products do we have?"

## Sample Datasets

The application includes two sample CSV files:

### E-commerce Data (`sample-ecommerce.csv`)
- Order transactions with revenue, profit, and customer data
- Perfect for business analytics and sales insights
- Columns: order_id, customer_id, product_name, revenue, profit, etc.

### Movie Database (`sample-movies.csv`)
- Movie information with ratings, box office, and production data
- Great for entertainment industry analysis
- Columns: title, genre, rating, box_office, budget, director, etc.

## Chat Interface Examples

### E-commerce Queries
- "What's our total revenue and profit?"
- "Show me the top-selling product categories"
- "Which customers generate the most profit?"
- "What's the average order value by customer type?"
- "Create a chart of daily sales trends"

### Movie Database Queries
- "Which genres perform best at the box office?"
- "Show me the highest-rated movies by year"
- "What's the relationship between budget and revenue?"
- "Which directors have the most successful films?"
- "Create a scatter plot of rating vs box office"

## AI Chat Architecture

The chat interface uses OpenAI's function calling to:

1. **analyze_data()** - Generate statistical summaries
2. **run_sql_query(query)** - Execute SQL on the dataset
3. **create_visualization(type, x, y, options)** - Generate charts
4. **explain_insights(topic)** - Provide data interpretations

### System Prompt Guidelines
- Answer using uploaded data only
- Prefer SQL for filtering and aggregations
- For e-commerce: calculate ROI, profit margins, LTV
- State assumptions when data is incomplete
- Keep responses concise with exact numbers
- Include relevant tables and charts

## E-commerce Analytics

When analyzing e-commerce data, the system automatically detects and calculates:

- **Revenue Metrics**: Total sales, average order value
- **Profitability**: Profit margins, ROI calculations
- **Customer Analytics**: Customer segmentation, lifetime value
- **Product Performance**: Top sellers, category analysis
- **Time-based Trends**: Daily, weekly, monthly patterns

### Key Formulas
- Profit = Revenue - Cost
- ROI = (Revenue - Cost) / Cost
- AOV = Total Revenue / Number of Orders
- Conversion Rate = Orders / Unique Visitors (when available)

## Development

### Project Structure
```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── DataUpload.tsx      # File upload interface
│   ├── DataOverview.tsx    # EDA dashboard
│   ├── ChartBuilder.tsx    # Visualization creator
│   ├── ChatInterface.tsx   # AI chat component
│   └── DataAnalyticsApp.tsx # Main application
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
└── pages/                  # Route components
```

### Adding New Chart Types
1. Update `CHART_TYPES` in `ChartBuilder.tsx`
2. Add new case in `renderChart()` function
3. Import required Recharts component
4. Define data transformation logic

### Extending AI Chat
1. Add new function definitions in chat interface
2. Update system prompt with new capabilities
3. Implement data processing functions
4. Add response formatting logic

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
- `VITE_OPENAI_API_KEY` - Required for AI chat functionality
- Never commit API keys to version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
1. Check the documentation above
2. Review sample datasets and queries
3. Ensure CSV format is valid
4. Verify API key configuration

---

Built with ❤️ using React, TypeScript, and AI