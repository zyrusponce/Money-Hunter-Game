import Modal from './Modal.jsx';
export default function PauseMenu({onResume,onOpen,onSave,onMainMenu,savedNote}) {
 const menus=[['encyclopedia','▤','Encyclopedia'],['map','◇','World Map'],['quests','!','Quests'],['inventory','▣','Inventory'],['skills','✧','Skills'],['shop','◉','Explorer Shop'],['achievements','✦','Achievements'],['progress','↗','Progress'],['social','♧','People & Requests'],['settings','⚙','Settings']];
 return <Modal title="Take a breather" onClose={onResume}><button className="btn resume-button" data-autofocus onClick={onResume}>Resume Adventure →</button><div className="pause-grid">{menus.map(([id,icon,label])=><button className="menu-tile" key={id} onClick={()=>onOpen(id)}><span>{icon}</span>{label}</button>)}</div><div className="pause-footer"><button className="text-button" onClick={onSave}>Save Game</button><button className="text-button" onClick={onMainMenu}>Return to Main Menu</button></div><p role="status" className="muted">{savedNote}</p></Modal>;
}
