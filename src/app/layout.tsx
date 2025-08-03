import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { Toaster } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AppPad',
  description: 'AppPad is a platform for creating and managing your apps\' codebase.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          cz-shortcut-listen="false"
        >
          <header className="flex justify-between items-center p-4 gap-4 h-16 border-b border-gray-200 dark:border-gray-800">
            <Link href="/">
              <div className="flex items-center gap-4">
                <Image src="/logo.png" alt="AppPad" width={32} height={32} className='rounded-full' />
                <h1 className='text-2xl font-bold text-blue-700 dark:text-blue-400'>AppPad</h1>
              </div>
            </Link>
            <div className='flex items-center gap-4'>
              <SignedOut>
                <SignInButton />
                <SignUpButton>
                  <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              <ThemeSwitcher />

            </div>
          </header>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}