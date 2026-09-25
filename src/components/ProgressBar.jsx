export default function ProgressBar({value,total=100,label}) {
  const percent=total?Math.min(100,Math.floor(value/total*100)):0;
  return <div className="progress-block"><div><span>{label}</span><span>{value} / {total}</span></div><div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}><i style={{width:`${percent}%`}}/></div></div>;
}
