import Modal from './Modal.jsx';
import { LOCATIONS } from '../data/locations.js';
import { fmtTime } from './hooks.js';
export default function SaveSummary({snapshot:s,onClose,onContinue}) {
  return <Modal title="Your adventure awaits" onClose={onClose}><p className="muted">Pick up where curiosity left you.</p><dl className="statistics-list">{[['Explorer Level',s.level.level],['Encyclopedia',`${s.percent}% · ${s.count} / ${s.total}`],['Current Location',LOCATIONS[s.map].name],['Playtime',fmtTime(s.stats.playtime)]].map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><button className="btn" data-autofocus onClick={onContinue}>Continue Adventure →</button></Modal>;
}
