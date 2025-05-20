export enum SortDirectionEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export type SortDirection = SortDirectionEnum

export const updateSortState = (
  clickedColumn: string,
  currentSortColumn: string | null,
  setSortColumn: React.Dispatch<React.SetStateAction<string | null>>,
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>
): void => {
  if (currentSortColumn === clickedColumn) {
    setSortDirection((prevDirection) =>
      prevDirection === SortDirectionEnum.ASC
        ? SortDirectionEnum.DESC
        : SortDirectionEnum.ASC
    )
  } else {
    setSortColumn(clickedColumn)
    setSortDirection(SortDirectionEnum.ASC)
  }
}
