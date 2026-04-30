import React, { useState } from 'react';
import { Plus, Download, Loader2 } from 'lucide-react';
import { ModrinthProject, ModrinthVersion, ThemeMode } from '../../types';
import ModpackSearchModal from './ModpackSearchModal';
import ModpackFileList from './ModpackFileList';
import { exportModpack } from './ModpackExport';
import { ModpackFile } from './types';

interface ModpackCreatorProps {
  theme: ThemeMode;
  t: (key: string) => string;
  token: string;
}

const ModpackCreator: React.FC<ModpackCreatorProps> = ({ theme, t, token }) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [summary, setSummary] = useState('');
  const [minecraftVersion, setMinecraftVersion] = useState('1.20.1');
  const [loader, setLoader] = useState<'fabric' | 'forge' | 'neoforge' | 'quilt'>('fabric');
  const [loaderVersion, setLoaderVersion] = useState('');
  const [files, setFiles] = useState<ModpackFile[]>([]);
  const [exporting, setExporting] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSelectVersion = (project: ModrinthProject, version: ModrinthVersion) => {
    setFiles(prev => [...prev, { project, version }]);
    setShowSearch(false);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportModpack(name, version, summary, minecraftVersion, loader, loaderVersion, files, t);
    } catch (e) {
      console.error(e);
      alert("Failed to export modpack");
    } finally {
      setExporting(false);
    }
  };

  const inputClass = theme === 'light'
    ? 'bg-black/[0.04] text-black border border-black/10 focus:border-modrinth-green'
    : 'bg-modrinth-card text-modrinth-text border-modrinth-border focus:border-modrinth-green';

  const cardClass = theme === 'light'
    ? 'bg-white border border-black/10'
    : 'bg-modrinth-card/50 backdrop-blur-xl border-modrinth-border';

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-modrinth-text">{t('modpack_creator')}</h1>
        <p className="text-modrinth-muted text-xs font-medium">{t('dev_panel')}</p>
      </header>

      <div className={`${cardClass} p-5 rounded-3xl space-y-4 shadow-lg`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-modrinth-muted uppercase mb-1.5">{t('modpack_name')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full rounded-xl p-3 text-sm outline-none transition-colors ${inputClass}`}
              placeholder="Cool Pack"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-modrinth-muted uppercase mb-1.5">{t('modpack_version')}</label>
            <input
              type="text"
              value={version}
              onChange={e => setVersion(e.target.value)}
              className={`w-full rounded-xl p-3 text-sm outline-none transition-colors ${inputClass}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-modrinth-muted uppercase mb-1.5">{t('modpack_summary')}</label>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            className={`w-full rounded-xl p-3 text-sm outline-none transition-colors h-20 resize-none ${inputClass}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-modrinth-muted uppercase mb-1.5">{t('modpack_game')} Version</label>
            <input
              type="text"
              value={minecraftVersion}
              onChange={e => setMinecraftVersion(e.target.value)}
              className={`w-full rounded-xl p-3 text-sm outline-none transition-colors ${inputClass}`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-modrinth-muted uppercase mb-1.5">Loader</label>
            <select
              value={loader}
              onChange={e => setLoader(e.target.value as any)}
              className={`w-full rounded-xl p-3 text-sm outline-none transition-colors ${inputClass}`}
            >
              <option value="fabric">Fabric</option>
              <option value="forge">Forge</option>
              <option value="neoforge">NeoForge</option>
              <option value="quilt">Quilt</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-modrinth-muted uppercase">{t('modpack_files')}</h3>
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 bg-modrinth-green text-white px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform"
          >
            <Plus size={16} /> {t('modpack_add_file')}
          </button>
        </div>

        <ModpackFileList files={files} onRemove={handleRemoveFile} theme={theme} t={t} />
      </div>

      <button
        onClick={handleExport}
        disabled={exporting || files.length === 0}
        className="w-full bg-modrinth-green text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-modrinth-green/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
      >
        {exporting ? <Loader2 className="animate-spin" /> : <Download size={20} />}
        {exporting ? t('modpack_exporting') : t('modpack_export')}
      </button>

      {showSearch && (
        <ModpackSearchModal
          theme={theme}
          t={t}
          token={token}
          minecraftVersion={minecraftVersion}
          onClose={() => setShowSearch(false)}
          onSelectVersion={handleSelectVersion}
        />
      )}
    </div>
  );
};

export default ModpackCreator;
