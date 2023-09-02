export interface AttributeList {
  rows: string[];
  cols: string[];
}

export interface ApiResponse {
  attributes: AttributeList;
  entities: string[][][];
  uuid: string;
  message: string;
}

export interface ResultResponse {
  score: number;
  resultMatrix: string[][];
  message: string;
}

export interface NumericKeyObject {
  [key: number]: string;
}
