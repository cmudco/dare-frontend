import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

import { Database, DollarSign } from 'lucide-react'
import { getVectorDBName, VectorDbSource } from '@/utils/constants/user'
import {
  updateVectorDBSetting,
  fetchVectorDBSetting,
} from '@/redux/asyncThunks/user'

export const VectorDBConfigForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.user.user)
  const loading = useSelector((state: RootState) => state.user.loading)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [vectorDBValue, setVectorDBValue] = useState<number>(0)
  const [initialVectorDBValue, setInitialVectorDBValue] = useState<number>(0)

  useEffect(() => {
    dispatch(fetchVectorDBSetting())
  }, [dispatch])

  useEffect(() => {
    if (user && user.vectorDb !== undefined) {
      const userVectorDB = user.vectorDb
      setVectorDBValue(userVectorDB)
      setInitialVectorDBValue(userVectorDB)
    }
  }, [user])

  const handleVectorDBUpdate = async () => {
    if (user) {
      setIsSubmitting(true)
      await dispatch(updateVectorDBSetting({ vectorDb: vectorDBValue }))
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
      setInitialVectorDBValue(vectorDBValue)
      setIsSubmitting(false)
    }
  }

  const hasChanges = vectorDBValue !== initialVectorDBValue

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className='text-lg font-semibold'>
            Vector Database Configuration
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose which vector database to use for your document search and embedding storage.
          </p>
        </div>

        <div className='space-y-2'>
          <Label className='text-base font-normal' htmlFor='vectorDb'>
            Vector Database Provider
          </Label>
          <Select
            value={vectorDBValue.toString()}
            onValueChange={(value) => setVectorDBValue(parseInt(value))}
          >
          <SelectTrigger className='h-10'>
            <div className='flex items-center gap-2'>
              {vectorDBValue == VectorDbSource.PINECONE ? (
                <DollarSign className='h-4 w-4 text-gray-500' />
              ) : (
                <Database className='h-4 w-4 text-gray-500' />
              )}

              <SelectValue placeholder='Select vector database'>
                {getVectorDBName(vectorDBValue)}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={VectorDbSource.PINECONE.toString()}>
              <div className='flex items-center gap-2'>
                <span className='flex items-center gap-2'>
                  Pinecone (public)
                </span>
              </div>
            </SelectItem>
            <SelectItem value={VectorDbSource.WEAVIATE.toString()}>
              <div className='flex items-center gap-2'>
                <span>Weaviate (private)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className='text-sm text-muted-foreground'>
          Choose which vector database to use for your document search and
          embedding storage
        </p>
        </div>

      {success && (
        <div className='mt-2'>
          <p className='text-xs font-medium text-green-500'>
            Vector database configuration updated successfully!
          </p>
        </div>
      )}

      <Button
        type='submit'
        disabled={isSubmitting || loading || !hasChanges}
        variant='default'
        className='mt-4 h-[38px] text-base font-normal'
        onClick={handleVectorDBUpdate}
      >
        {isSubmitting || loading ? 'Updating...' : 'Update Configuration'}
      </Button>
      </div>
    </Card>
  )
}
