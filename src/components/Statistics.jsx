import Modal from './Modal.jsx';
import { CURRENCIES, RARITIES } from '../data/currencies.js';
import { fmtTime } from './hooks.js';
export default function Statistics({snapshot:s,onClose}) {
  const rows=[['Currencies discovered',`${s.count} / ${s.total}`],['Encyclopedia',`${s.percent}%`],...RARITIES.map(r=>[`${r} discoveries`,CURRENCIES.filter(c=>c.rarity===r&&s.discovered[c.id]).length]),['Treasure chests opened',s.stats.chestsOpened],['Secrets found',s.stats.secretsFound],['Quests completed',s.quests.done.length],['Hunter Coins earned',s.progression.coinsEarned.toLocaleString()],['Distance traveled',`${Math.floor(s.stats.distance).toLocaleString()} tiles`],['Areas mastered',Object.keys(s.progression.mastered).length],['Explorer Level',s.level.level],['Total Explorer XP',s.progression.xp],['Total playtime',fmtTime(s.stats.playtime)]];
  return <Modal title="Explorer Statistics" onClose={onClose}><dl className="statistics-list">{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></Modal>;
}
