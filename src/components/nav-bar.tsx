/* eslint-disable @typescript-eslint/no-unused-vars */
import { GiHamburgerMenu } from "react-icons/gi"
import * as React from "react"
import { useEffect, useContext, useState, useRef } from "react"

export interface Navbar05NavItem {
  href: string
  label: string
}

export interface Navbar05Props extends React.HTMLAttributes<HTMLElement> {
  logoHref?: string
  navigationLinks?: Navbar05NavItem[]
  userName?: string
  userEmail?: string
  userAvatar?: string
  onNavItemClick?: (href: string) => void
  onUserItemClick?: (item: string) => void
}
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { FaBaby } from "react-icons/fa"
// import type { ComponentProps } from "react"
import AuthContext from "@/context/AuthContext"
import { useNavigate, Outlet, useLocation } from "react-router-dom"

// User Menu Component
const UserMenu = ({
  username = "Guest",
  email = "",
  userAvatar,
  onItemClick,
}: {
  username?: string
  email?: string
  userAvatar?: string
  onItemClick?: (item: string) => void
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="hover:bg-accent hover:text-accent-foreground h-9 px-2 py-0"
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={userAvatar} alt={username} />
          <AvatarFallback className="text-xs">
            {username?.slice(0, 2).toUpperCase() || "GU"}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon className="ml-1 h-3 w-3" />
        <span className="sr-only">User menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm leading-none font-medium">{username}</p>
          {email && (
            <p className="text-muted-foreground text-xs leading-none">
              {email}
            </p>
          )}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("profile")}>
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("logout")}>
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
// Keep navigation links and component
// Default navigation links
const baseNavigationLinks: Navbar05NavItem[] = [
  { href: "/home", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/measurements", label: "Measurements" },
]

const adminNavigationLink: Navbar05NavItem = { href: "/admin", label: "Admin" }

export const Navbar05 = React.forwardRef<HTMLElement, Navbar05Props>(
  (
    {
      className,
      logoHref = "#",
      navigationLinks: defaultLinks = baseNavigationLinks,
      userName = "Guest",
      userEmail = "",
      userAvatar,
      onNavItemClick,
      onUserItemClick,
      ...props
    },
    ref
  ) => {
    const location = useLocation()
    const navigate = useNavigate()
    const authCtx = useContext(AuthContext)
    const [isMobile, setIsMobile] = useState(false)
    const containerRef = useRef<HTMLElement>(null)

    // Get the current navigation links based on user role
    const getNavigationLinks = () => {
      const links = [...baseNavigationLinks]
      if (authCtx?.isAdmin) {
        links.push(adminNavigationLink)
      }
      return links
    }

    const isActive = (href: string) => {
      return location.pathname === href
    }

    // Add this handler
    const handleNavigation = (href: string) => {
      if (onNavItemClick) {
        onNavItemClick(href)
      }
      navigate(href)
    }

    // Update navigation links based on user role
    const currentNavigationLinks = getNavigationLinks()

    const handleUserItemClick = (item: string) => {
      if (item === "logout" && authCtx?.onLogoutHandler) {
        authCtx.onLogoutHandler()
      } else if (onUserItemClick) {
        onUserItemClick(item)
      }
    }
    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth
          setIsMobile(width < 768) // 768px is md breakpoint
        }
      }
      checkWidth()
      const resizeObserver = new ResizeObserver(checkWidth)
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }
      return () => {
        resizeObserver.disconnect()
      }
    }, [])
    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )
    return (
      <>
        <header
          ref={combinedRef}
          className={cn(
            "bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b px-4 backdrop-blur md:px-6 [&_*]:no-underline",
            className
          )}
          {...props}
        >
          <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
            {/* Left side */}
            <div className="flex items-center gap-2">
              {/* Mobile menu trigger */}
              {isMobile && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="group hover:bg-accent hover:text-accent-foreground h-9 w-9"
                      variant="ghost"
                      size="icon"
                    >
                      <GiHamburgerMenu />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64 p-1">
                    <NavigationMenu className="max-w-none">
                      <NavigationMenuList className="flex-col items-start gap-0">
                        {currentNavigationLinks.map((link, index: number) => (
                          <NavigationMenuItem key={index} className="w-full">
                            <button
                              onClick={() =>
                                link.href && handleNavigation(link.href)
                              }
                              className={cn(
                                "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors",
                                {
                                  "bg-accent text-accent-foreground":
                                    link.href && isActive(link.href),
                                  "hover:bg-accent hover:text-accent-foreground":
                                    !(link.href && isActive(link.href)),
                                }
                              )}
                            >
                              {link.label}
                            </button>
                          </NavigationMenuItem>
                        ))}
                      </NavigationMenuList>
                    </NavigationMenu>
                  </PopoverContent>
                </Popover>
              )}
              {/* Main nav */}
              <div className="flex items-center gap-6">
                <button
                  onClick={(e) => e.preventDefault()}
                  className="text-primary hover:text-primary/90 flex cursor-pointer items-center space-x-2 transition-colors"
                >
                  <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                    <FaBaby className="size-4" />
                  </div>
                  <span className="hidden text-xl font-bold sm:inline-block">
                    BabyPal
                  </span>
                </button>
                {/* Navigation menu */}
                {!isMobile && (
                  <NavigationMenu className="flex">
                    <NavigationMenuList className="gap-1">
                      {currentNavigationLinks.map((link, index: number) => (
                        <NavigationMenuItem key={index}>
                          <NavigationMenuLink
                            href={link.href}
                            onClick={(e) => {
                              e.preventDefault()
                              if (link.href) {
                                handleNavigation(link.href)
                              }
                            }}
                            className={cn(
                              "text-muted-foreground group bg-background inline-flex h-10 w-max cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                              {
                                "bg-accent text-accent-foreground":
                                  link.href && isActive(link.href),
                                "hover:text-primary focus:bg-accent focus:text-accent-foreground":
                                  !(link.href && isActive(link.href)),
                              }
                            )}
                          >
                            {link.label}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      ))}
                    </NavigationMenuList>
                  </NavigationMenu>
                )}
              </div>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"></div>
              {/* User menu */}
              <UserMenu
                username={
                  authCtx?.currentUser?.username
                    ? authCtx.currentUser.username.charAt(0).toUpperCase() +
                      authCtx.currentUser.username.slice(1)
                    : userName
                }
                email={authCtx?.currentUser?.email}
                userAvatar={userAvatar}
                onItemClick={handleUserItemClick}
              />
            </div>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </>
    )
  }
)
Navbar05.displayName = "Navbar05"
export { UserMenu }
