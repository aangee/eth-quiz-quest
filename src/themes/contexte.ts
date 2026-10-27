import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { themeParId } from './registre';

/** Thème courant, fourni par App. */
export const ThemeContexte = createContext(themeParId(undefined));
export const useTheme = () => useContext(ThemeContexte);
