import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  format,
  parseISO,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (
  date: string,
  formatString: string = "MMMM d, yyyy 'at' h:mm a"
) => {
  try {
    return format(parseISO(date), formatString)
  } catch (error) {
    console.error("Error formatting date:", error)
    return date
  }
}

export const calculateAge = (dateOfBirth: string) => {
  const birthDate = parseISO(dateOfBirth)
  const now = new Date()

  const years = differenceInYears(now, birthDate)
  const months = differenceInMonths(now, birthDate) % 12
  const days = differenceInDays(now, birthDate) % 30

  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""}`
  } else if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""}`
  } else {
    return `${days} day${days > 1 ? "s" : ""}`
  }
}
