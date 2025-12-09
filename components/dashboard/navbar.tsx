'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { NotificationsBell } from './notifications'
import { SearchBar } from './search-bar'
import { LayoutDashboard, Users, Clock, TreeDeciduous, User, Award, Lock, BookHeart, Component, LogOut, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const mainNav = [
    { name: 'Feed', href: '/feed', icon: Users },
    { name: 'Family Tree', href: '/family-tree', icon: TreeDeciduous },
  ]

  const featureNav = [
    { name: 'Memory', href: '/memory-capsule', icon: Clock },
    { name: 'Tapestry', href: '/tapestry', icon: Component },
    { name: 'Traditions', href: '/traditions', icon: BookHeart },
  ]

  const assetNav = [
    { name: 'Vault', href: '/vault', icon: Lock },
    { name: 'Legacy Wall', href: '/legacy-wall', icon: Award },
  ]

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center pr-4">
              <Link href="/feed" className="text-xl font-mix font-semibold">
                Family Legacy
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              {/* Group 1: Core */}
              {mainNav.map((item) => (
                <NavLink key={item.href} item={item} isActive={pathname === item.href} />
              ))}

              <div className="h-6 w-px bg-slate-200 mx-2" />

              {/* Group 2: Features */}
              {featureNav.map((item) => (
                <NavLink key={item.href} item={item} isActive={pathname === item.href} />
              ))}

              <div className="h-6 w-px bg-slate-200 mx-2" />

              {/* Group 3: Assets */}
              {assetNav.map((item) => (
                <NavLink key={item.href} item={item} isActive={pathname === item.href} />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationsBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border border-slate-200">
                    {/* Placeholder for now, real avatar would come from context or prop */}
                    <AvatarImage src="/avatars/01.png" alt="User" />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="p-2 border-b border-gray-100">
                  <SearchBar />
                </div>
                <DropdownMenuLabel className="font-normal mt-1">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">User Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Manage your profile and settings
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ item, isActive }: { item: any, isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${isActive
        ? 'text-slate-900 font-semibold'
        : 'text-slate-500 hover:text-slate-700'
        }`}
    >
      <item.icon className={`w-4 h-4 mr-1.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
      <span className="hidden lg:inline">{item.name}</span>
      <span className="lg:hidden" title={item.name}></span>
    </Link>
  )
}

