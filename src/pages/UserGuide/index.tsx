import { useParams } from 'react-router-dom'
import ManualOverview from './ManualOverview'
import ManualTopicPage from './ManualTopicPage'

const UserGuide = () => {
  const { topicId } = useParams<{ topicId: string }>()
  return topicId ? <ManualTopicPage topicId={topicId} /> : <ManualOverview />
}

export default UserGuide
