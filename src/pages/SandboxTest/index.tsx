import React, { useState } from 'react'
import { ReactComponentRenderer } from '@/components/Artifacts/renderers'

/**
 * SandboxTest - Test page for debugging React component sandbox rendering
 *
 * Progressive complexity test cases:
 * 1. Basic JSX (no hooks)
 * 2. Simple useState
 * 3. Tailwind CSS
 * 4. Shadcn UI components
 * 5. Lucide icons
 * 6. Full LLM-generated component
 */

// Test cases with increasing complexity
const testCases = {
  // Level 1: Bare minimum - just a div
  'basic-div': {
    name: '1. Basic Div',
    description: 'Just a simple div with text',
    code: `export default function App() {
  return <div style={{ color: 'white', padding: '20px' }}>Hello World!</div>
}`,
  },

  // Level 2: useState hook
  'use-state': {
    name: '2. useState Hook',
    description: 'Simple counter with useState',
    code: `export default function App() {
  const [count, setCount] = React.useState(0)
  
  return (
    <div style={{ color: 'white', padding: '20px' }}>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{ padding: '8px 16px', marginTop: '10px' }}
      >
        Increment
      </button>
    </div>
  )
}`,
  },

  // Level 3: Tailwind CSS
  tailwind: {
    name: '3. Tailwind CSS',
    description: 'Component with Tailwind classes',
    code: `export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2">Tailwind Works!</h1>
        <p className="text-purple-100">Gradients, shadows, and more.</p>
      </div>
    </div>
  )
}`,
  },

  // Level 4: Shadcn UI components
  shadcn: {
    name: '4. Shadcn UI',
    description: 'Using Button and Card components',
    code: `export default function App() {
  const [clicked, setClicked] = React.useState(false)
  
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Shadcn UI Test</CardTitle>
          <CardDescription>Testing built-in components</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Status: {clicked ? 'Button was clicked!' : 'Not clicked yet'}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setClicked(true)}>
            Click Me
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}`,
  },

  // Level 5: Lucide icons
  'lucide-icons': {
    name: '5. Lucide Icons',
    description: 'Using built-in icon components',
    code: `export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Icon Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <Check className="w-4 h-4" />
            <span>Check icon</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <Heart className="w-4 h-4" />
            <span>Heart icon</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <Plus className="w-4 h-4" />
            <span>Plus icon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}`,
  },

  // Level 6: More complex - Progress, Badge
  'complex-ui': {
    name: '6. Complex UI',
    description: 'Progress bars, badges, and more components',
    code: `export default function App() {
  const [progress, setProgress] = React.useState(65)
  
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Dashboard Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge>Active</Badge>
            <Badge variant="secondary">Premium</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button onClick={() => setProgress(p => Math.min(100, p + 10))}>
              <Plus className="w-4 h-4 mr-1" />
              Increase
            </Button>
            <Button variant="outline" onClick={() => setProgress(p => Math.max(0, p - 10))}>
              <Minus className="w-4 h-4 mr-1" />
              Decrease
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}`,
  },

  // Level 7: The actual LLM-generated component
  'llm-generated': {
    name: '7. LLM Generated (Full)',
    description: 'The actual dashboard card from the LLM',
    code: `export default function App() {
  const [isHovered, setIsHovered] = React.useState(false);
  const [count, setCount] = React.useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-white text-2xl">
              <Sparkles className="w-6 h-6" />
              Welcome to Magic
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                <p className="text-blue-300 text-sm">Counter</p>
                <p className="text-3xl font-bold text-white mt-2">{count}</p>
              </div>
              <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
                <p className="text-green-300 text-sm">Status</p>
                <p className="text-3xl font-bold text-white mt-2">✓</p>
              </div>
              <div className="bg-pink-500/20 rounded-lg p-4 border border-pink-400/30">
                <p className="text-pink-300 text-sm">Level</p>
                <p className="text-3xl font-bold text-white mt-2">Pro</p>
              </div>
            </div>
            <Progress value={65} className="h-2 bg-gray-700" />
          </CardContent>
          <CardFooter className="p-6 flex gap-3">
            <Button onClick={() => setCount(c => c + 1)} className="flex-1">
              <Plus className="w-4 h-4 mr-2" /> Increment
            </Button>
            <Button onClick={() => setCount(0)} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}`,
  },

  // Level 8: Todo List
  'todo-list': {
    name: '8. Todo List',
    description: 'Interactive todo list with add/remove',
    code: `export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', done: true },
    { id: 2, text: 'Build a sandbox', done: false },
    { id: 3, text: 'Test components', done: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Todo List
          </CardTitle>
          <CardDescription>{todos.filter(t => !t.done).length} items remaining</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="flex-1 bg-gray-700 border-gray-600"
            />
            <Button onClick={addTodo}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {todos.map(todo => (
              <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                <Checkbox checked={todo.done} onCheckedChange={() => toggleTodo(todo.id)} />
                <span className={\`flex-1 \${todo.done ? 'line-through text-gray-500' : 'text-white'}\`}>
                  {todo.text}
                </span>
                <button onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`,
  },

  // Level 9: Quiz Game
  'quiz-game': {
    name: '9. Quiz Game',
    description: 'Simple trivia quiz with score',
    code: `export default function App() {
  const questions = [
    { q: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: 1 },
    { q: "Capital of France?", options: ["London", "Berlin", "Paris", "Rome"], answer: 2 },
    { q: "React is a ___?", options: ["Language", "Library", "Framework", "Database"], answer: 1 }
  ];
  
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleAnswer = (idx) => {
    setSelected(idx);
    if (idx === questions[current].answer) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <Card className="w-80 bg-gray-800 border-gray-700 text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl">{score === questions.length ? '🎉' : '📊'}</div>
            <p className="text-xl text-white">Score: {score}/{questions.length}</p>
            <Progress value={(score/questions.length)*100} />
          </CardContent>
          <CardFooter>
            <Button onClick={restart} className="w-full">Play Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <Card className="w-96 bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Badge>Question {current + 1}/{questions.length}</Badge>
            <Badge variant="secondary">Score: {score}</Badge>
          </div>
          <CardTitle className="mt-4">{questions[current].q}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {questions[current].options.map((opt, idx) => (
            <Button
              key={idx}
              onClick={() => selected === null && handleAnswer(idx)}
              variant={selected === null ? "outline" : 
                idx === questions[current].answer ? "default" :
                idx === selected ? "destructive" : "outline"}
              className="w-full justify-start"
              disabled={selected !== null}
            >
              {opt}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}`,
  },

  // Level 10: Settings Panel
  'settings-panel': {
    name: '10. Settings Panel',
    description: 'Toggle switches and sliders',
    code: `export default function App() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [quality, setQuality] = useState([50]);

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-white">Notifications</p>
                <p className="text-sm text-gray-400">Receive push notifications</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-white">Dark Mode</p>
                <p className="text-sm text-gray-400">Use dark theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-400" />
              <p className="font-medium text-white">Volume: {volume[0]}%</p>
            </div>
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-gray-400" />
              <p className="font-medium text-white">Quality: {quality[0]}%</p>
            </div>
            <Slider value={quality} onValueChange={setQuality} max={100} step={1} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`,
  },

  // Level 11: Pricing Card
  'pricing-card': {
    name: '11. Pricing Card',
    description: 'Clean pricing tier card',
    code: `export default function App() {
  const [selected, setSelected] = useState('pro');
  
  const plans = [
    { id: 'basic', name: 'Basic', price: 9, features: ['5 Projects', '1GB Storage', 'Email Support'] },
    { id: 'pro', name: 'Pro', price: 29, features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'API Access'] },
    { id: 'team', name: 'Team', price: 99, features: ['Everything in Pro', 'Team Management', 'SSO', 'Dedicated Manager'] }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <div className="flex gap-6">
        {plans.map(plan => (
          <Card 
            key={plan.id}
            className={\`w-72 bg-gray-800 border-2 cursor-pointer transition-all \${
              selected === plan.id ? 'border-blue-500' : 'border-gray-700 hover:border-gray-600'
            }\`}
            onClick={() => setSelected(plan.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {selected === plan.id && <CheckCircle className="w-5 h-5 text-blue-400" />}
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">\${plan.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-green-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={selected === plan.id ? 'default' : 'outline'}>
                {selected === plan.id ? 'Selected' : 'Choose Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}`,
  },
}

