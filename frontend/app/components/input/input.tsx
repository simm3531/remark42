import { h, JSX } from 'preact';
import { forwardRef } from 'preact/compat';
import b, { Mods, Mix } from 'bem-react-helper';
import classnames from 'classnames';

import type { Theme } from 'common/types';

export type InputProps = {
  kind?: 'primary' | 'secondary';
  theme?: Theme;
  mods?: Mods;
  mix?: Mix;
  type?: string;
  permanentClassName?: string;
} & Omit<JSX.HTMLAttributes<HTMLInputElement>, 'className'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ children, permanentClassName, theme, mods, mix, type = 'text', ...props }, ref) => (
    <input
      className={classnames(permanentClassName, b('input', { mix }, { theme, ...mods }))}
      type={type}
      {...props}
      ref={ref}
    >
      {children}
    </input>
  )
);
