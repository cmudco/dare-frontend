import AgentManagerLayout from '../../components/AgentManager/AgentManagerLayout'

const Agents = () => {
  return (
    <div className='flex h-full flex-col'>
      <div className='flex flex-col space-y-2 px-10 pt-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Agents</h1>
      </div>
      <AgentManagerLayout />
    </div>
  )
}

export default Agents
