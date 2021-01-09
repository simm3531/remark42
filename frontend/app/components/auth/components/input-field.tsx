import { h, FunctionComponent } from 'preact';
import classnames from 'classnames';

import Input from 'components/input';
import TextareaAutosize from 'components/textarea-autosize';

import styles from './input-field.module.css';

export type InputFieldProps = {
  permanentClassName?: string;
  errorMessage?: string | boolean;
  label?: string;
  type?: string;
  value?: string;
  name?: string;
  onInput?(evt: Event): void;
  placeholder?: string;
  disabled?: boolean;
};

const InputField: FunctionComponent<InputFieldProps> = ({
  errorMessage,
  permanentClassName,
  label,
  type,
  ref,
  ...props
}) => (
  <label className={classnames(permanentClassName, styles.root)}>
    {label && (
      <div className={classnames(styles.label, { [`${permanentClassName}-label`]: permanentClassName })}>{label}</div>
    )}
    {type === 'textarea' ? (
      <TextareaAutosize
        className={classnames(styles.textarea, {
          [styles.inputError]: errorMessage,
          [`${permanentClassName}-input`]: permanentClassName,
        })}
        {...props}
      />
    ) : (
      <Input
        permanentClassName={classnames({
          [styles.inputError]: errorMessage,
          [`${permanentClassName}-input`]: permanentClassName,
        })}
        mix={styles.input}
        {...props}
      />
    )}

    {errorMessage && (
      <div className={classnames(styles.error, { [`${permanentClassName}-error`]: permanentClassName })}>
        {errorMessage}
      </div>
    )}
  </label>
);

export default InputField;
