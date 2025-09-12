import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AuthProvider } from "@/context/AuthContext"
import { LoginForm } from "@/components/login-form"
import { BrowserRouter } from "react-router-dom"

// Mock the API module
vi.mock("@/services/api", () => ({
  default: {
    post: vi.fn(),
  },
}))

// Import the mocked API for test setup
import api from "@/services/api"
const mockedApi = api as unknown as {
  post: ReturnType<typeof vi.fn>
}

describe("Authentication", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it("should render login form correctly", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    )

    // Check if essential elements are present
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in with github/i })).toBeInTheDocument()
  })

  it("should disable submit button while loading", async () => {
    // Mock API to return a delayed promise
    mockedApi.post.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                status: 200,
                data: { jwtToken: "fake-token" },
              }),
            100
          )
        )
    )

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    )

    const submitButton = screen.getByRole("button", { name: /^sign in$/i })

    // Fill in required form fields
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })

    // Trigger form submission
    fireEvent.click(submitButton)

    // Button should show loading state immediately
    expect(
      screen.getByRole("button", { name: /signing in/i })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled()
  })

  it("should handle form submission", async () => {
    // Mock successful API response
    mockedApi.post.mockResolvedValue({
      status: 200,
      data: { jwtToken: "fake-token" },
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    )

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }))

    // Verify form submission was attempted
    expect(
      screen.getByRole("button", { name: /signing in/i })
    ).toBeInTheDocument()
  })
})
