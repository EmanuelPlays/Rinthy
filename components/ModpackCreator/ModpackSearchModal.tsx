import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ChevronDown } from 'lucide-react';
import { searchProjects, fetchProjectVersions } from '../../services/modrinthService';
import { ModrinthProject, ModrinthVersion, ThemeMode } from '../../types';

interface ModpackSearchModalProps {
  theme: ThemeMode;
  t: (key: string) => string;
  token: string;
  minecraftVersion: string;
  onClose: () => void;
  onSelectVersion: (project: ModrinthProject, version: ModrinthVersion) => void;
}

const ModpackSearchModal: React.FC<ModpackSearchModalProps> = ({
  theme,
  t,
  token,
  minecraftVersion,
  onClose,
  onSelectVersion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ModrinthProject[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProjectVersions, setSelectedProjectVersions] = useState<ModrinthVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [currentProject, setCurrentProject] = useState<ModrinthProject | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchProjects(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  const handleAddProject = async (project: ModrinthProject) => {
    setCurrentProject(project);
    setLoadingVersions(true);
    try {
      const versions = await fetchProjectVersions(project.id, token);
      setSelectedProjectVersions(versions.filter(v => v.game_versions.includes(minecraftVersion)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleSelectVersion = (version: ModrinthVersion) => {
    if (!currentProject) return;
    onSelectVersion(currentProject, version);
  };

  const inputClass = theme === 'light'
    ? 'bg-black/[0.04] text-black border border-black/10 focus:border-modrinth-green'
    : 'bg-modrinth-card text-modrinth-text border-modrinth-border focus:border-modrinth-green';

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`${theme === 'light' ? 'bg-white' : 'bg-modrinth-card'} w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-scale-in flex flex-col max-h-[90vh] overflow-hidden`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-modrinth-text">{t('modpack_add_file')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-modrinth-muted"><X size={20} /></button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-modrinth-muted" size={18} />
          <input
            autoFocus
            type="text"
            placeholder={t('modpack_search_placeholder')}
            className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none border transition-colors ${inputClass}`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {searching && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-modrinth-green" /></div>}
          {!searching && searchResults.map(p => (
            <div
              key={p.id}
              onClick={() => handleAddProject(p)}
              className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${theme === 'light' ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <img src={p.icon_url} className="w-10 h-10 rounded-xl" alt="" />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-modrinth-text truncate">{p.title}</div>
                  <div className="text-[10px] text-modrinth-muted uppercase font-bold">{p.downloads.toLocaleString()} downloads</div>
                </div>
              </div>
              <ChevronDown size={18} className="text-modrinth-muted" />
            </div>
          ))}
        </div>

        {currentProject && (
          <div className="absolute inset-0 bg-inherit rounded-3xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-modrinth-text truncate pr-4">{currentProject.title}</h3>
              <button onClick={() => setCurrentProject(null)} className="p-2 hover:bg-black/5 rounded-full text-modrinth-muted"><X size={20} /></button>
            </div>
            <p className="text-xs text-modrinth-muted mb-4 uppercase font-bold tracking-wider">Select Version for {minecraftVersion}</p>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingVersions && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-modrinth-green" /></div>}
              {!loadingVersions && selectedProjectVersions.length === 0 && (
                <div className="text-center py-10 text-modrinth-muted italic">No compatible versions found.</div>
              )}
              {!loadingVersions && selectedProjectVersions.map(v => (
                <div
                  key={v.id}
                  onClick={() => handleSelectVersion(v)}
                  className={`p-3 rounded-2xl cursor-pointer transition-colors border ${theme === 'light' ? 'border-black/5 hover:bg-black/5' : 'border-white/5 hover:bg-white/5'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-modrinth-text">{v.version_number}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      v.version_type === 'release' ? 'bg-green-500/10 text-green-500' :
                      v.version_type === 'beta' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {v.version_type}
                    </span>
                  </div>
                  <div className="text-[10px] text-modrinth-muted mt-1 uppercase font-bold">{v.loaders.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModpackSearchModal;
