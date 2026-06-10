import { METHOD } from '@/utils/constants/requests'
import { DataExportScope } from '@/utils/constants/dataExport'
import { baseRequest } from '@/utils/requests'

export const downloadDataExportAPI = async (
  scope: DataExportScope
): Promise<{ blob: Blob; filename: string }> => {
  return await baseRequest({
    url: 'api/data-exports/download/',
    method: METHOD.GET,
    params: { scope },
    responseType: 'blob',
  })
}
