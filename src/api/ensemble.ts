import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import type { EnsemblePreset, EnsembleRole } from '@/redux/types/conversation'

export type EnsembleDefaults = Record<EnsembleRole, string>

export const getEnsembleDefaultsAPI = async (): Promise<EnsembleDefaults> =>
  await baseRequest<EnsembleDefaults>({
    url: 'api/ensemble-presets/defaults/',
    method: METHOD.GET,
  })

export const getEnsemblePresetsAPI = async (): Promise<{
  results: EnsemblePreset[]
}> =>
  await baseRequest<{ results: EnsemblePreset[] }>({
    url: 'api/ensemble-presets/',
    method: METHOD.GET,
  })

export const createEnsemblePresetAPI = async (
  preset: Omit<EnsemblePreset, 'id'>
): Promise<EnsemblePreset> =>
  await baseRequest<EnsemblePreset>({
    url: 'api/ensemble-presets/',
    method: METHOD.POST,
    data: preset,
  })

export const deleteEnsemblePresetAPI = async (id: number): Promise<void> => {
  await baseRequest<void>({
    url: `api/ensemble-presets/${id}/`,
    method: METHOD.DELETE,
  })
}
