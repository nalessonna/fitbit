export interface Profile {
  account_id: string
  name: string
  avatar_url: string | null
}

export interface BodyPart {
  id: number
  name: string
}

export interface Exercise {
  id: number
  name: string
  body_part_id: number
  body_part: string
}

export interface CalendarExercise {
  id:          number
  name:        string
  body_part_id: number
  sets: { set_number: number; weight: number; reps: number }[]
}

export interface CalendarEntry {
  date:           string
  exercise_names: string[]
  exercises:      CalendarExercise[]
}

export interface VolumeEntry {
  date: string
  volume: number
}

export interface OneRmEntry {
  date: string
  one_rm: number
}

export interface WorkoutSet {
  set_number: number
  weight: number
  reps: number
}

export interface WorkoutLog {
  date: string
  sets: WorkoutSet[]
}

export interface Friend {
  id: number
  name: string
  account_id: string
  avatar_url: string | null
}

export interface FriendRequest {
  id: number
  requester_id: number
  name: string
}

export interface Friendship {
  id: number
  requester_id: number
  receiver_id: number
  status: string
}