const SandboxTest: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<string>('basic-div')
  const [customCode, setCustomCode] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const currentTest = testCases[selectedTest as keyof typeof testCases]
  const codeToRender = useCustom ? customCode : currentTest?.code

  return (
    <div className='min-h-screen bg-gray-950 text-white'>
      {/* Header */}
      <div className='border-b border-gray-800 bg-gray-900 p-4'>
        <h1 className='text-2xl font-bold'>🧪 React Sandbox Test</h1>
        <p className='mt-1 text-sm text-gray-400'>
          Debug component rendering step by step
        </p>
      </div>

      <div className='flex h-[calc(100vh-80px)]'>
        {/* Left Panel - Test Selection & Code */}
        <div className='flex w-1/2 flex-col border-r border-gray-800'>
          {/* Test Case Selector */}
          <div className='border-b border-gray-800 p-4'>
            <label className='mb-2 block text-sm font-medium'>
              Select Test Case:
            </label>
            <div className='flex flex-wrap gap-2'>
              {Object.entries(testCases).map(([key, test]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTest(key)
                    setUseCustom(false)
                  }}
                  className={`rounded px-3 py-1.5 text-sm transition-colors ${
                    selectedTest === key && !useCustom
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {test.name}
                </button>
              ))}
              <button
                onClick={() => setUseCustom(true)}
                className={`rounded px-3 py-1.5 text-sm transition-colors ${
                  useCustom
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Custom Code
              </button>
            </div>
          </div>

          {/* Code Display / Editor */}
          <div className='flex flex-1 flex-col overflow-hidden'>
            <div className='border-b border-gray-800 bg-gray-900/50 p-4'>
              <h3 className='font-medium'>
                {useCustom ? 'Custom Code' : currentTest?.name}
              </h3>
              <p className='text-sm text-gray-400'>
                {useCustom ? 'Paste your code below' : currentTest?.description}
              </p>
            </div>

            {useCustom ? (
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className='flex-1 resize-none bg-gray-900 p-4 font-mono text-sm focus:outline-none'
                placeholder='Paste your React component code here...'
              />
            ) : (
              <pre className='flex-1 overflow-auto bg-gray-900 p-4 font-mono text-sm'>
                <code className='text-green-400'>{currentTest?.code}</code>
              </pre>
            )}
          </div>
        </div>

        {/* Right Panel - Rendered Output */}
        <div className='flex w-1/2 flex-col'>
          <div className='border-b border-gray-800 bg-gray-900/50 p-4'>
            <h3 className='font-medium'>Rendered Output</h3>
            <p className='text-sm text-gray-400'>
              Watch the sandbox render the component
            </p>
          </div>

          <div className='relative flex-1'>
            {codeToRender ? (
              <ReactComponentRenderer
                code={codeToRender}
                title='Test Component'
                onError={(error) => console.error('Sandbox error:', error)}
              />
            ) : (
              <div className='flex h-full items-center justify-center text-gray-500'>
                Enter code to render
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SandboxTest
