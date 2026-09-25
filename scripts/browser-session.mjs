// Local CDP helper. Run headless Edge/Chrome with --remote-debugging-port=9222.
import { writeFile } from 'node:fs/promises';
export async function browserSession() {
  const pages=await (await fetch('http://127.0.0.1:9222/json')).json();
  const page=pages.find(p=>p.type==='page');
  if(!page)throw new Error('No browser page available');
  const ws=new WebSocket(page.webSocketDebuggerUrl),pending=new Map(),errors=[],started=Date.now();
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let id=0;
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown'&&m.params.timestamp>=started)errors.push(m.params.exceptionDetails);};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(new Error(`CDP timeout: ${method}`));},20000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}));});
  const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
  const screenshot=async path=>{await new Promise(r=>setTimeout(r,300));const {data}=await send('Page.captureScreenshot',{format:'png'});await writeFile(path,Buffer.from(data,'base64'));};
  const clickText=async text=>evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim().includes(${JSON.stringify(text)})&&!b.disabled);if(!b)throw new Error('Button missing: '+${JSON.stringify(text)});b.click();return b.textContent;})()`);
  await send('Runtime.enable');await send('Page.enable');
  return {send,evaluate,screenshot,clickText,errors,close:()=>ws.close()};
}
