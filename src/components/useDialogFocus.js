import { useEffect } from 'react';
export default function useDialogFocus(ref) {
  useEffect(()=>{
    const opener=document.activeElement,root=ref.current;
    if(!root)return;
    const selector='button:not(:disabled),input:not(:disabled),select:not(:disabled),[href],[tabindex="0"]';
    const targets=()=>[...root.querySelectorAll(selector)].filter(el=>el.getClientRects().length);
    (root.querySelector('[data-autofocus]')||targets()[0]||root).focus();
    const key=e=>{
      if(e.key!=='Tab')return;
      const all=targets(),first=all[0],last=all.at(-1);
      if(!first){e.preventDefault();return;}
      if(e.shiftKey&&(!root.contains(document.activeElement)||document.activeElement===first)){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&(!root.contains(document.activeElement)||document.activeElement===last)){e.preventDefault();first.focus();}
    };
    root.addEventListener('keydown',key);
    return ()=>{root.removeEventListener('keydown',key);if(opener?.isConnected)opener.focus();};
  },[ref]);
}
