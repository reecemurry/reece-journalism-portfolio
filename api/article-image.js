module.exports=async(req,res)=>{
 const host='https://coppellstudentmedia.com';
 const id=String(req.query.id||'');
 const title=String(req.query.title||'').slice(0,200);
 const norm=s=>String(s||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const get=async(url)=>{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html,application/json;q=0.9,*/*;q=0.8'}});if(!r.ok)throw Error('Publisher '+r.status);return r;};
 const attr=(tag,name)=>{const m=tag.match(new RegExp('\\b'+name+'\\s*=\\s*(["\\x27])([\\s\\S]*?)\\1','i'));return m?m[2]:''};
 const valid=value=>{if(!value)return'';try{const u=new URL(value.replace(/&amp;/g,'&'),host);return u.protocol==='https:'&&!/(avatar|logo|favicon|icon|placeholder)/i.test(u.pathname)?u.href:''}catch{return''}};
 const findImage=html=>{
  for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){
   if(['og:image','twitter:image','twitter:image:src'].includes(attr(tag,'property')||attr(tag,'name'))){const u=valid(attr(tag,'content'));if(u)return u;}
  }
  for(const tag of html.match(/<img\b[^>]*>/gi)||[]){
   const cls=attr(tag,'class');
   if(/(wp-post-image|featured|story-image|attachment|hero|size-large|size-full)/i.test(cls)){
    const u=valid(attr(tag,'data-src')||attr(tag,'data-lazy-src')||attr(tag,'src'));if(u)return u;
   }
  }
  return'';
 };
 try{
  let url='',image='',postId=id;
  if(!/^\d{4,8}$/.test(postId)){
   if(!title)return res.status(400).json({error:'Missing story'});
   const sr=await get(host+'/wp-json/wp/v2/search?search='+encodeURIComponent(title)+'&per_page=100');
   const matches=await sr.json();
   const match=matches.find(p=>norm(p.title?.rendered||p.title)===norm(title));
   if(!match)return res.status(404).json({error:'Article not found'});
   postId=String(match.id);url=match.url||'';
  }
  try{
   const post=await(await get(host+'/wp-json/wp/v2/posts/'+postId+'?_embed=1')).json();
   url=post.link||url;
   const media=post._embedded?.['wp:featuredmedia']?.[0];
   image=valid(media?.media_details?.sizes?.large?.source_url)||valid(media?.source_url)||valid(post.jetpack_featured_media_url);
   if(!image&&post.featured_media){
    const m=await(await get(host+'/wp-json/wp/v2/media/'+post.featured_media)).json();
    image=valid(m?.media_details?.sizes?.large?.source_url)||valid(m.source_url);
   }
   if(!image)image=findImage(post.content?.rendered||'');
  }catch(e){}
  if(!url)url=host+'/'+postId+'/';
  if(!image){const html=await(await get(url)).text();image=findImage(html);}
  if(!image)return res.status(404).json({error:'No original image found',url});
  res.setHeader('Cache-Control','public,s-maxage=3600,stale-while-revalidate=86400');
  return res.status(200).json({image,url});
 }catch(e){return res.status(502).json({error:'Publisher fetch failed'});}
};