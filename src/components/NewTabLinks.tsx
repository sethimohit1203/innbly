import { forwardRef } from 'react'
import { Link as RouterLink, NavLink as RouterNavLink, type LinkProps, type NavLinkProps } from 'react-router-dom'

/** Every internal navigation link on the site opens in a new tab, per
 * product decision — wrapping react-router-dom's Link/NavLink here forces
 * that consistently instead of relying on every call site remembering to
 * set target="_blank". Note the real tradeoff: a link that opens in a new
 * tab does a full browser navigation there (the SPA reloads from scratch),
 * it isn't a client-side route transition — that's the nature of opening
 * any link in a new tab, not a bug in this wrapper. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  return <RouterLink ref={ref} {...props} target="_blank" rel="noopener noreferrer" />
})

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(props, ref) {
  return <RouterNavLink ref={ref} {...props} target="_blank" rel="noopener noreferrer" />
})
