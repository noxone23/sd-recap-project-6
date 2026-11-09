import { NavLink } from "react-router";

export default function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <NavLink to="/" end>
        Spotlight
      </NavLink>
      <NavLink to="/art-pieces">Gallery</NavLink>
    </nav>
  );
}
