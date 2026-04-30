import React from 'react';
import { Trash2 } from 'lucide-react';
import { ModpackFile } from './types';
import { ThemeMode } from '../../types';

interface ModpackFileListProps {
  files: ModpackFile[];
  onRemove: (index: number) => void;
  theme: ThemeMode;
  t: (key: string) => string;
}

const ModpackFileList: React.FC<ModpackFileListProps> = ({ files, onRemove, theme, t }) => {
  const cardClass = theme === 'light'
    ? 'bg-white border border-black/10'
    : 'bg-modrinth-card/50 backdrop-blur-xl border-modrinth-border';

  return (
    <div className="space-y-2">
      {files.map((file, idx) => (
        <div key={idx} className={`${cardClass} p-3 rounded-2xl flex items-center gap-3 animate-fade-in-up`}>
          <img src={file.project.icon_url} className="w-10 h-10 rounded-lg bg-modrinth-bg" alt="" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-modrinth-text truncate">{file.project.title}</div>
            <div className="text-[10px] text-modrinth-muted uppercase font-bold">{file.version.version_number}</div>
          </div>
          <button
            onClick={() => onRemove(idx)}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      {files.length === 0 && (
        <div className="text-center py-10 text-modrinth-muted italic text-sm">
          {t('modpack_no_files')}
        </div>
      )}
    </div>
  );
};

export default ModpackFileList;
