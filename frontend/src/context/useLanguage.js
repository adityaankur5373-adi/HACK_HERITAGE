import { useContext } from "react";
import LanguageContext from "./languageContextValue";

export default function useLanguage() {
  return useContext(LanguageContext);
}
