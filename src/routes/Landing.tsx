import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FaBaby, FaRuler, FaWeight, FaChartLine } from "react-icons/fa"
import { motion } from "framer-motion"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const features = [
  {
    icon: FaWeight,
    title: "Track Weight",
    description:
      "Monitor your baby's weight progression with easy-to-read charts",
  },
  {
    icon: FaRuler,
    title: "Measure Growth",
    description: "Record height and head circumference measurements",
  },
  {
    icon: FaChartLine,
    title: "View Progress",
    description: "Visualize growth patterns and milestones over time",
  },
]

function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-svh bg-gradient-to-b from-white to-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          className="flex items-center justify-between"
        >
          <a href="#" className="flex items-center gap-2 text-xl font-bold">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <FaBaby className="size-5" />
            </div>
            BabyPal
          </a>
          {/* <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/signup")}>Sign Up</Button>
          </div> */}
        </motion.div>

        <div className="mt-24 flex flex-col items-center text-center">
          <motion.h1
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold tracking-tight sm:text-6xl"
          >
            Track Your Baby's Growth
            <br />
            <span className="text-primary">With Confidence</span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mt-6 text-lg"
          >
            A simple and intuitive way to monitor your baby's development.
            <br />
            Record measurements, track progress, and celebrate growth
            milestones.
          </motion.p>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className="mt-10 flex gap-4"
          >
            <Button size="lg" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.8,
                staggerChildren: 0.2,
              },
            },
          }}
          className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeIn}
              className="bg-card flex flex-col items-center rounded-lg border p-6 text-center shadow-sm"
            >
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                <feature.icon className="size-6" />
              </div>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Landing
