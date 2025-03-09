import { init } from '@module-federation/enhanced/runtime';
import { patchHawaiiManifestWithOverrides } from 'hawaii-runtime-tools';

export const getRemoteEntries = (manifest: any): any => {
  return Object.values(manifest.microFrontends)
    .flat()
    .map(
      ({
        url,
        extras: {
          moduleFederation: { remote },
        },
      }: as any) =>
        ({
          entry: url,
          name: remote,
        }) ,
    ) ;
};

export const useManifestQuery = async () => {
  const response: any = await fetch('http://localhost:4000/manifest');
  const mfes = response?.data;
  const patchedManifest: any = patchHawaiiManifestWithOverrides(mfes);
  const remotes = getRemoteEntries(patchedManifest);

  init({
    name: 'thread',
    remotes,
  });

  return mfes;
};
