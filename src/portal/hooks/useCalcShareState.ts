import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type ParamConfig = {
  key: string;
  urlKey: string;
  getter: () => string | number;
  setter: (v: string) => void;
  defaultValue: string | number;
};

export function useCalcShareState(params: ParamConfig[]) {
  const [searchParams] = useSearchParams();

  // Init from URL on mount
  useEffect(() => {
    let hasUrlParams = false;
    params.forEach(({ urlKey }) => {
      if (searchParams.has(urlKey)) hasUrlParams = true;
    });
    if (!hasUrlParams) return;

    params.forEach(({ urlKey, setter }) => {
      const val = searchParams.get(urlKey);
      if (val !== null) setter(val);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyShareLink = useCallback(() => {
    const url = new URL(window.location.href);
    url.search = "";
    params.forEach(({ urlKey, getter, defaultValue }) => {
      const val = String(getter());
      if (val !== String(defaultValue)) {
        url.searchParams.set(urlKey, val);
      }
    });
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast.success("Посилання скопійовано — надішліть друзям або збережіть");
    }).catch(() => {
      toast.error("Не вдалося скопіювати посилання");
    });
  }, [params]);

  return { copyShareLink };
}
