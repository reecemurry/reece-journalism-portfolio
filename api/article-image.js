module.exports=async function(req,res){
 const origin='https://coppellstudentmedia.com';
 let id=String(req.query.id||'');
 const title=String(req.query.title||'').slice(0,200);
 const normalize=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const get=async(url)=>{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; ReeceMurryPortfolio/1.0)','Accept':'text/html,application/json'}});if(!r.ok)throw Error(String(r.status));return r;};
 const attr=(tag,key)=>{const m=tag.match(new RegExp('\\b'+key+'\\s*=\\s*(["\\x27])([\\s\\S]*?)\\1','i'));return m?.[2]||'';};
 const good=u=>{try{const v=new URL(u,origin);return v.protocol==='https:'&&/\.(jpe?g|png|webp)(\?|$)/i.test(v.pathname+v.search)&&!/(logo|avatar|icon|advert|placeholder)/i.test(v.pathname)?v.href:''}catch(e){return''}};
 let url='',image='',post=null;
 try{
  if(!/^\d{4,8}$/.test(id)&&title){
   try{
    const matches=await(await get(origin+'/wp-json/wp/v2/search?search='+encodeURIComponent(title)+'&per_page=40')).json();
    const m=matches.find(x=>normalize(x.title?.rendered||x.title)===normalize(title));
    if(m){id=String(m.id);url=m.url||'';}
   }catch(e){}
   if(!url){
    const searchHtml=await(await get(origin+'/?s='+encodeURIComponent(title))).text();
    const anchors=[...searchHtml.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    const match=anchors.find(x=>normalize(x[2])===normalize(title)&&x[1].includes('coppellstudentmedia.com'));
    if(match)url=match[1];
   }
  }
  if(!/^\d{4,8}$/.test(id)&&!url)return res.status(404).json({error:'Article not found'});
  if(/^\d{4,8}$/.test(id)){
   try{
    post=await(await get(origin+'/wp-json/wp/v2/posts/'+id+'?_embed=1')).json();
    url=post.link||url;
    const media=post._embedded?.['wp:featuredmedia']?.[0];
    image=good(media?.media_details?.sizes?.large?.source_url)||good(media?.source_url);
    if(!image&&post.featured_media){
     const m=await(await get(origin+'/wp-json/wp/v2/media/'+post.featured_media)).json();
     image=good(m?.media_details?.sizes?.large?.source_url)||good(m.source_url);
    }
   }catch(e){}
  }
  if(!url)url=origin+'/'+id+'/';
  if(!image){
   const html=await(await get(url)).text();
   const tags=html.match(/<meta\b[^>]*>/gi)||[];
   for(const tag of tags){
    const type=attr(tag,'property')||attr(tag,'name');
    if(['og:image','twitter:image','twitter:image:src'].includes(type)){image=good(attr(tag,'content'));if(image)break;}
   }
   if(!image){
    const imgs=html.match(/<img\b[^>]*>/gi)||[];
    for(const tag of imgs){
     const cls=attr(tag,'class');
     if(/(featured|attachment|story|article|wp-post-image|hero|size-full|size-large|aligncenter)/i.test(cls)){
      image=good(attr(tag,'data-src'))||good(attr(tag,'src'));
      if(image)break;
     }
    }
   }
  }
  if(!image&&post?.content?.rendered){
   const imgs=post.content.rendered.match(/<img\\b[^>]*>/gi)||[];
   for(const tag of imgs){
    image=good(attr(tag,'data-src'))||good(attr(tag,'src'))||good(attr(tag,'data-lazy-src'));
    if(image)break;
   }
  }
  if(!image&&post?.jetpack_featured_media_url)image=good(post.jetpack_featured_media_url);
  if(!image)return res.status(404).json({error:'No original image available',url});
  res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).json({image,url});
 }catch(e){return res.status(404).json({error:'Original image unavailable'});}
};