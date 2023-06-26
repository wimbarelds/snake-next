import Link from 'next/link';

import style from './Navigation.module.css';

export function Navigation() {
  return (
    <nav className={style.navbar}>
      <Link className={style.navlink} href="/">
        Play
      </Link>
      <Link className={style.navlink} href="/edit">
        Edit
      </Link>
      <Link className={style.navlink} href="/about">
        About
      </Link>
      <Link className={style.navlink} href="/test">
        Test
      </Link>
    </nav>
  );
}
