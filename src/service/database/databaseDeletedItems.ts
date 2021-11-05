export interface IDatabaseDeletedItems {
  ref: number;
  tableName: string;
  rowRef: number;
  rowUniqueKey: string;
  deletedDatetime: Date;
  deletedByUser: string;
}
