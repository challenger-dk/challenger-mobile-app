import type { User } from "./user"

export type CreateTeam = {
  name: string
  creator_id: number
}

export type UpdateTeam = {
  name: string
}

export type Team = {
  id: number
  name: string
  creator: User
  users: User[]
}

