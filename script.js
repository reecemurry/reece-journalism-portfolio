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
/* PDF archive mirrors the live publication order, with PDFs as secondary access. */
document.addEventListener('DOMContentLoaded',()=>{
 const grid=document.getElementById('pdfGrid');if(!grid)return;
 const files="cowgirls-dominate-district-meet-to-come-home-for-regional-competition.pdf|coppells-deepest-playoff-run-in-23-years-ends-in-regional-semifinal-loss-to-north-crowley.pdf|coppell-boys-basketball-rule-the-scoreboard-with-44-point-domination.pdf|a-heart-the-size-of-texas.pdf|home-team-takes-gold-in-annual-relays.pdf|cowgirls-emerge-victorious-in-bi-district-playoffs.pdf|smith-climbing-cold-mountains.pdf|track-and-field-hoists-district-gold.pdf|5-6a-showdown-turns-into-defensive-battle-as-braswell-claims-district-crown.pdf|three-athletes-press-the-pen-into-their-future.pdf|not-your-stereotypical-woman-of-color.pdf|coppell-student-media-racking-up-prestige-claiming-2025-nspa-pacemaker-award.pdf|buzzer-beater-hands-first-win-of-district-play.pdf|games-rescheduled-due-to-severe-weather.pdf|third-set-spark-falls-short-as-cowgirls-season-ends.pdf|sherrer-the-final-stamp-of-culture.pdf|cowgirls_vball_reece_featurephoto_gamer.pdf|griffiths-late-3-lifts-coppell-past-martin-sends-cowboys-to-regional-semifinal.pdf|45-minutes-of-practice-repetitions-results-in-cowgirl-win-against-lake-ridge.pdf|5-point-slip-concludes-cowgirls-season.pdf|new-tech-preserves-identity-through-campus-move.pdf|state-champions-seek-to-possess-district-opener-against-hebron.pdf|malladi-brings-home-5th-place-from-state-wrestling-meet.pdf|114-points-to-finish-off-season.pdf|pinkerton-legacy-continuing-through-sweeneys-move-to-wilson-elementary.pdf|title-defense-falls-short-after-late-goal-sends-keller-to-semifinals.pdf|cowgirls-take-the-win-from-richardson.pdf|inked-and-ready-coppell-sending-12-athletes-to-next-level.pdf|penniman-turns-late-start-into-collegiate-career.pdf|the-root-of-coppell-athletics-holds-a-clipboard-again.pdf|coppell-lassos-team-results-at-annual-home-relays.pdf|cowboys-fight-for-the-win-against-little-elm.pdf|four-boys-basketball-players-sign-college-letters-of-intent-2.pdf|cowgirls-storm-towards-allen-for-bi-district.pdf|four-boys-basketball-players-sign-college-letters-of-intent.pdf|robersons-anchor-coppell-defense.pdf|cowgirls-winning-streak-continues-after-halting-south-grand-prairie.pdf|cowgirls-fired-up-for-final-preseason-tournament.pdf|kutchins-leads-cowgirls-to-win-in-district-opener.pdf".split('|');
 const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const available=new Set(files);
 const used=new Set();
 const entries=[];
 for(const card of document.querySelectorAll('#stories .story')){
  const title=card.querySelector('h3')?.textContent.trim()||'';
  const key=slug(title);
  let file=key+'.pdf';
  if(!available.has(file)&&key==='pinkerton-legacy-continuing-through-sweeney-s-move-to-wilson-elementary')file='pinkerton-legacy-continuing-through-sweeneys-move-to-wilson-elementary.pdf';
  if(!available.has(file)&&key==='kutchins-leads-cowgirls-to-win-in-district-opener')file='kutchins-leads-cowgirls-to-win-in-district-opener.pdf';
  if(!available.has(file))continue;
  used.add(file);
  entries.push({title,file,meta:card.querySelector('.meta')?.textContent||''});
 }
 const extraNames={
  'a-heart-the-size-of-texas.pdf':'A heart the size of Texas',
  'coppells-deepest-playoff-run-in-23-years-ends-in-regional-semifinal-loss-to-north-crowley.pdf':"Coppell’s deepest playoff run in 23 years ends in regional semifinal loss to North Crowley",
  'coppell-student-media-racking-up-prestige-claiming-2025-nspa-pacemaker-award.pdf':'Coppell Student Media racking up prestige, claiming 2025 NSPA Pacemaker Award',
  'cowgirls_vball_reece_featurephoto_gamer.pdf':'Cowgirls volleyball — feature photo and game coverage',
  'griffiths-late-3-lifts-coppell-past-martin-sends-cowboys-to-regional-semifinal.pdf':"Griffith’s late 3 lifts Coppell past Martin, sends Cowboys to regional semifinal"
 };
 for(const file of files){if(!used.has(file)&&!file.endsWith('-2.pdf'))entries.push({title:extraNames[file]||file.replace(/\.pdf$/,'').replace(/-/g,' '),file,meta:'Additional published work'});}
 const icon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19L19 5M8 5h11v11"/></svg>';
 for(const item of entries){
  const a=document.createElement('a');a.className='pdf-tile';a.href='pdfs/'+encodeURIComponent(item.file);a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Open PDF: '+item.title);
  const top=document.createElement('div'),meta=document.createElement('div'),heading=document.createElement('h3');
  meta.className='meta';meta.textContent=item.meta;heading.textContent=item.title;top.append(meta,heading);
  const bottom=document.createElement('div');bottom.className='pdf-action';bottom.innerHTML='<span>View PDF</span>'+icon;
  a.append(top,bottom);grid.append(a);
 }
});
