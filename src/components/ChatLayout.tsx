import React from "react";

const ChatLayout: React.FC = () => {
  return (
    <div className='flex flex-col h-full'>
      <div className='p-6 bg-white shadow-md'>
        <h2 className='text-xl font-bold'>Chat Title</h2>
      </div>
      <div className='flex-1 p-6 overflow-y-auto bg-gray-50'>
        <p className='mb-6'>User: Hello</p>
        <p className='mb-6 text-right'>You: Hi there!</p>
      </div>
      <div className='p-6 bg-white shadow-md'>
        <div className='flex items-center'>
          <input
            type='text'
            placeholder='Type a message...'
            className='flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button className='px-4 py-2 text-white bg-blue-500 rounded-r-md hover:bg-blue-600'>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;