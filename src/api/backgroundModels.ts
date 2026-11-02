import {
  BackgroundModelOverview,
  PlatformBackgroundModels,
  PlatformBackgroundModelsUpdate,
} from '@/redux/types/backgroundModels'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

const USER_URL = 'api/background-models/'
const PLATFORM_URL = 'api/platform/background-models/'

export const getBackgroundModelsAPI = () =>
  baseRequest<BackgroundModelOverview>({ url: USER_URL, method: METHOD.GET })

export const setBackgroundModelAPI = (model: string) =>
  baseRequest<BackgroundModelOverview>({
    url: USER_URL,
    method: METHOD.PATCH,
    data: { model },
  })

export const getPlatformBackgroundModelsAPI = () =>
  baseRequest<PlatformBackgroundModels>({
    url: PLATFORM_URL,
    method: METHOD.GET,
  })

export const updatePlatformBackgroundModelsAPI = (
  update: PlatformBackgroundModelsUpdate
) =>
  baseRequest<PlatformBackgroundModels>({
    url: PLATFORM_URL,
    method: METHOD.PATCH,
    data: update,
  })
