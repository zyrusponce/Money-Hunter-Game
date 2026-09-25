export function createNotificationQueue({limit=3}={}) {
  let list=[];
  return {push(n){if(!list.some(x=>x.id===n.id))list.push(n);},dismiss(id){list=list.filter(n=>n.id!==id);},visible:()=>list.slice(0,limit),pending:()=>list.slice(limit)};
}
