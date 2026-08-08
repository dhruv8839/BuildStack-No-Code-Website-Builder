import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { undo, redo } from '../state/builderSlice';

export function useUndoRedo() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is actively typing inside a text input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(target.closest && target.closest('[contenteditable="true"]'))
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (!modifierKey) return;

      const key = e.key.toLowerCase();

      // Undo: Ctrl+Z or Ctrl+X (when not typing)
      if (key === 'z' || key === 'x' || e.code === 'KeyZ' || e.code === 'KeyX') {
        if (!e.shiftKey) {
          e.preventDefault();
          dispatch(undo());
        } else {
          // Ctrl+Shift+Z -> Redo
          e.preventDefault();
          dispatch(redo());
        }
      } 
      // Redo: Ctrl+Y
      else if (key === 'y' || e.code === 'KeyY') {
        e.preventDefault();
        dispatch(redo());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
}
