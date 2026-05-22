var mls={
  durant_house:{count:39,min:106000,max:570000,median:225000,q1:176000,q3:290000,ppsf:143},
  durant_factory:{count:2,min:225000,max:420000,median:322500,q1:225000,q3:420000,ppsf:146,limited:true},
  calera_house:{count:13,min:140000,max:559000,median:253800,q1:189000,q3:305000,ppsf:165},
  madill_house:{count:10,min:70000,max:285000,median:180500,q1:86000,q3:250000,ppsf:122},
  madill_factory:{count:3,min:65000,max:315000,median:116000,q1:65000,q3:315000,ppsf:104},
  kingston_house:{count:16,min:150975,max:935000,median:422000,q1:215000,q3:604225,ppsf:208},
  kingston_factory:{count:5,min:30000,max:365000,median:150000,q1:120000,q3:165000,ppsf:125},
  silo_area:{count:19,min:230874,max:537500,median:335000,q1:250000,q3:475000,ppsf:177},
  mead:{count:3,min:265000,max:850000,median:325000,q1:265000,q3:850000,ppsf:200,limited:true,waterfront_note:true},
  silo_town:{count:1,min:282300,max:282300,median:282300,q1:282300,q3:282300,ppsf:211,limited:true},
  whitesboro_house:{count:30,min:120000,max:750000,median:386000,q1:280000,q3:500000,ppsf:175},
  gordonville_house:{count:12,min:80000,max:400000,median:198000,q1:130000,q3:280000,ppsf:130,limited:true},
  pottsboro_house:{count:49,min:150000,max:850000,median:345000,q1:240000,q3:470000,ppsf:168},
  denison_house:{count:133,min:33000,max:800000,median:240000,q1:160000,q3:320000,ppsf:140},
  sherman_house:{count:280,min:68000,max:900000,median:283250,q1:185000,q3:390000,ppsf:152}
};

var selCond='average';
var snap={};
var capturedAddress='';

function fmt(n){return '$'+Math.round(n).toLocaleString();}
function fmtK(n){
  if(n>=1000000) return '$'+(n/1000000).toFixed(2).replace(/\.?0+$/,'')+'M';
  if(n>=1000) return '$'+Math.round(n/1000)+'K';
  return '$'+n;
}

function selCondition(v){
  selCond=v;
  document.querySelectorAll('#adr-est .cond-btn').forEach(function(b){
    b.classList.toggle('active',b.dataset.val===v);
  });
}

function condMult(c){return{excellent:1.12,good:1.05,average:1.0,fair:0.91,poor:0.80}[c]||1.0;}

function getKey(area,ptype){
  var a=area.toLowerCase();
  var isFac=(ptype==='factory');
  if(a==='durant') return isFac?'durant_factory':'durant_house';
  if(a==='calera') return 'calera_house';
  if(a==='madill') return isFac?'madill_factory':'madill_house';
  if(a==='kingston') return isFac?'kingston_factory':'kingston_house';
  if(a==='silo') return 'silo_area';
  if(a==='mead') return 'mead';
  if(a==='whitesboro') return 'whitesboro_house';
  if(a==='gordonville') return 'gordonville_house';
  if(a==='pottsboro') return 'pottsboro_house';
  if(a==='denison') return 'denison_house';
  if(a==='sherman') return 'sherman_house';
  return null;
}

function submitStep1(){
  var field=document.getElementById('step1-addr');
  var addr=field?field.value.trim():'';
  if(!addr){alert('Please enter your property address.');return false;}
  capturedAddress=addr;
  var pd=new FormData();
  pd.append('type','STEP 1 - Address Captured');
  pd.append('address',addr);
  pd.append('name','No contact yet');
  pd.append('phone','Address only - Step 2 not completed');
  fetch('https://hooks.zapier.com/hooks/catch/25562661/u787exq/',{method:'POST',body:pd});
  document.getElementById('adr-step1').style.display='none';
  document.getElementById('adr-step2').style.display='block';
  document.getElementById('addr-confirm').textContent='Property: '+addr;
  window.scrollTo(0,0);
  return false;
}

