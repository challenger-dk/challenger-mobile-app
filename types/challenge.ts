import type { Team } from "./team"
import type { User } from "./user"

export type CreateChallenge = {
  name: string
  description: string
  sport: string
  location: string
  creator_id: number
}

export type Challenge = {
  id: number
  name: string
  description: string
  sport: string
  location: string
  creator: User
  users: User[]
  teams: Team[]
}

