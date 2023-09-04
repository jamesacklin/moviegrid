export interface AttributeList {
  rows: string[];
  cols: string[];
}

export interface ApiResponse {
  attributes: AttributeList;
  entities: string[][][];
  allEntities: string[];
  uuid: string;
  message: string;
}

export interface NumericKeyObject {
  [key: number]: string;
}
