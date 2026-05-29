import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Menu, X, Github } from 'lucide-react'
import { AppDispatch, RootState } from '@/redux/store'
import { toggleDarkMode } from '@/redux/themeSlice'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { Container } from './primitives'
import { LINKS } from '../links'

const NAV_LINKS = [
  { label: 'Principles', href: '#principles' },
  { label: 'Platform', href: '#platform' },
  { label: 'Audiences', href: '#audiences' },
  { label: 'Adoption', href: '#adoption' },
]

export const Nav: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const isDarkMode = useSelector((s: RootState) => s.theme.isDarkMode)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled
          ? 'border-b border-border bg-background/85 backdrop-blur-xl'
          : 'border-b border-transparent'
      )}
    >
      <Container className='flex h-16 items-center justify-between'>
        {/* Brand lockup */}
        <a href='#top' className='flex items-center' aria-label='DARE — home'>
          <Logo size='sm' showTagline />
        </a>

        {/* Desktop nav */}
        <nav className='hidden items-center gap-9 md:flex'>
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          <a
            href={LINKS.repository}
            target='_blank'
            rel='noreferrer'
            className='hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex'
            aria-label='View on GitHub'
          >
            <Github className='h-[1.05rem] w-[1.05rem]' />
          </a>

          <button
            onClick={() => dispatch(toggleDarkMode())}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            aria-label='Toggle theme'
          >
            {isDarkMode ? (
              <Sun className='h-[1.05rem] w-[1.05rem]' />
            ) : (
              <Moon className='h-[1.05rem] w-[1.05rem]' />
            )}
          </button>

          <button
            onClick={() => navigate(LINKS.console)}
            className='hidden h-9 items-center rounded-lg bg-dare-gradient px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 md:inline-flex'
          >
            Launch console
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden'
            aria-label='Menu'
          >
            {mobileOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className='border-t border-border bg-background md:hidden'>
          <Container className='flex flex-col gap-1 py-4'>
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className='rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false)
                navigate(LINKS.console)
              }}
              className='mt-2 h-11 rounded-lg bg-dare-gradient text-sm font-semibold text-white'
            >
              Launch console
            </button>
          </Container>
        </div>
      )}
    </header>
  )
}

export default Nav
