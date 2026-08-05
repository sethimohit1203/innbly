import { forwardRef } from 'react'
import { Link as RouterLink, NavLink as RouterNavLink, type LinkProps, type NavLinkProps } from 'react-router-dom'

/** Internal navigation stays in the same tab (normal SPA client-side
 * routing). Only property listing links open in a new tab — see
 * PropertyCard's explicit target="_blank" on its listing link. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  return <RouterLink ref={ref} {...props} />
})

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(props, ref) {
  return <RouterNavLink ref={ref} {...props} />
})
