import JSZip from 'jszip';
import { ModpackFile } from './types';

export const exportModpack = async (
  name: string,
  version: string,
  summary: string,
  minecraftVersion: string,
  loader: string,
  loaderVersion: string,
  files: ModpackFile[],
  t: (key: string) => string
) => {
  const zip = new JSZip();

  const indexJson = {
    formatVersion: 1,
    game: "minecraft",
    versionId: version,
    name: name || "My Modpack",
    summary: summary,
    files: files.map(f => {
      const primaryFile = f.version.files.find(file => file.primary) || f.version.files[0];
      return {
        path: `mods/${primaryFile.filename}`,
        hashes: primaryFile.hashes,
        env: {
          client: f.project.client_side || "required",
          server: f.project.server_side || "required"
        },
        downloads: [primaryFile.url],
        fileSize: primaryFile.size
      };
    }),
    dependencies: {
      minecraft: minecraftVersion,
      [loader]: loaderVersion || "latest"
    }
  };

  zip.file("modrinth.index.json", JSON.stringify(indexJson, null, 2));
  zip.folder("overrides");

  const content = await zip.generateAsync({ type: "blob" });
  const url = window.URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name || "modpack"}.mrpack`;
  link.click();
  window.URL.revokeObjectURL(url);

  const toast = document.createElement('div');
  toast.innerText = t('modpack_exported');
  toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-modrinth-green text-white px-6 py-3 rounded-full shadow-xl z-[200] font-bold text-sm';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
};
