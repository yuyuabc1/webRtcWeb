export interface MsgBody extends Record {
  subType?: Number,
}

export type Msg = {
  body: MsgBody,
  type: Number | string
}

// 0:系统消息 1: 用户消息
type RecordType = 1 | 0;

export type Record = {
  type: RecordType,
  user: String,
  time?: Date,
  content?: String
}

export type Chat = {
  list: Record[]
}