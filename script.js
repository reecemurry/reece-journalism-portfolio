document.addEventListener('DOMContentLoaded',()=>{
 const buttons=[...document.querySelectorAll('[data-filter]')];
 const input=document.querySelector('#storySearch');
 const cards=[...document.querySelectorAll('.story')];
 const empty=document.querySelector('#emptyMessage');
 if(input){
  let filter='All';
  const render=()=>{
   let shown=0;
   for(const card of cards){
    const ok=(filter==='All'||card.dataset.category===filter)&&(card.dataset.title||'').toLowerCase().includes(input.value.trim().toLowerCase());
    card.hidden=!ok;if(ok)shown++;
   }
   if(empty)empty.hidden=shown>0;
  };
  buttons.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;buttons.forEach(x=>x.classList.toggle('selected',x===button));render()}));
  input.addEventListener('input',render);render();
 }
 const load=async card=>{
  const cover=card.querySelector('.cover');
  if(!cover)return;
  const id=card.dataset.postId;
  const title=card.dataset.resolveTitle;
  if(!id&&!title)return;
  const query=id?'id='+encodeURIComponent(id):'title='+encodeURIComponent(title);
  try{
   const response=await fetch('/api/article-image?'+query);
   if(!response.ok)throw Error('Server image unavailable');
   const data=await response.json();
   if(data.url&&title&&data.url.startsWith('https://coppellstudentmedia.com/'))card.href=data.url;
   if(!data.image)return;
   const img=new Image();
   img.loading='lazy';img.decoding='async';
   img.alt='Original published photograph for '+(card.querySelector('h3')?.textContent||'article');
   img.onload=()=>{cover.replaceChildren(img);cover.classList.add('has-photo')};
   img.src=data.image;
  }catch(e){
   if(id){
    try{
     const r=await fetch('https://coppellstudentmedia.com/wp-json/wp/v2/posts/'+id+'?_embed=1');
     if(r.ok){const p=await r.json();const m=p._embedded?.['wp:featuredmedia']?.[0];const image=m?.media_details?.sizes?.large?.source_url||m?.source_url||p.jetpack_featured_media_url;
      if(image){const img=new Image();img.loading='lazy';img.alt='Original published article photograph';img.onload=()=>{cover.replaceChildren(img);cover.classList.add('has-photo')};img.src=image;}
     }
    }catch(ignore){}
   }
  }
 };
 cards.forEach(load);
});