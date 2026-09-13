import { useSearchParams } from "react-router-dom";

export function useEmbedMode() {
  const [params] = useSearchParams();
  return params.get("embed") === "1";
}
