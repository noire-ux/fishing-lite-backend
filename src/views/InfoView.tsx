
import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

const ChangeLogPrefix: React.FC<{ type: 'add' | 'update' | 'remove' }> = ({ type }) => {
    const styles = { add: { text: '[+]', color: 'text-green-400' }, update: { text: '[/]', color: 'text-blue-400' }, remove: { text: '[-]', color: 'text-red-400' } };
    const { text, color } = styles[type] || styles.update;
    return <span className={`mr-2 font-mono font-bold ${color}`}>{text}</span>;
};

export const InfoView: React.FC = () => {
    const { patchNotes, patchNotesError } = usePlayer();
    const [copySuccess, setCopySuccess] = useState(false);

    const sqlCommand = `-- 1. Setup Patch Notes Table
create table if not exists public.patch_notes (
  id uuid default gen_random_uuid() primary key,
  version text not null,
  release_date text not null,
  content jsonb not null,
  created_at timestamptz default now()
);

-- 2. Update Players Table (For Tutorial)
alter table public.players 
add column if not exists "hasCompletedTutorial" boolean default true;

-- 3. Enable Realtime
alter publication supabase_realtime add table patch_notes;

-- 4. Security Policies (Reset & Re-apply)
alter table patch_notes enable row level security;
drop policy if exists "Public read access" on patch_notes;
drop policy if exists "Admin full access" on patch_notes;

-- Allow everyone to read
create policy "Public read access" on patch_notes for select using (true);

-- Allow admins FULL access (Insert, Update, DELETE)
create policy "Admin full access" on patch_notes for all using (
  exists (select 1 from players where "userId" = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from players where "userId" = auth.uid() and role = 'admin')
);`;

    const handleCopySQL = () => {
        navigator.clipboard.writeText(sqlCommand);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="mt-0">
                <h3 className="text-3xl font-heading mb-4 text-jp-cream">Patch Notes</h3>
                
                {patchNotesError && (
                    <div className="p-6 bg-red-900/40 border-2 border-red-500/50 rounded-xl mb-8 shadow-lg backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">🛠️</div>
                            <div className="flex-grow">
                                <h3 className="text-xl text-red-300 font-bold mb-2 font-heading">
                                    Database Setup Required
                                </h3>
                                <p className="text-jp-cream/90 text-sm mb-4 leading-relaxed">
                                    The system could not find the <code>patch_notes</code> table or permissions are missing.<br/>
                                    Please follow these steps to fix it:
                                </p>
                                <ol className="list-decimal list-inside text-sm text-jp-cream/80 mb-4 space-y-1 ml-2">
                                    <li>Go to your <strong>Supabase Dashboard</strong>.</li>
                                    <li>Open the <strong>SQL Editor</strong> (sidebar icon).</li>
                                    <li>Paste and <strong>Run</strong> the code below.</li>
                                    <li>Refresh this page.</li>
                                </ol>
                                
                                <div className="relative group">
                                    <pre className="bg-black/60 p-4 rounded-lg text-xs overflow-x-auto text-green-400 font-mono border border-jp-wood-light/30 shadow-inner">
                                        {sqlCommand}
                                    </pre>
                                    <button 
                                        onClick={handleCopySQL}
                                        className="absolute top-2 right-2 px-3 py-1 bg-jp-wood-light hover:bg-jp-gold hover:text-jp-wood-dark text-white text-xs rounded transition-colors border border-jp-wood-light shadow-md"
                                    >
                                        {copySuccess ? "Copied! ✓" : "Copy SQL"}
                                    </button>
                                </div>

                                <button 
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-colors shadow-lg"
                                >
                                    I've run the SQL, Refresh Page
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!patchNotesError && patchNotes.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-jp-wood-light rounded-xl bg-jp-wood/30">
                        <p className="text-jp-cream/50 text-lg">No patch notes available yet.</p>
                        <p className="text-sm text-jp-cream/30 mt-2">Admins can add notes via Server Management.</p>
                    </div>
                ) : (
                    <div className="space-y-4 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-jp-wood-light/30 hidden sm:block"></div>

                        {patchNotes.map((log) => (
                            <div key={log.id} className="relative pl-0 sm:pl-12">
                                {/* Timeline Dot */}
                                <div className="absolute left-[11px] top-5 w-3 h-3 rounded-full bg-jp-gold border-2 border-jp-wood-dark hidden sm:block shadow-[0_0_10px_rgba(218,165,32,0.5)] z-10"></div>
                                
                                <div className="relative p-4 rounded-xl border border-jp-wood-light bg-jp-wood/80 backdrop-blur-sm shadow-md hover:border-jp-gold/30 transition-all duration-300 group overflow-hidden">
                                    
                                    {/* Date Styling - Absolute Top Right */}
                                    <div className="absolute top-0 right-0 z-20">
                                        <div className="bg-jp-wood-dark/90 backdrop-blur-md px-3 py-1 rounded-bl-lg border-l border-b border-jp-wood-light/40 shadow-lg">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] text-jp-gold uppercase tracking-wider font-bold opacity-80">RELEASED</span>
                                                <span className="text-xs font-heading text-jp-cream font-bold tracking-normal whitespace-nowrap">
                                                    {log.release_date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Header Section: Version */}
                                    {/* Updated: Smaller text (text-xl), no tracking (tracking-normal), compact margins */}
                                    <div className="border-b border-jp-wood-light/30 pb-1 mb-2 mt-0 pr-24">
                                        <h4 className="text-xl font-heading text-jp-gold font-bold tracking-normal drop-shadow-sm group-hover:text-white transition-colors">
                                            {log.version}
                                        </h4>
                                    </div>

                                    <ul className="space-y-1.5">
                                        {log.content.map((note, index) => (
                                            <li key={index} className="text-jp-cream/90 flex items-start text-sm leading-snug">
                                                <div className="flex-shrink-0 mt-0.5 text-xs">
                                                    <ChangeLogPrefix type={note.type} />
                                                </div>
                                                <span className="text-sm">{note.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-12 pt-8 border-t border-jp-wood-light/30 text-center">
                 <p className="text-jp-cream/40 text-xs uppercase tracking-[0.2em] mb-2">Game Version: 1.0.0 (Lite)</p>
                 <p className="text-jp-cream/60 font-heading">Developed by <span className="text-jp-gold font-bold">noirexe</span></p>
            </div>
        </div>
    );
};