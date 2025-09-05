import { FaBaby } from "react-icons/fa"
import { LoginForm } from "@/components/login-form"
import { Link } from "react-router-dom"

export default function LoginPage() {
  return (
    <div className="from-primary/5 via-background to-muted min-h-svh w-full bg-gradient-to-br">
      <div className="">
        <div className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2">
          <div className="mx-auto flex max-w-[400px] flex-col items-center justify-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-3 text-xl font-semibold transition-opacity hover:opacity-80"
            >
              <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md shadow-sm">
                <FaBaby className="size-6" />
              </div>
              BabyPal
            </Link>

            <div className="w-full">
              <LoginForm className="w-full" />
            </div>

            <div className="text-muted-foreground text-center text-sm">
              By logging in, you agree to our{" "}
              <Link
                to="/terms"
                className="hover:text-primary underline underline-offset-4"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="hover:text-primary underline underline-offset-4"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
