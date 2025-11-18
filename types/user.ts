import type { Sport } from "./sports"

export type User = {
  id: string | number
  email: string
  first_name: string
  last_name?: string
  profile_picture?: string
  bio?: string
  favorite_sports?: Sport[]
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
  friends?: PublicUser[]
  age?: number
}

export type PublicUser = {
  id: string | number
  email: string
  first_name: string
  last_name?: string
  profile_picture?: string
  bio?: string
  favorite_sports?: Sport[]
  age?: number
}

export type UpdateUser = {
  first_name?: string
  last_name?: string
  profile_picture?: string
  bio?: string
  favorite_sports?: string[]
  age?: number
}

export type CreateUser = {
  email: string
  password: string
  first_name: string
  last_name?: string
  profile_picture?: string
  bio?: string
  favorite_sports?: string[]
  age?: number
}

