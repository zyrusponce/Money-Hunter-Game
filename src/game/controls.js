export const DEFAULT_BINDINGS={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',interact:'KeyE',map:'KeyM',encyclopedia:'KeyC',quests:'KeyJ',inventory:'KeyB',tool1:'Digit1',tool2:'Digit2',tool3:'Digit3',tool4:'Digit4'};
const aliases={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyQ:'quests',KeyI:'inventory'};
export function actionForCode(bindings=DEFAULT_BINDINGS,code) {
  const explicit=Object.entries(bindings).find(([,key])=>key===code);
  return explicit?.[0]||aliases[code]||null;
}
export function validateBinding(bindings,action,code) {
  if(!Object.hasOwn(DEFAULT_BINDINGS,action)||!(/^(Key[A-Z]|Digit[0-9])$/.test(code)))return {ok:false,reason:'Choose a letter or number. Arrow keys and Escape stay available.'};
  if(Object.entries(bindings).some(([a,c])=>a!==action&&c===code))return {ok:false,reason:'That key is already assigned.'};
  return {ok:true};
}
export const keyLabel=code=>code?.replace('Key','').replace('Digit','')||'';
