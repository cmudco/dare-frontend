import React, { useEffect, useState, useRef } from 'react'
import mermaid from 'mermaid'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

// ============ MERMAID DIAGRAMS ============

const MERMAID_EXAMPLES = [
  {
    title: 'DARE Application Architecture',
    code: `flowchart TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI[Chat UI]
        Redux[Redux Store]
        WS[WebSocket Client]
        Artifacts[Artifact Panel]
    end
    
    subgraph Backend["Backend (Django + Channels)"]
        Consumer[WebSocket Consumer]
        MC[MessageCoordinator]
        LLMSvc[LLMService]
        IntentSvc[ArtifactIntentService]
        ArtifactCoord[SimpleArtifactCoordinator]
    end
    
    subgraph AI["AI Providers"]
        OpenAI[OpenAI API]
        Claude[Claude API]
        Gemini[Gemini API]
    end
    
    subgraph Storage["Data Layer"]
        DB[(PostgreSQL)]
        Redis[(Redis)]
        Vector[(Pinecone)]
    end
    
    UI --> Redux
    Redux --> WS
    WS <--> Consumer
    Consumer --> MC
    MC --> IntentSvc
    IntentSvc -->|chat| LLMSvc
    IntentSvc -->|create/edit| ArtifactCoord
    ArtifactCoord --> LLMSvc
    LLMSvc --> OpenAI
    LLMSvc --> Claude
    LLMSvc --> Gemini
    MC --> DB
    Consumer --> Redis
    LLMSvc --> Vector
    Artifacts <--> WS`,
  },
  {
    title: 'Flowchart - User Authentication',
    code: `flowchart TD
    A[User visits site] --> B{Has account?}
    B -->|Yes| C[Login page]
    B -->|No| D[Registration page]
    C --> E{Valid credentials?}
    E -->|Yes| F[Dashboard]
    E -->|No| G[Error message]
    G --> C
    D --> H[Fill form]
    H --> I[Verify email]
    I --> F`,
  },
  {
    title: 'Sequence Diagram - API Request',
    code: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    
    U->>F: Click submit
    F->>B: POST /api/data
    B->>D: Query data
    D-->>B: Return results
    B-->>F: JSON response
    F-->>U: Update UI`,
  },
  {
    title: 'State Diagram - Order Status',
    code: `stateDiagram-v2
    [*] --> Pending
    Pending --> Processing: Payment confirmed
    Processing --> Shipped: Items packed
    Shipped --> Delivered: Courier delivered
    Delivered --> [*]
    Processing --> Cancelled: User request
    Pending --> Cancelled: Timeout`,
  },
  {
    title: 'Mindmap - Project Planning',
    code: `mindmap
  root((Project))
    Planning
      Requirements
      Timeline
      Budget
    Development
      Frontend
      Backend
      Database
    Testing
      Unit tests
      Integration
      UAT
    Deployment
      Staging
      Production`,
  },
  {
    title: 'Pie Chart - Budget Allocation',
    code: `pie showData
    title Budget Distribution
    "Development" : 45
    "Marketing" : 20
    "Operations" : 15
    "Support" : 12
    "Other" : 8`,
  },
  {
    title: 'Gantt Chart - Sprint Timeline',
    code: `gantt
    title Sprint 1 Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements    :a1, 2024-01-01, 3d
    Design          :a2, after a1, 4d
    section Development
    Frontend        :b1, after a2, 7d
    Backend         :b2, after a2, 7d
    section Testing
    QA Testing      :c1, after b1, 3d`,
  },
]

// ============ CHART DATA ============

const barChartData = [
  { name: 'Jan', sales: 4000, profit: 2400 },
  { name: 'Feb', sales: 3000, profit: 1398 },
  { name: 'Mar', sales: 5000, profit: 2800 },
  { name: 'Apr', sales: 4780, profit: 3908 },
  { name: 'May', sales: 5890, profit: 4800 },
  { name: 'Jun', sales: 4390, profit: 3800 },
]

const lineChartData = [
  { month: 'Jan', users: 1200, revenue: 45000 },
  { month: 'Feb', users: 1900, revenue: 52000 },
  { month: 'Mar', users: 2400, revenue: 61000 },
  { month: 'Apr', users: 2780, revenue: 72000 },
  { month: 'May', users: 3890, revenue: 89000 },
  { month: 'Jun', users: 4300, revenue: 98000 },
]

const pieChartData = [
  { name: 'Chrome', value: 62, color: '#4285F4' },
  { name: 'Safari', value: 19, color: '#34A853' },
  { name: 'Firefox', value: 10, color: '#FF7139' },
  { name: 'Edge', value: 6, color: '#0078D4' },
  { name: 'Other', value: 3, color: '#9E9E9E' },
]

const areaChartData = [
  { day: 'Mon', pageViews: 3000, sessions: 1400 },
  { day: 'Tue', pageViews: 4500, sessions: 2100 },
  { day: 'Wed', pageViews: 5200, sessions: 2400 },
  { day: 'Thu', pageViews: 4800, sessions: 2200 },
  { day: 'Fri', pageViews: 6100, sessions: 2900 },
  { day: 'Sat', pageViews: 3200, sessions: 1500 },
  { day: 'Sun', pageViews: 2800, sessions: 1200 },
]

// ============ COMPONENTS ============

const MermaidDiagram: React.FC<{ code: string; title: string }> = ({
  code,
  title,
}) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const idRef = useRef(`mermaid_${Math.random().toString(36).substring(7)}`)

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(idRef.current, code)
        setSvg(svg)
        setError(null)
      } catch (err) {
        console.error('Mermaid error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render')
      }
    }
    renderDiagram()
  }, [code])

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
        {title}
      </h3>
      {error ? (
        <div className='rounded bg-red-50 p-4 dark:bg-red-900/20'>
          <p className='text-sm text-red-600 dark:text-red-400'>
            Error: {error}
          </p>
          <pre className='mt-2 overflow-auto text-xs text-gray-600 dark:text-gray-400'>
            {code}
          </pre>
        </div>
      ) : svg ? (
        <div
          className='overflow-auto'
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className='animate-pulse text-gray-500'>Loading...</div>
      )}
    </div>
  )
}

const DiagramTestPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-50 p-8 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
          Diagram & Chart Test Page
        </h1>
        <p className='mb-8 text-gray-600 dark:text-gray-400'>
          Validating mermaid diagrams and Recharts rendering capabilities
        </p>

        {/* Mermaid Diagrams Section */}
        <section className='mb-12'>
          <h2 className='mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200'>
            Mermaid Diagrams
          </h2>
          <div className='grid gap-6 md:grid-cols-2'>
            {MERMAID_EXAMPLES.map((example, idx) => (
              <MermaidDiagram
                key={idx}
                title={example.title}
                code={example.code}
              />
            ))}
          </div>
        </section>

        {/* Recharts Section */}
        <section>
          <h2 className='mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-200'>
            Data Charts (Recharts)
          </h2>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Bar Chart */}
            <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                Bar Chart - Sales & Profit
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='sales' fill='#8884d8' name='Sales' />
                  <Bar dataKey='profit' fill='#82ca9d' name='Profit' />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                Line Chart - Growth Trends
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis yAxisId='left' />
                  <YAxis yAxisId='right' orientation='right' />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId='left'
                    type='monotone'
                    dataKey='users'
                    stroke='#8884d8'
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='revenue'
                    stroke='#82ca9d'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                Pie Chart - Browser Market Share
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    dataKey='value'
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart */}
            <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>
                Area Chart - Weekly Traffic
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={areaChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='day' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type='monotone'
                    dataKey='pageViews'
                    stackId='1'
                    stroke='#8884d8'
                    fill='#8884d8'
                    fillOpacity={0.6}
                  />
                  <Area
                    type='monotone'
                    dataKey='sessions'
                    stackId='2'
                    stroke='#82ca9d'
                    fill='#82ca9d'
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DiagramTestPage
