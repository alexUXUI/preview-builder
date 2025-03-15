// import type { MFEOverride } from "./form.context";

// const STORAGE_KEY = "hawaii_mfe_overrides";

// export const getStoredOverrides = (): string => {
//   return localStorage.getItem(STORAGE_KEY) || "";
// };

// export const isOverrideExists = (name: string): boolean => {
//   const storedOverrides = getStoredOverrides();
//   return storedOverrides
//     .split(",")
//     .filter(Boolean)
//     .some((override) => {
//       const [overrideName, version] = override.split("_");
//       return overrideName === name && version && version.length > 0;
//     });
// };

// export const removeOverride = (name: string): void => {
//   const storedOverrides = getStoredOverrides();
//   const filteredOverrides = storedOverrides
//     .split(",")
//     .filter(Boolean)
//     .filter((override) => {
//       const [overrideName] = override.split("_");
//       return overrideName !== name;
//     })
//     .join(",");
//   localStorage.setItem(STORAGE_KEY, filteredOverrides);
// };

// export const updateOverrides = (overrides: MFEOverride[]): void => {
//   const overridesString = overrides
//     .filter((override) => override.version)
//     .map((override) => `${override.name}_${override.version}`)
//     .join(",");
//   localStorage.setItem(STORAGE_KEY, overridesString);
// };
