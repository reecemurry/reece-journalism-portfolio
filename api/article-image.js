module.exports=async function(req,res){
 const id=String(req.query.id||'');
 if(!/^\d{4,8}$/.test(id))return res.status(400).json({error:'Invalid ID'});
 try{
  const response=await fetch('https://coppellstudentmedia.com/'+id+'/',{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'}});
  if(!response.ok)throw Error('Publisher unavailable');
  const html=await response.text();
  const tags=html.match(/<meta\b[^>]*>/gi)||[];
  const attr=(tag,key)=>{const m=tag.match(new RegExp('\\b'+key+'\\s*=\\s*["\\x27]([^"\\x27]*)["\\x27]','i'));return m?.[1]||''};
  let photo='';
  for(const tag of tags){
   const type=attr(tag,'property')||attr(tag,'name');
   if(type==='og:image'||type==='twitter:image'||type==='twitter:image:src'){photo=attr(tag,'content');if(photo)break;}
  }
  if(!photo)throw Error('No publisher image');
  photo=new URL(photo,'https://coppellstudentmedia.com').href;
  if(!photo.startsWith('https://'))throw Error('Invalid image URL');
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).json({image:photo});
 }catch(e){res.setHeader('Cache-Control','public, s-maxage=1800');return res.status(404).json({error:'Image unavailable'});}
};