function submitStep2(e){
  e.preventDefault();
  var area=document.getElementById('est-area').value;
  var ptype=document.getElementById('est-ptype').value;
  var sqft=parseInt(document.getElementById('est-sqft').value)||0;
  var beds=parseInt(document.getElementById('est-beds').value)||0;
  var baths=parseInt(document.getElementById('est-baths').value)||0;
  var year=parseInt(document.getElementById('est-year').value)||1990;
  if(!area||!ptype||sqft<200){alert('Please fill in all required fields.');return false;}
  snap={area:area,ptype:ptype,sqft:sqft,beds:beds,baths:baths,year:year,condition:selCond,address:capturedAddress};
  var pd=new FormData();
  pd.append('type','STEP 2 - Property Details - No Contact Yet');
  pd.append('address',capturedAddress);
  pd.append('area',area);
  pd.append('property_type',ptype==='factory'?'Factory Built/Mobile':'Site-Built House');
  pd.append('sqft',sqft);
  pd.append('beds',beds);
  pd.append('baths',baths);
  pd.append('year_built',year);
  pd.append('condition',selCond);
  pd.append('name','No contact yet');
  pd.append('phone','Property details only');
  fetch('https://hooks.zapier.com/hooks/catch/25562661/u787exq/',{method:'POST',body:pd});
  document.getElementById('adr-step2').style.display='none';
  var proc=document.getElementById('adr-processing');
  proc.style.display='block';
  var spinEl=proc.querySelector('.spin');
  if(spinEl) spinEl.style.animation='spin 1.2s linear infinite';
  window.scrollTo(0,0);
  setTimeout(function(){showGate();},2800);
  return false;
}

function showGate(){
  var key=getKey(snap.area,snap.ptype);
  var data=key?mls[key]:null;
  document.getElementById('adr-processing').style.display='none';
  var resultEl=document.getElementById('adr-result');
  resultEl.style.display='block';
  window.scrollTo(0,0);
  if(!data){
    document.getElementById('est-result-header').innerHTML='<span class="result-eyebrow">American Dream Realty</span><div class="result-range" style="font-size:20px;padding:10px 0;">We Need More Info For Your Area</div><div class="result-median">Call Jason directly at 580-564-6583</div>';
    document.getElementById('est-comp-stats').innerHTML='';
    document.getElementById('est-warnings').innerHTML='';
    document.getElementById('est-urgency').innerHTML='';
    var g=document.getElementById('est-contact-gate');
    g.classList.remove('is-hidden');
    g.classList.add('is-visible');
    return;
  }
  var ageMult=1.0;
  var age=2026-snap.year;
  if(age<5) ageMult=1.08;
  else if(age<15) ageMult=1.03;
  else if(age<30) ageMult=1.0;
  else if(age<50) ageMult=0.97;
  else ageMult=0.93;
  var basePrice=data.ppsf*snap.sqft*condMult(snap.condition)*ageMult;
  var spread=(data.q3-data.q1)/Math.max(data.median,1);
  var lo=Math.round(basePrice*(1-spread*0.45)/5000)*5000;
  var hi=Math.round(basePrice*(1+spread*0.45)/5000)*5000;
  lo=Math.max(lo,data.min*0.65);
  hi=Math.min(hi,data.max*1.35);
  if(hi<=lo) hi=Math.round(lo*1.15/5000)*5000;
  snap.estimateLow=lo;
  snap.estimateHigh=hi;
  snap.estimateText=fmtK(lo)+' \u2013 '+fmtK(hi);
  snap.compCount=data.count;
  snap.data=data;
  snap.lo=lo;
  snap.hi=hi;
  document.getElementById('est-result-header').innerHTML='<span class="result-eyebrow">American Dream Realty</span><div class="result-range" style="font-size:22px;padding:8px 0;">Your Estimate Is Ready</div><div class="result-median">Based on '+data.count+' comparable Q1 2026 sales in your area</div>';
  document.getElementById('est-comp-stats').innerHTML='';
  document.getElementById('est-warnings').innerHTML='';
  document.getElementById('est-urgency').innerHTML='<div class="urgency-box">\u26a0 <strong>Why this range needs a professional to dial it in:</strong><br>\u2022 Condition, updates, and lot details shift the value<br>\u2022 Waterfront access and neighborhood demand matter<br>\u2022 Only a local agent pulling comps on your specific property can give you an accurate number</div>';
  var g=document.getElementById('est-contact-gate');
  g.classList.remove('is-hidden');
  g.classList.add('is-visible');
  var pd2=new FormData();
  pd2.append('type','ESTIMATE READY - No Contact Yet');
  pd2.append('address',snap.address);
  pd2.append('area',snap.area);
  pd2.append('property_type',snap.ptype==='factory'?'Factory Built/Mobile':'Site-Built House');
  pd2.append('sqft',snap.sqft);
  pd2.append('beds',snap.beds);
  pd2.append('baths',snap.baths);
  pd2.append('year_built',snap.year);
  pd2.append('condition',snap.condition);
  pd2.append('estimate_shown',snap.estimateText);
  pd2.append('comp_count',data.count);
  pd2.append('name','No contact yet');
  pd2.append('phone','Estimate ready - gate shown');
  fetch('https://hooks.zapier.com/hooks/catch/25562661/u787exq/',{method:'POST',body:pd2});
}

