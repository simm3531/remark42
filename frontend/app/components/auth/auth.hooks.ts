import { useEffect, useRef, useState } from 'preact/hooks';

export function useDropdown(disableClosing?: boolean) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const toggleDropdownState = (evt: Event) => {
    evt.preventDefault();
    setShowDropdown((s) => !s);
  };

  useEffect(() => {
    const dropdownElement = rootRef.current;

    function handleClickOutside(evt: MouseEvent) {
      setShowDropdown((state) => {
        if (!state) {
          return false;
        }

        return !disableClosing && dropdownElement?.contains(evt.target as HTMLDivElement);
      });
    }

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [disableClosing]);

  useEffect(() => {
    document.body.style.minHeight = showDropdown ? `600px` : 'auto';
  }, [showDropdown]);

  return [rootRef, showDropdown, toggleDropdownState] as const;
}
