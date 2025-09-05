import { FaBaby } from "react-icons/fa"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { SignupForm } from "../components/signup-form"

export default function SignupPage() {
  return (
    <div className="from-primary/5 via-background to-muted min-h-svh bg-gradient-to-br">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
      >
        <Link
          to="/"
          className="flex items-center gap-3 text-xl font-semibold hover:opacity-80"
        >
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md shadow-sm">
            <FaBaby className="size-5" />
          </div>
          BabyPal
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-[400px]"
        >
          <SignupForm className="w-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-center text-sm"
        >
          By signing up, you agree to our{" "}
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
        </motion.div>
      </motion.div>
    </div>
  )
}
