import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

// GET helper: returns { data, loading, error, reload }. Pass null to skip fetching.
export function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: !!url, error: "" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!url) return;
    let live = true;
    setState((s) => ({ ...s, loading: true }));
    api.get(url)
      .then((data) => live && setState({ data, loading: false, error: "" }))
      .catch((e) => live && setState({ data: null, loading: false, error: e.message }));
    return () => { live = false; };
  }, [url, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export function useRoute() {
  const read = () => {
    const [path, qs = ""] = (location.hash.slice(1) || "/").split("?");
    return { path, query: Object.fromEntries(new URLSearchParams(qs)) };
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0); };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return route;
}
export const go = (to) => { location.hash = to; };
