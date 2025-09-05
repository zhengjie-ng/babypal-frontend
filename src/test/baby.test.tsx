import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { BabyProvider, default as BabyContext } from "../context/BabyContext"
import NavBaby from "../components/nav-baby"
import { BrowserRouter } from "react-router-dom"

interface Record {
  id: number
  type: string
  startTime: string
  note: string | null
}

interface Measurement {
  id: number
  weight: number
  height: number
  headCircumference: number
  time: string
  baby: { id: number }
}

interface Baby {
  id: number
  name: string
  gender: string
  dateOfBirth: string
  weight: number
  height: number
  headCircumference: number
  caregivers: string[]
  owner: string
  records: Record[]
  measurements: Measurement[]
}

// Mock BabyContext values
const mockBabyContext = {
  babies: [] as Baby[],
  currentBaby: null as Baby | null,
  fetchBabies: vi.fn(),
  updateCurrentBabyRecords: vi.fn(),
  onBabySelect: vi.fn(),
  onBabyAdd: vi.fn(),
  onBabyDelete: vi.fn(),
  onBabyUpdate: vi.fn(),
}

// Mock AuthContext
const mockAuthContext: AuthContextType = {
  token: "fake-token",
  currentUser: {
    username: "testuser",
    role: { roleId: 1, roleName: "ROLE_USER" },
  },
  isAdmin: false,
  loading: false,
}

interface AuthContextType {
  token: string
  currentUser: {
    username: string
    role: {
      roleId: number
      roleName: string
    }
  }
  isAdmin: boolean
  loading: boolean
}

vi.mock("../context/AuthContext", () => {
  const mockAuthHook = vi.fn(() => mockAuthContext)
  return {
    default: {
      Consumer: ({
        children,
      }: {
        children: (value: AuthContextType) => React.ReactNode
      }) => children(mockAuthContext),
    },
    useAuth: mockAuthHook,
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

const mockBabies = [
  {
    id: 1,
    name: "Baby 1",
    dateOfBirth: "2023-01-01",
    gender: "M",
    weight: 3.5,
    height: 50,
    headCircumference: 35,
    caregivers: ["testuser"],
    owner: "testuser",
    records: [],
    measurements: [],
  },
  {
    id: 2,
    name: "Baby 2",
    dateOfBirth: "2023-06-01",
    gender: "F",
    weight: 3.2,
    height: 48,
    headCircumference: 34,
    caregivers: ["testuser"],
    owner: "testuser",
    records: [],
    measurements: [],
  },
]

interface BabyContextType {
  babies: typeof mockBabies
  currentBaby: (typeof mockBabies)[0] | null
  fetchBabies: () => Promise<void>
  updateCurrentBabyRecords: () => Promise<void>
  onBabySelect: (babyId: number) => void
  onBabyAdd: (
    baby: Omit<
      (typeof mockBabies)[0],
      "id" | "owner" | "caregivers" | "records" | "measurements"
    >
  ) => Promise<void>
  onBabyDelete: (babyId: number) => Promise<void>
  onBabyUpdate: (
    babyId: number,
    baby: Omit<
      (typeof mockBabies)[0],
      "id" | "owner" | "records" | "measurements"
    >
  ) => Promise<void>
}

// Mock useContext hook
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react")
  return {
    ...actual,
    useContext: (context: React.Context<unknown>) => {
      if (context === BabyContext) {
        return {
          babies: mockBabies,
          currentBaby: mockBabies[0],
          fetchBabies: vi.fn(),
          updateCurrentBabyRecords: vi.fn(),
          onBabySelect: vi.fn(),
          onBabyAdd: vi.fn(),
          onBabyDelete: vi.fn(),
          onBabyUpdate: vi.fn(),
        } as BabyContextType
      }
      return actual.useContext(context)
    },
  }
})

describe("Baby Context", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBabyContext.babies = [
      {
        id: 1,
        name: "Baby 1",
        dateOfBirth: "2023-01-01",
        gender: "M",
        weight: 3.5,
        height: 50,
        headCircumference: 35,
        caregivers: ["testuser"],
        owner: "testuser",
        records: [],
        measurements: [],
      },
      {
        id: 2,
        name: "Baby 2",
        dateOfBirth: "2023-06-01",
        gender: "F",
        weight: 3.2,
        height: 48,
        headCircumference: 34,
        caregivers: ["testuser"],
        owner: "testuser",
        records: [],
        measurements: [],
      },
    ]
  })

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <div data-testid="auth-provider-mock">
          <BabyProvider>{ui}</BabyProvider>
        </div>
      </BrowserRouter>
    )
  }

  it("should render baby navigation with babies", async () => {
    renderWithProviders(<NavBaby />)

    // Wait for babies to load and check if they're displayed
    expect(await screen.findByText("Baby 1")).toBeInTheDocument()
    expect(await screen.findByText("Baby 2")).toBeInTheDocument()
  })

  it("should select first baby by default", async () => {
    renderWithProviders(<NavBaby />)

    // Wait for babies to load
    const firstBabyButton = await screen.findByText("Baby 1")

    // Check if the first baby is selected (has primary background color)
    expect(firstBabyButton.closest("button")).toHaveClass("bg-primary")
  })

  it("should show add baby button", async () => {
    renderWithProviders(<NavBaby />)

    // Check if add baby button is present
    expect(
      await screen.findByRole("button", { name: /add baby/i })
    ).toBeInTheDocument()
  })
})
