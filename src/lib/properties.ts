export type PropertyRequest={id:string;property_id:string|null;floor:string|null;unit_number:string|null;plot_number:string;status:string;kind:string;expires_at:string|null;deleted_at:string|null;created_at:string};
export function propertyStatus(row:PropertyRequest,now=Date.now()):'active'|'expired'|'inactive'|'under_review'{
  if(row.status==='issued')return row.expires_at && Date.parse(row.expires_at)>now?'active':'expired';
  return row.status==='rejected'||row.deleted_at?'inactive':'under_review';
}
export function propertySections<T extends PropertyRequest>(rows:T[],now=Date.now()){
  const groups=new Map<string,T>();
  for(const row of rows){const key=JSON.stringify([row.property_id??row.plot_number,row.floor,row.unit_number]);const old=groups.get(key);if(!old||Date.parse(row.created_at)>Date.parse(old.created_at))groups.set(key,row);}
  return {licenses:rows.filter(r=>r.status==='issued'&&!r.deleted_at),current:rows.filter(r=>!['issued','rejected'].includes(r.status)&&!r.deleted_at),properties:[...groups.values()].map(r=>({request:r,status:propertyStatus(r,now)}))};
}