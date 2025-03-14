import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserStats } from "@/redux/aynscThunks/user";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Activity, BarChart3, Clock, FileText, MessageCircle, Tag, Users } from "lucide-react";
import { useEffect } from "react";

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((state) => state.user)

  useEffect(() => {
    dispatch(getUserStats())
  }, [dispatch])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const statCards = [
    {
      title: "AI Messages",
      value: stats?.aiMessageCount || 0,
      icon: <MessageCircle className="h-5 w-5 text-indigo-500" />,
      description: "Total AI-generated messages",
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Conversations",
      value: stats?.conversationCount || 0,
      icon: <Users className="h-5 w-5 text-emerald-500" />,
      description: "Total conversations started",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Files",
      value: stats?.fileCount || 0,
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      description: "Total files uploaded",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Messages",
      value: stats?.messageCount || 0,
      icon: <Activity className="h-5 w-5 text-rose-500" />,
      description: "Total messages exchanged",
      color: "from-rose-500 to-pink-500",
    },
    {
      title: "Prompts",
      value: stats?.promptCount || 0,
      icon: <BarChart3 className="h-5 w-5 text-amber-500" />,
      description: "Total prompts created",
      color: "from-amber-500 to-yellow-500",
    },
    {
      title: "Tagged Files",
      value: stats?.taggedFilesCount || 0,
      icon: <Tag className="h-5 w-5 text-violet-500" />,
      description: "Files with tags",
      color: "from-violet-500 to-purple-500",
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your activity and usage statistics.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <Card
              key={index}
              className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${card.color}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                  {card.icon}
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(card.value)}</div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-gradient-to-br bg-white dark:from-slate-900 dark:to-slate-800 border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Summary
          </CardTitle>
          <CardDescription>Your overall platform engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Message Ratio</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {stats?.messageCount ? ((stats.aiMessageCount / stats.messageCount) * 100).toFixed(1) : 0}%
                </span>
                <span className="text-sm text-muted-foreground">AI messages</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{
                    width: `${stats?.messageCount ? (stats.aiMessageCount / stats.messageCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Files per Conversation</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {stats?.conversationCount ? (stats.fileCount / stats.conversationCount).toFixed(1) : 0}
                </span>
                <span className="text-sm text-muted-foreground">average</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{
                    width: `${stats?.conversationCount ? Math.min((stats.fileCount / stats.conversationCount / 5) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard;