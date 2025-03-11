"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"

type PageType = "home" | "game" | "other"

interface PageContextType {
  currentPage: PageType
}

const PageContext = createContext<PageContextType>({ currentPage: "other" })

export const usePageContext = () => useContext(PageContext)

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<PageType>("other")
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/") {
      setCurrentPage("home")
    } else if (pathname === "/game") {
      setCurrentPage("game")
    } else {
      setCurrentPage("other")
    }
  }, [pathname])

  return <PageContext.Provider value={{ currentPage }}>{children}</PageContext.Provider>
}
