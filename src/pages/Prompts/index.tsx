import PromptManagerLayout from '../../components/PromptManager/PromptManagerLayout'

const Prompt = () => {
  return (
    <div className='flex h-full flex-col'>
      <div className='flex flex-col space-y-2 px-10 pt-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Prompts</h1>
      </div>
      <PromptManagerLayout />
    </div>
  )
}

export default Prompt
