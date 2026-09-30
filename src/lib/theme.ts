/** Where the visitor's choice is kept: "light", "dark", or absent for "system". */
export const THEME_STORAGE_KEY = "theme";

/**
 * Runs in <head> before first paint, so a dark page never flashes light. It is
 * rendered by the root layout (a Server Component) rather than by the client
 * provider: React 19 warns about a <script> rendered inside a client component.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;if(d)r.classList.add("dark");r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;