function submitContact(e){
  if(e) e.preventDefault();
  var name=document.getElementById('gate-name').value.trim();
  var phone=document.getElementById('gate-phone').value.trim();
  if(!name||!phone){alert('Please enter your name and phone number.');return false;}
  var pd=new FormData();
  pd.append('type','COMPLETE LEAD - ADR Estimator');
  pd.append('name',name);
  pd.append('phone',phone);
  pd.append('address',snap.address||capturedAddress||'Not provided');
  pd.append('area',snap.area||'');
  pd.append('property_type',snap.ptype==='factory'?'Factory Built/Mobile':'Site-Built House');
  pd.append('sqft',snap.sqft||'');
  pd.append('beds',snap.beds||'');
  pd.append('baths',snap.baths||'');
  pd.append('year_built',snap.year||'');
  pd.append('condition',snap.condition||'');
  pd.append('estimate_shown',snap.estimateText||'');
  pd.append('comp_count',snap.compCount||'');
  fetch('https://hooks.zapier.com/hooks/catch/25562661/u787exq/',{method:'POST',body:pd});
  var g=document.getElementById('est-contact-gate');
  g.classList.remove('is-visible');
  g.classList.add('is-hidden');
  var data=snap.data;
  var lo=snap.lo;
  var hi=snap.hi;
  document.getElementById('est-result-header').innerHTML='<span class="result-eyebrow">Q1 2026 Market Estimate</span><div class="result-range">'+fmtK(lo)+' \u2013 '+fmtK(hi)+'</div><div class="result-median">Based on '+data.count+' comparable sales \u2022 Median: '+fmt(data.median)+'</div>';
  document.getElementById('est-comp-stats').innerHTML='<div class="comp-stat"><span class="comp-num">'+data.count+'</span><span class="comp-lbl">Comp Sales</span></div><div class="comp-stat"><span class="comp-num">'+fmt(data.median)+'</span><span class="comp-lbl">Median Price</span></div><div class="comp-stat"><span class="comp-num">$'+data.ppsf+'</span><span class="comp-lbl">Avg $/SqFt</span></div>';
  var warnings='';
  if(data.limited||data.count<=3){warnings+='<div class="warning-box">\u26a0 <strong>Limited data notice:</strong> Only '+data.count+' comparable '+(data.count===1?'sale':'sales')+' on record. Call Jason for a more precise analysis: <strong>580-564-6583</strong></div>';}
  if(snap.area==='kingston'&&snap.ptype!=='factory'){warnings+='<div class="warning-box">\ud83c\udfe0 <strong>Lake Texoma notice:</strong> Kingston waterfront, Corps lease, and dock properties can sell significantly above this range. Call Jason: <strong>580-564-6583</strong></div>';}
  document.getElementById('est-warnings').innerHTML=warnings;
  document.getElementById('est-urgency').innerHTML='<div class="urgency-box">\u26a0 <strong>This range is a starting point, not your final number.</strong><br>\u2022 Condition, updates, and lot details shift the value<br>\u2022 Waterfront access and neighborhood demand matter<br>\u2022 Only a professional pulling comps on your specific property can narrow this range<br>For a free market analysis call Jason: <strong>580-564-6583</strong></div>';
  document.getElementById('est-submitted').style.display='block';
  setTimeout(function(){window.location.href='https://americandreamrealtyok.com/thank-you-2/';},2500);
  return false;
}

document.addEventListener('DOMContentLoaded',function(){
  var form=document.getElementById('adr-contact-form');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      submitContact(e);
    });
  }
});