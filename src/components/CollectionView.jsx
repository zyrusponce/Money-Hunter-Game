import ProgressBar from './ProgressBar.jsx';
export default function CollectionView({collections}) {
  return <div className="card-grid collections-grid">{collections.map(c=><article className={`journal-card ${c.complete?'earned':''}`} key={c.id}><span className="eyebrow">{c.complete?'✓ COLLECTION COMPLETE':'CURRENCY COLLECTION'}</span><h3>{c.name}</h3><ProgressBar label={`${c.percent}% discovered`} value={c.count} total={c.total}/><span className="reward-preview">+{c.reward.coins} coins · +{c.reward.xp} XP<br/>Collector outfit & badge</span></article>)}</div>;
}
