import { h, FunctionComponent, JSX } from 'preact';
import classnames from 'classnames';

import Input from 'components/input';

import styles from './input-field.module.css';

export type InputFieldProps = {
  permanentClassName?: string;
  value: string;
  errorMessage?: string | boolean;
  label?: string;
} & Omit<JSX.HTMLAttributes<HTMLInputElement>, 'className' | 'kind'>;

const InputField: FunctionComponent<InputFieldProps> = ({
  value,
  onInput,
  errorMessage,
  permanentClassName,
  label,
  ...props
}) => (
  <label className={classnames(permanentClassName, styles.root)}>
    {label && (
      <div className={classnames(styles.label, { [`${permanentClassName}-label`]: permanentClassName })}>{label}</div>
    )}
    <Input
      permanentClassName={classnames({ [`${permanentClassName}-input`]: permanentClassName })}
      value={value}
      onInput={onInput}
      {...props}
    />
    {errorMessage && (
      <div className={classnames(styles.error, { [`${permanentClassName}-error`]: permanentClassName })}>
        {errorMessage}
      </div>
    )}
  </label>
);

export default InputField;
