import React from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { clearCreditError } from '@/redux/websocketSlice'
import { XCircle } from 'lucide-react'

const CreditErrorAlert: React.FC = () => {
  const dispatch = useAppDispatch()
  const creditError = useAppSelector((state) => state.websocket.creditError)

  if (!creditError) return null

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value)
    return `$${numValue.toString()}`
  }

  return (
    <div className='fixed right-4 top-4 z-50'>
      <div className='w-80 rounded-md border-l-4 border-red-400 bg-red-50 p-4 shadow-lg'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-red-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3 flex-1'>
            <h3 className='text-sm font-medium text-red-800'>
              Insufficient Credits
            </h3>
            <div className='mt-2 text-sm text-red-700'>
              <p>{creditError.message}</p>
              <div className='mt-2'>
                <p className='font-medium'>
                  Current Balance: {formatCurrency(creditError.currentBalance)}
                </p>
                <p className='font-medium'>
                  Required Amount: {formatCurrency(creditError.requiredAmount)}
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <div className='-mx-2 -my-1.5 flex items-center justify-end'>
                <button
                  type='button'
                  className='rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2'
                  onClick={() => dispatch(clearCreditError())}
                >
                  <XCircle className='h-5 w-5' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreditErrorAlert
