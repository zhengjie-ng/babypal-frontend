import { describe, it, expect } from "vitest"
import { formatDate, calculateAge } from "@/lib/utils"

describe("Utils", () => {
  describe("formatDate", () => {
    it("should format a date string correctly", () => {
      const dateString = "2025-09-05T14:30:00Z"
      const formattedDate = formatDate(dateString)
      expect(formattedDate).toMatch(/September 5, 2025 at \d{1,2}:\d{2} [AP]M/)
    })

    it("should handle custom format strings", () => {
      const dateString = "2025-09-05T14:30:00Z"
      const formattedDate = formatDate(dateString, "yyyy-MM-dd")
      expect(formattedDate).toBe("2025-09-05")
    })

    it("should return original string if date is invalid", () => {
      const invalidDate = "not-a-date"
      const result = formatDate(invalidDate)
      expect(result).toBe(invalidDate)
    })
  })

  describe("calculateAge", () => {
    it("should calculate age in years correctly", () => {
      const dob = "2020-01-01T00:00:00Z"
      const age = calculateAge(dob)
      expect(age).toMatch(/\d+ years?/)
    })

    it("should calculate age in months correctly", () => {
      // Create a date 6 months ago
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const dob = sixMonthsAgo.toISOString()
      const age = calculateAge(dob)
      expect(age).toMatch(/\d+ months?/)
    })

    it("should calculate age in days correctly", () => {
      // Create a date 5 days ago
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      const dob = fiveDaysAgo.toISOString()
      const age = calculateAge(dob)
      expect(age).toMatch(/\d+ days?/)
    })
  })
})
