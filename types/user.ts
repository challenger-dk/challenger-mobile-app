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
}

export type UpdateUser = {
  first_name?: string
  last_name?: string
  profile_picture?: string
  bio?: string
  favorite_sports?: string[]
}

export type CreateUser = {
  email: string
  password: string
  first_name: string
  last_name?: string
  profile_picture?: string
  bio?: string
  favorite_sports?: string[]
}

