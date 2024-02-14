export interface IFloor {
  id: string;
  name: string;
  plan: string;
  "plan-data": string;
  tables?: ITable[]
}

export interface ITable {
  id: string;
  floor_id: string;
  ref: string;
  max_count: number;
}

