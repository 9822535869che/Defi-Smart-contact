/* ============================================================
   DeFi Rent — state & logic · ข้อมูลทั้งหมดอ่าน/เขียนบนสัญญา RentalEscrow
   ============================================================ */
const ST = {
  available:{th:'พร้อมให้ยืม',cls:'b-available',tag:'ok'},
  borrowed :{th:'ถูกยืม',   cls:'b-borrowed', tag:'info'},
  returning:{th:'รอคืน',    cls:'b-returning',tag:'pend'},
  inspect  :{th:'รอตรวจสอบสภาพ',cls:'b-returning',tag:'pend'},
  closed   :{th:'ปิดแล้ว',  cls:'b-closed',   tag:'off'}
};
let CATS = [
  {id:'all',en:'All',th:'ทั้งหมด',ic:'<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>'},
  {id:'more',en:'More',th:'',ic:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'}
];

/* ---------- product artwork (inline SVG scenes) ---------- */
function artLaptop(){return `<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="lw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f1ea"/><stop offset="1" stop-color="#e9ded0"/></linearGradient></defs><rect width="300" height="160" fill="url(#lw)"/><rect y="112" width="300" height="48" fill="#cdb79d"/><rect y="112" width="300" height="5" fill="#bda489"/><g><rect x="20" y="86" width="26" height="26" rx="4" fill="#d9cbb8"/><path d="M33 86c-8-6-16-6-18-16 8-2 15 4 18 12 2-10 9-16 18-14-1 12-10 16-18 18z" fill="#6aa86f"/><path d="M33 86c0-8 4-14 10-18" stroke="#4e8a55" stroke-width="1.6" fill="none"/></g><g><path d="M78 112l12-56h108l12 56z" fill="#c9cdd6"/><path d="M78 112h132l4 6H74z" fill="#aeb4c0"/><rect x="88" y="52" width="112" height="62" rx="4" fill="#9aa1ae"/><rect x="92" y="56" width="104" height="54" rx="2" fill="#20242e"/><g fill="#3a4150"><rect x="98" y="62" width="50" height="4" rx="2"/><rect x="98" y="72" width="78" height="3" rx="1.5"/><rect x="98" y="80" width="62" height="3" rx="1.5"/><rect x="98" y="88" width="70" height="3" rx="1.5"/><rect x="98" y="96" width="40" height="3" rx="1.5"/></g><circle cx="144" cy="54" r="1.2" fill="#555c6b"/></g><ellipse cx="146" cy="120" rx="80" ry="7" fill="rgba(90,70,50,.12)"/><rect x="236" y="96" width="34" height="16" rx="3" fill="#dcd2c4"/><rect x="240" y="100" width="26" height="8" rx="2" fill="#c3b7a6"/></svg>`;}
function artCamera(){return `<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="cb" cx=".5" cy=".4"><stop offset="0" stop-color="#4a4f5c"/><stop offset="1" stop-color="#1d2028"/></radialGradient><radialGradient id="lens" cx=".4" cy=".35"><stop offset="0" stop-color="#5d6b86"/><stop offset=".55" stop-color="#20242e"/><stop offset="1" stop-color="#0d0f14"/></radialGradient></defs><rect width="300" height="160" fill="url(#cb)"/><ellipse cx="150" cy="140" rx="110" ry="16" fill="rgba(0,0,0,.4)"/><g><rect x="62" y="56" width="140" height="74" rx="12" fill="#2b2f39"/><rect x="62" y="56" width="140" height="18" rx="10" fill="#353a46"/><path d="M118 44h34a8 8 0 0 1 8 8v6h-50v-6a8 8 0 0 1 8-8z" fill="#2b2f39"/><rect x="170" y="60" width="32" height="70" rx="10" fill="#22262f"/><circle cx="120" cy="96" r="38" fill="#15181f"/><circle cx="120" cy="96" r="33" fill="url(#lens)"/><circle cx="120" cy="96" r="20" fill="#0c0e13"/><circle cx="120" cy="96" r="12" fill="#1b2a4a"/><circle cx="112" cy="88" r="5.5" fill="#8fb4ff" opacity=".7"/><circle cx="130" cy="106" r="3" fill="#6ea0ff" opacity=".5"/><circle cx="120" cy="96" r="33" fill="none" stroke="#5b6377" stroke-width="2"/><rect x="72" y="62" width="18" height="6" rx="3" fill="#464c5a"/><circle cx="186" cy="70" r="5" fill="#d14b4b"/><rect x="176" y="86" width="20" height="14" rx="3" fill="#3b414f"/></g><circle cx="238" cy="42" r="26" fill="rgba(140,170,255,.1)"/></svg>`;}
function artBike(){return `<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f0ea"/><stop offset="1" stop-color="#e2ddd4"/></linearGradient></defs><rect width="300" height="160" fill="url(#bw)"/><rect y="124" width="300" height="36" fill="#cbbfad"/><g fill="none" stroke="#2a2f3a"><circle cx="72" cy="104" r="30" stroke-width="5"/><circle cx="222" cy="104" r="30" stroke-width="5"/><g stroke="#8c93a4" stroke-width="1.3"><path d="M72 76v56M44 104h56M52 84l40 40M92 84l-40 40"/><path d="M222 76v56M194 104h56M202 84l40 40M242 84l-40 40"/></g><circle cx="72" cy="104" r="5" stroke-width="3"/><circle cx="222" cy="104" r="5" stroke-width="3"/></g><g stroke="#1f6fd6" stroke-width="7" stroke-linecap="round" fill="none"><path d="M72 104 128 60"/><path d="M128 60 170 104"/><path d="M72 104 150 104"/><path d="M150 104 170 60"/><path d="M170 60 222 104"/><path d="M128 60 170 60"/></g><g stroke="#2a2f3a" stroke-width="4.5" stroke-linecap="round" fill="none"><path d="M128 60 122 46"/><path d="M110 46h24"/><path d="M170 58l4-12h16"/></g><ellipse cx="178" cy="46" rx="16" ry="5" fill="#2a2f3a"/><circle cx="150" cy="104" r="9" fill="none" stroke="#2a2f3a" stroke-width="4"/><ellipse cx="148" cy="136" rx="92" ry="7" fill="rgba(70,60,45,.14)"/><g fill="#6aa86f" opacity=".85"><rect x="258" y="100" width="24" height="24" rx="4" fill="#d6cab6"/><path d="M270 100c-6-5-12-4-14-12 7-1 12 3 14 9 2-8 7-12 14-10-1 9-8 13-14 13z"/></g></svg>`;}
function artPhones(){return `<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f3ec"/><stop offset="1" stop-color="#e6ddd1"/></linearGradient><linearGradient id="cup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b505c"/><stop offset="1" stop-color="#23262e"/></linearGradient></defs><rect width="300" height="160" fill="url(#hw)"/><rect y="120" width="300" height="40" fill="#cdbfa9"/><g><rect x="24" y="92" width="26" height="28" rx="4" fill="#d9cbb8"/><path d="M37 92c-8-6-16-5-18-15 8-2 15 3 18 11 2-10 9-15 18-13-1 12-10 15-18 17z" fill="#6aa86f"/></g><g><path d="M104 96V74a46 46 0 0 1 92 0v22" fill="none" stroke="#2b2f39" stroke-width="13" stroke-linecap="round"/><path d="M104 92V74a46 46 0 0 1 92 0v18" fill="none" stroke="#3c424f" stroke-width="5" stroke-linecap="round" opacity=".6"/><rect x="86" y="82" width="38" height="52" rx="18" fill="url(#cup)"/><rect x="176" y="82" width="38" height="52" rx="18" fill="url(#cup)"/><ellipse cx="105" cy="108" rx="13" ry="20" fill="#1a1d24"/><ellipse cx="195" cy="108" rx="13" ry="20" fill="#1a1d24"/><ellipse cx="105" cy="108" rx="9" ry="15" fill="#2d3139"/><ellipse cx="195" cy="108" rx="9" ry="15" fill="#2d3139"/><circle cx="105" cy="128" r="2.4" fill="#6c7485"/></g><ellipse cx="150" cy="138" rx="78" ry="7" fill="rgba(80,65,45,.14)"/></svg>`;}
function artGeneric(hue,icon){return `<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g${hue}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},62%,93%)"/><stop offset="1" stop-color="hsl(${hue+22},55%,83%)"/></linearGradient></defs><rect width="300" height="160" fill="url(#g${hue})"/><circle cx="238" cy="30" r="52" fill="rgba(255,255,255,.4)"/><circle cx="54" cy="140" r="44" fill="rgba(255,255,255,.3)"/><g transform="translate(150 80)"><g transform="translate(-30 -30) scale(2.5)" fill="none" stroke="hsl(${hue},45%,34%)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icon}</g></g></svg>`;}

/* ---------- data ---------- */
let ME = '0x7a3f...9e2c';   /* เปลี่ยนเป็น address จริงเมื่อเชื่อม MetaMask */
let items = [];        /* โหลดจากสัญญา items(i) */
let txs = [];          /* สร้างจาก event logs ของสัญญา */
let disputes = [];     /* โหลดจากสัญญา disputes(i) */
const state = {page:'home',cat:'all',q:'',connected:false,bal:0.240,fav:new Set(),favOnly:false,realAddr:null,chainId:null,chainName:'',moreOpen:false,role:'user',dFilter:'all',txFilter:'all'};
const ROLES={
 user:{en:'User',th:'ผู้ใช้ทั่วไป',addr:'0x7a3f...9e2c',c:'#2b53cf',bg:'#eaf0ff',dot:'#4a7bf7',
   short:'ลงของ · ยืม · คืน · เปิดข้อพิพาท',
   desc:'ลงทะเบียนสิ่งของ ยืม คืน และเปิดข้อพิพาทได้ แต่<b>ตัดสินเคสเองไม่ได้</b> — บทบาท “ผู้ให้ยืม” กับ “ผู้ยืม” คิดจากสัญญาแต่ละใบ ไม่ใช่ประเภทบัญชี'},
 arbitrator:{en:'Arbitrator',th:'ผู้ตัดสินข้อพิพาท',addr:'0xa1b2...77e5',c:'#a9690b',bg:'#fff4e4',dot:'#f0a132',
   short:'สมัครเอง · ตัดสินเคส · รับค่าตอบแทน',
   desc:'wallet ที่<b>สมัครเป็นผู้พิพาทเองแล้ว</b> — ไม่ได้มาจากการแต่งตั้งของใคร ตัดสินเคสและปล่อยเงิน escrow ได้ · ได้ค่าตอบแทนทุกเคสที่ตัดสิน แต่ถ้าตัดสินไม่เป็นธรรมจะถูกริบเงินประกัน'},
 admin:{en:'Admin',th:'เจ้าของสัญญา',addr:'0xde4d...0001',c:'#0f8a52',bg:'#e9f8f0',dot:'#19b26b',
   short:'ตั้งเงื่อนไข · ริบประกัน · pause',
   desc:'ตั้งเงื่อนไขการสมัคร <b>อนุมัติหรือปฏิเสธใบสมัคร</b>ผู้พิพาท ริบเงินประกันคนที่ทำผิด และหยุดสัญญาฉุกเฉินได้ แต่<b>ตัดสินข้อพิพาทเองไม่ได้</b> และเลือกได้เฉพาะจากคนที่ยื่นสมัครเข้ามาเท่านั้น'}
};
let admin={fee:2.5,paused:false,minStake:5.0,reward:0.15,slashed:0,rewardPaid:0,arbs:[],apps:[]};
admin.openApply=true;
admin.exits=[];   /* คำขอถอนตัวของผู้พิพาท รอ Admin อนุมัติ */
/* ยอดจ่ายสะสมตั้งต้นให้ตรงกับที่ผู้พิพาทแต่ละคนได้รับไปแล้ว ทุกหน้าจะได้เลขเดียวกัน */
admin.rewardPaid=+admin.arbs.reduce((n,a)=>n+(a.earned||0),0).toFixed(3);
let notifs=[];         /* แจ้งเตือนเกิดจากเหตุการณ์จริงระหว่างใช้งาน */
const CAT_ICON='<path d="M20.6 13.4 11 3.8A2 2 0 0 0 9.6 3.2H4.2A1.2 1.2 0 0 0 3 4.4v5.4c0 .5.2 1 .6 1.4l9.6 9.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8z"/><circle cx="7.2" cy="7.2" r="1.3"/>';
const realCats=()=>CATS.filter(c=>!['all','more'].includes(c.id));
const catCount=id=>items.filter(i=>i.cat===id).length;
/* ข้อพิพาทที่ยังเปิดอยู่ของสิ่งของชิ้นนี้ — ใช้ปิดปุ่มจัดการระหว่างรอคำตัดสิน */
const disputeOf=it=>disputes.find(d=>d.st==='open'&&(d.itemId===it.id||d.rentalId===it.rentalId));
const okStake=a=>a.stake>=admin.minStake;
const curAddr=()=>ROLES[state.role].addr;
/* MetaMask ส่ง address เป็นตัวพิมพ์เล็กล้วน ส่วนสัญญาส่งกลับมาแบบ checksum (ผสมใหญ่-เล็ก)
   เทียบด้วย === ตรง ๆ จึงไม่มีทางตรงกัน ต้องเทียบแบบไม่สนตัวพิมพ์เสมอ */
const eqAddr=(a,b)=>!!a&&!!b&&String(a).toLowerCase()===String(b).toLowerCase();
const myArb=()=>admin.arbs.find(a=>eqAddr(a.addr,curAddr()));
const myApp=()=>admin.apps.find(a=>eqAddr(a.addr,curAddr()));
const myExit=()=>admin.exits.find(e=>eqAddr(e.addr,curAddr()));
/* รายการโปรดเก็บนอกเชน แยก key ตามกระเป๋า — เป็นความชอบส่วนตัว ไม่ใช่ข้อตกลงทางการเงิน
   ข้อจำกัด: localStorage ผูกกับเบราว์เซอร์เครื่องนี้ เปิดอีกเครื่องจะไม่เห็น */
const favKey=()=>'defirent:fav:'+curAddr();
function loadFav(){
  try{state.fav=new Set(JSON.parse(localStorage.getItem(favKey())||'[]'));}
  catch(e){state.fav=new Set();}
}
function saveFav(){
  try{localStorage.setItem(favKey(),JSON.stringify([...state.fav]));}
  catch(e){/* โหมดไม่ระบุตัวตนหรือพื้นที่เต็ม — ใช้งานต่อได้ แค่ไม่ถูกบันทึก */}
}
const canJudge=()=>{const a=myArb();return !!a&&okStake(a);};
/* ฟิลเตอร์รายการข้อพิพาท — "เคสของฉัน" คือเคสที่เราเป็นผู้ยื่น คู่กรณี หรือผู้พิพาท */
const involvesMe=d=>eqAddr(d.by,curAddr())||eqAddr(d.against,curAddr())||eqAddr(d.arb,curAddr());
/* ผลประโยชน์ทับซ้อน: ผู้ยื่นหรือคู่กรณีของเคส จะรับและตัดสินเคสนั้นไม่ได้ทุกกรณี */
const partyOf=(d,addr)=>eqAddr(d.by,addr)||eqAddr(d.against,addr);
const isParty=d=>partyOf(d,curAddr());
const CONFLICT_SUB='ผู้พิพาทรับหรือตัดสินเคสที่ตัวเองเป็นผู้ยื่นหรือเป็นคู่กรณีไม่ได้ทุกกรณี';
const TH_M=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
/* หมายเหตุ: Result ของ ethers v6 เป็น Array จึงมีเมธอด .at() อยู่แล้ว
   ฟิลด์ชื่อ at ในสัญญาต้องอ่านด้วยตำแหน่ง (เช่น a[2]) ไม่ใช่ a.at */
const thDate=ts=>{const d=new Date(ts);return isNaN(d.getTime())?'ไม่ทราบวันที่':(d.getDate()+' '+TH_M[d.getMonth()]+' '+d.getFullYear());};
const thTime=ts=>{const d=new Date(ts);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+' น.';};
const isToday=ts=>{if(!ts)return false;const a=new Date(ts),b=new Date();return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();};
const closedToday=()=>disputes.filter(d=>d.st==='closed'&&isToday(d.closedAt)).length;
/* กรอบเวลาพิจารณา 48 ชม. นับจากเวลาที่ผู้พิพาทกดลงรับเคส */
const SLA_MS=48*3600000;
function slaText(d){
  if(!d.claimedAt)return '';
  const left=d.claimedAt+SLA_MS-Date.now();
  const h=Math.ceil(Math.abs(left)/3600000);
  return left>0
    ? `<span style="color:${h<=12?'#c0392b':'#0f8a52'};font-weight:700">เหลือเวลาพิจารณา ${h} ชม.</span>`
    : `<span style="color:#c0392b;font-weight:700">เกินกำหนด 48 ชม. แล้ว ${h} ชม.</span>`;
}
/* ธุรกรรมที่เกี่ยวกับบทบาทผู้พิพาทเท่านั้น — คอมมิชชันจากการตัดสิน เงินประกันเข้า-ออก และการลงรับเคส */
const ARB_TX=['Reward','Stake','Unstake','ApplyArbitrator','ClaimCase','Slash'];
/* ชื่อประเภทธุรกรรมภาษาไทย — ชื่ออังกฤษคือชื่อฟังก์ชันในสัญญา เก็บไว้แสดงคู่กัน */
const TXTH={Borrow:'ยืมของ',Lend:'ปล่อยให้ยืม',Deposit:'วางเงินมัดจำ',Return:'คืนของ','List Item':'ลงทะเบียนของ',
 Dispute:'เปิดข้อพิพาท',ClaimCase:'ลงรับเคส',Reward:'ค่าคอมมิชชัน',Refund:'เงินคืนตามคำตัดสิน',
 Stake:'เติมเงินประกัน',Unstake:'ถอนเงินประกัน',RequestExit:'ขอถอนตัวจากผู้พิพาท',ApplyArbitrator:'สมัครผู้พิพาท',Slash:'ถูกริบเงินประกัน',GrantRole:'อนุมัติผู้พิพาท',
 AddCategory:'เพิ่มหมวดหมู่',RemoveCategory:'ลบหมวดหมู่',
 SetFee:'ปรับอัตราค่าธรรมเนียม',SetMinStake:'ปรับเงินประกันขั้นต่ำ',SetReward:'ปรับค่าตอบแทนผู้พิพาท',
 SetApplyOpen:'ปรับการเปิดรับสมัคร',SetPaused:'หยุด/เปิดสัญญา',Treasury:'ถอนรายได้ระบบ',
 ItemStatus:'ปรับสถานะสิ่งของ',Delist:'ถอนสิ่งของออก',ReleaseCase:'ปล่อยเคสกลับคิว',CancelExit:'ยกเลิกคำขอถอนตัว',RejectExit:'ปฏิเสธคำขอถอนตัว'};
const txLabel=t=>TXTH[t]||t;
const amtNum=t=>parseFloat(String(t.amt).replace(/[^0-9.\-]/g,''))||0;
const DFILTERS=[
 {k:'all',   label:'ทั้งหมด',       fn:()=>true,              empty:['ยังไม่มีข้อพิพาท','ทุกสัญญาดำเนินไปด้วยดี 🎉']},
 {k:'open',  label:'กำลังพิจารณา',  fn:d=>d.st==='open',      empty:['ไม่มีเคสที่กำลังพิจารณา','เคสทั้งหมดตัดสินเสร็จเรียบร้อยแล้ว']},
 {k:'wait',  label:'รอผู้พิพาทลงรับ',fn:d=>d.st==='open'&&!d.arb,empty:['ไม่มีเคสที่รอคนรับ','ทุกเคสที่เปิดอยู่มีผู้พิพาทดูแลแล้ว']},
 {k:'closed',label:'ปิดเคสแล้ว',    fn:d=>d.st==='closed',    empty:['ยังไม่มีเคสที่ปิด','เคสที่ตัดสินเสร็จจะมาแสดงตรงนี้']},
 {k:'mine',  label:'เคสของฉัน',     fn:involvesMe,            empty:['คุณยังไม่มีเคสของตัวเอง','เคสที่คุณเป็นผู้ยื่น คู่กรณี หรือผู้พิพาท จะแสดงที่นี่']}
];
function setDFilter(k){state.dFilter=k;renderDispute();}
function setTxFilter(k){state.txFilter=k;state.txPage=1;renderTx();}
function setTxPage(n){state.txPage=n;renderTx();window.scrollTo({top:0,behavior:'smooth'});}
/* ตัวแบ่งหน้าแบบย่อ: 1 … 4 [5] 6 … 20 — ไม่ล้นจอแม้มีหลายร้อยหน้า */
function renderPager(sel,fn,cur,pages,total,from,shown){
  const el=$(sel); if(!el)return;
  if(total<=0){el.style.display='none';return;}
  el.style.display=pages<=1?'none':'';
  if(pages<=1)return;
  const nums=[];
  for(let i=1;i<=pages;i++){
    if(i===1||i===pages||Math.abs(i-cur)<=1)nums.push(i);
    else if(nums[nums.length-1]!=='…')nums.push('…');
  }
  el.innerHTML=`<div class="pg-info">แสดง ${from+1}–${from+shown} จาก ${total} รายการ · หน้า ${cur} / ${pages}</div>
    <div class="pg-btns">
      <button ${cur===1?'disabled':''} onclick="${fn}(${cur-1})">ก่อนหน้า</button>
      ${nums.map(n=>n==='…'?'<span class="pg-gap">…</span>'
        :`<button class="${n===cur?'on':''}" onclick="${fn}(${n})">${n}</button>`).join('')}
      <button ${cur===pages?'disabled':''} onclick="${fn}(${cur+1})">ถัดไป</button>
    </div>`;
}
/* ถอนรายได้ค่าธรรมเนียมออกจากคลังของสัญญา — Admin เท่านั้น (withdrawTreasury) */
function openTreasuryWithdraw(){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin ถอนรายได้ระบบได้');return;}
  const bal=(chainInfo.data&&chainInfo.data.treasury)||0;
  if(bal<=0){toast('info','ยังไม่มีรายได้ในคลัง','ค่าธรรมเนียมจะเข้าคลังเมื่อมีสัญญาเช่าปิดจบหรือข้อพิพาทถูกตัดสิน');return;}
  showModal(`<div class="modal-body" style="padding-top:24px">
    <h2>ถอนรายได้ระบบ</h2>
    <p class="m-sub">withdrawTreasury(to, amount) · โอนออกจากคลังของสัญญาไปยัง address ที่ระบุ</p>
    <div class="esc-tb" style="margin-top:16px">
      <div class="esc-r"><span>ยอดในคลังตอนนี้</span><b style="color:#0f8a52">${bal.toFixed(4)} ETH</b></div>
      <div class="esc-r"><span>ค่าธรรมเนียมระบบ</span><b>${admin.fee}% ของค่าเช่าทุกสัญญา</b></div>
      <div class="esc-r"><span>จ่ายผู้พิพาทไปแล้ว</span><b>${((chainInfo.data&&chainInfo.data.rewardPaid)||0).toFixed(3)} ETH</b></div>
    </div>
    <div class="f2" style="margin-top:16px">
      <div class="field" style="margin-bottom:0"><label>จำนวนที่ถอน (ETH)</label>
        <input id="tw-amt" type="number" step="0.0001" min="0" max="${bal}" value="${bal.toFixed(4)}" autocomplete="off"></div>
      <div class="field" style="margin-bottom:0"><label>โอนไปที่</label>
        <input id="tw-to" value="${esc(state.realAddr||'')}" autocomplete="off"></div>
    </div>
    <div class="notice" style="margin-top:14px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>คลังนี้กันไว้จ่ายค่าตอบแทนผู้พิพาทด้วย ถอนออกหมดแล้วเคสที่ตัดสินถัดไปอาจไม่มีเงินจ่ายค่าตอบแทน</div></div>
    <div class="m-actions" style="margin-top:20px">
      <button class="btn-lg btn-primary" onclick="commitTreasuryWithdraw()">ยืนยันถอน · ส่งธุรกรรม</button>
      <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
    </div></div>`);
}
function commitTreasuryWithdraw(){
  const bal=(chainInfo.data&&chainInfo.data.treasury)||0;
  const v=parseFloat($('#tw-amt').value), to=($('#tw-to').value||'').trim();
  if(!(v>0)){toast('err','จำนวนไม่ถูกต้อง','ใส่จำนวนมากกว่า 0');return;}
  if(v>bal){toast('err','เกินยอดในคลัง','คลังมี '+bal.toFixed(4)+' ETH');return;}
  if(!/^0x[a-fA-F0-9]{40}$/.test(to)){toast('err','address ปลายทางไม่ถูกต้อง','ต้องเป็น address 42 ตัวอักษรขึ้นต้นด้วย 0x');return;}
  closeModal();
  sendTx('ถอนรายได้ระบบ',c=>c.withdrawTreasury(to,ethers.parseEther(String(v))));
}
function escOf(it,days){const rent=+(it.price*(days||it.days)).toFixed(3);return {rent,dep:it.dep,bond:it.bond??it.dep,fee:+(rent*admin.fee/100).toFixed(3)};}
/* เพดานเงินที่ตัดได้ของแต่ละฝ่าย — ผู้พิพาทเลือกจำนวนจริงได้เองตั้งแต่ 0 ถึงเพดานนี้ */
function cutCap(e,outcome){
  return +((outcome==='borrower')?(e.bond+e.rent):e.dep).toFixed(3);
}
function settle(e,outcome,cut){
  const T=+(e.rent+e.dep+e.bond).toFixed(3);
  const c=Math.max(0,Math.min(cutCap(e,outcome),parseFloat(cut)||0));
  let renter,lender;
  if(outcome==='borrower'){ renter=e.dep+c; lender=e.rent+e.bond-c; }
  else { renter=e.dep-c; lender=e.rent+e.bond+c; }
  const plat=+Math.min(e.fee,Math.max(0,lender)).toFixed(3);
  const rn=+renter.toFixed(3);
  /* ปัดเศษแล้วให้ฝั่งผู้ปล่อยเช่ารับส่วนต่าง เงินในสัญญาจะได้ออกครบพอดีเสมอ */
  return {renter:rn,lender:+(T-rn-plat).toFixed(3),plat,cut:+c.toFixed(3),T};
}
const OUTCOME={borrower:'ตัดสินให้ผู้เช่า (ผู้ปล่อยเช่าเป็นฝ่ายผิด)',lender:'ตัดสินให้ผู้ปล่อยเช่า (ผู้เช่าเป็นฝ่ายผิด)'};
const CUTFROM={borrower:'หักจากเงินประกันและค่าเช่าของผู้ปล่อยเช่า ชดเชยให้ผู้เช่า',lender:'หักจากเงินมัดจำของผู้เช่า ชดเชยให้ผู้ปล่อยเช่า'};
const verdictText=(outcome,cut)=>OUTCOME[outcome]+(cut>0?(' · หัก '+(+cut).toFixed(3)+' ETH'):' · ไม่หักเงินฝ่ายใด');
const openPool=()=>disputes.filter(d=>d.st==='open'&&!d.arb);
const myCases=()=>disputes.filter(d=>d.st==='open'&&eqAddr(d.arb,curAddr()));

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>n.toLocaleString('en-US',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:3});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(kind,title,sub){
  const icons={ok:'<path d="m5 13 4 4L19 7"/>',err:'<path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'};
  const el=document.createElement('div');
  el.className='toast '+(kind==='ok'?'':kind);
  el.innerHTML=`<div class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${icons[kind]||icons.ok}</svg></div><div><strong>${esc(title)}</strong>${sub?`<small>${esc(sub)}</small>`:''}</div>`;
  $('#toasts').appendChild(el);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),250)},3400);
}

/* ---------- navigation ---------- */
function go(page){
  state.page=page;
  $$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));
  $$('.navlink').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  window.scrollTo({top:0,behavior:'smooth'});
  if(page==='browse')renderBrowse();
  if(page==='myitems')renderMy();
  if(page==='tx')renderTx();
  if(page==='dispute')renderDispute();
  if(page==='arb')renderArb();
  if(page==='admin')renderAdmin();
}
$('#navlinks').addEventListener('click',e=>{const b=e.target.closest('.navlink');if(b)go(b.dataset.page)});

/* ---------- categories ---------- */
function renderCats(){
  /* แถวแรกโชว์ 6 ช่อง ที่เหลือซ่อนไว้หลังปุ่ม More — กางได้จริง ไม่ใช่ปุ่มหลอก */
  const list=CATS.filter(c=>c.id!=='more');
  const LIMIT=6, hidden=list.length-LIMIT;
  const shown=(state.moreOpen||hidden<=0)?list:list.slice(0,LIMIT);
  const more=CATS.find(c=>c.id==='more');
  const adm=state.role==='admin';
  let html=shown.map(c=>{
    /* Admin ลบหมวดได้จากหน้าแรกเลย — หมวด "ทั้งหมด" เป็นตัวกรอง ไม่ใช่หมวดจริง จึงลบไม่ได้ */
    const n=adm&&c.id!=='all'?catCount(c.id):0;
    const del=(adm&&c.id!=='all')?`<span class="cat-del${n?' busy':''}" data-del="${c.id}" title="${n?'มีสิ่งของ '+n+' รายการอยู่ในหมวดนี้':'ลบหมวดนี้'}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span>`:'';
    return `<button class="cat ${state.cat===c.id?'active':''}" data-cat="${c.id}">${del}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${c.ic}</svg>
      <div class="en">${esc(c.en)}</div><div class="th">${esc(c.th)}</div></button>`;
  }).join('');
  if(hidden>0&&more)html+=`<button class="cat" data-cat="more">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${more.ic}</svg>
      <div class="en" style="display:flex;align-items:center;gap:4px">${state.moreOpen?'ย่อ':'More'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" width="11" height="11" style="transform:rotate(${state.moreOpen?180:0}deg)"><path d="m6 9 6 6 6-6"/></svg></div>
      <div class="th">${state.moreOpen?'ย่อรายการ':'อีก '+hidden+' หมวด'}</div></button>`;
  if(state.role==='admin')html+=`<button class="cat add" data-cat="__add">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      <div class="en">เพิ่มหมวด</div><div class="th">จัดการหมวดหมู่</div></button>`;
  $('#cats').innerHTML=html;
  $$('#cats .cat-del').forEach(x=>x.onclick=e=>{
    e.stopPropagation(); e.preventDefault();
    askRemoveCategory(x.dataset.del);
  });
  $$('#cats .cat').forEach(b=>b.onclick=()=>{
    if(b.dataset.cat==='__add'){openCatManager();return;}
    if(b.dataset.cat==='more'){state.moreOpen=!state.moreOpen;renderCats();return;}
    state.cat=b.dataset.cat;renderCats();renderPopular();
    toast('info','กรองหมวดหมู่แล้ว',(CATS.find(c=>c.id===state.cat)||{}).th||'ทั้งหมด');
  });
}

/* ---------- item card ---------- */
function card(it){
  const s=ST[it.st];
  return `<article class="icard">
    <div class="icard-img">${it.art}
      <span class="badge ${s.cls}"><i></i>${s.th}</span>
      <button class="fav ${state.fav.has(it.id)?'on':''}" data-fav="${it.id}" title="บันทึกรายการโปรด">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2l8.8 8.8 8.8-8.8a5.1 5.1 0 0 0 0-7.2z"/></svg>
      </button>
    </div>
    <div class="icard-body">
      <div class="icard-title">${esc(it.name)}</div>
      <div class="icard-meta">
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>${it.days} วัน</span>
        <i class="sep"></i>
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>${it.price} ETH / วัน</span>
      </div>
      <button class="btn-card" data-open="${it.id}" onclick="openItem(${it.id})">ดูรายละเอียด
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
      </button>
    </div>
  </article>`;
}
function bindCards(root){
  root.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{
    e.stopPropagation();const id=+b.dataset.fav;
    if(state.fav.has(id)){state.fav.delete(id);b.classList.remove('on');toast('info','นำออกจากรายการโปรด',items.find(i=>i.id===id).name);}
    else{state.fav.add(id);b.classList.add('on');toast('ok','เพิ่มในรายการโปรดแล้ว',items.find(i=>i.id===id).name);}
    saveFav();
    if(state.page==='browse')renderBrowse();
  });
  root.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openItem(+b.dataset.open));
}
function filtered(){
  let l=items.filter(i=>(state.cat==='all'||state.cat==='more'||i.cat===state.cat)&&(!state.q||i.name.toLowerCase().includes(state.q)));
  return l;
}
function renderPopular(){
  const l=filtered().sort((a,b)=>b.pop-a.pop).slice(0,4);
  const g=$('#popularGrid');
  g.innerHTML=l.length?l.map(card).join(''):`<div class="empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg><h4>ไม่พบสิ่งของที่ค้นหา</h4><p>ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p></div>`;
  bindCards(g);
}

/* ---------- browse ---------- */
function renderBrowse(){
  $('#browseFilters').innerHTML=CATS.filter(c=>c.id!=='more').map(c=>
    `<button class="chip ${state.cat===c.id?'active':''}" data-bcat="${c.id}">${c.en}${c.th?' · '+c.th:''}</button>`).join('')
    +`<button class="chip ${state.favOnly?'active':''}" id="favChip" style="margin-left:4px">♥ รายการโปรด${state.fav.size?' · '+state.fav.size:''}</button>`;
  $$('#browseFilters .chip[data-bcat]').forEach(b=>b.onclick=()=>{state.cat=b.dataset.bcat;renderBrowse();renderCats();renderPopular()});
  $('#favChip').onclick=()=>{state.favOnly=!state.favOnly;renderBrowse();};
  let l=filtered();const s=$('#sortSel').value;
  if(state.favOnly)l=l.filter(i=>state.fav.has(i.id));
  if(s==='low')l.sort((a,b)=>a.price-b.price);
  else if(s==='high')l.sort((a,b)=>b.price-a.price);
  else if(s==='days')l.sort((a,b)=>b.days-a.days);
  else l.sort((a,b)=>b.pop-a.pop);
  const w=$('#browseWrap');
  w.innerHTML=l.length?`<div class="grid-browse">${l.map(card).join('')}</div>`
    :(state.favOnly
      ?`<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2l8.8 8.8 8.8-8.8a5.1 5.1 0 0 0 0-7.2z"/></svg><h4>ยังไม่มีรายการโปรด</h4><p>กดรูปหัวใจมุมขวาบนของการ์ดสิ่งของเพื่อเก็บไว้ดูทีหลัง · บันทึกแยกตามกระเป๋าที่ใช้อยู่</p></div>`
      :`<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg><h4>ไม่พบสิ่งของที่ค้นหา</h4><p>ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p></div>`);
  bindCards(w);
}

/* ---------- my items ---------- */
function renderMy(){
  if(!$('#myKpis'))return;
  const isUser=state.role==='user', isAdm=state.role==='admin';
  /* ยึดตาม address ไม่ใช่ role — ของที่เคยลงไว้ตอนเป็น User ต้องยังเห็นและถอนออกได้
     แม้ภายหลังกระเป๋านี้จะได้รับอนุมัติเป็นผู้พิพาทแล้วก็ตาม */
  /* เทียบกับ address ที่เชื่อมอยู่ "ตอนนี้" ทุกครั้ง — ไม่ใช้ flag ที่ฝังมาตอนโหลด
     เพราะถ้าสลับบัญชีแล้วข้อมูลยังไม่ถูกซิงก์ flag เก่าจะทำให้เห็นของคนอื่น */
  const _me=state.realAddr||curAddr();
  const lent=isAdm?[]:items.filter(i=>eqAddr(i.lender||i.owner,_me));
  const bor =isAdm?[]:items.filter(i=>eqAddr(i.borrower,_me));
  /* รายได้สะสม = เงินที่สัญญาจ่ายออกให้ address นี้จริงแล้ว ไม่ใช่ยอดในกระเป๋า
     และไม่ใช่ค่าเช่าที่ "ตั้งราคาไว้" ของที่ยังไม่มีใครยืมจึงยังไม่นับ */
  const earned=EARNED[String(curAddr()||'').toLowerCase()]||0;
  /* รายจ่ายสะสมฝั่งผู้เช่า — ค่าเช่าบวกเงินมัดจำที่จ่ายเข้าสัญญาทุกชิ้นที่กำลังยืม */
  const spent=bor.reduce((s,i)=>{const e=escOf(i);return s+e.rent+e.dep;},0);
  /* ชื่อหน้าและชุดตัวเลขเปลี่ยนตามบทบาท — Admin ดูของทั้งระบบ ไม่ใช่ของตัวเอง */
  const disputedNames=new Set(disputes.filter(d=>d.st==='open').map(d=>d.item));
  $('#myTitle').textContent=isAdm?'All Items':'My Items';
  $('#mySub').textContent=isAdm?'สิ่งของทั้งหมดที่ลงทะเบียนในระบบ · มุมมองผู้ดูแล ดูได้แต่ไม่เป็นคู่สัญญาเอง'
    :isUser?'สิ่งของที่คุณปล่อยให้ยืม และของที่คุณกำลังยืมอยู่'
    :(lent.length||bor.length)
      ? 'Role '+ROLES[state.role].en+' เป็นคู่สัญญาใหม่ไม่ได้ · นี่คือรายการค้างจากตอนเป็น User ถอนออกให้หมดเพื่อความเป็นกลาง'
      : 'Role '+ROLES[state.role].en+' ไม่ได้เป็นคู่สัญญาเช่า จึงไม่มีรายการสิ่งของ';
  const _bl=$('#btnListItem'); if(_bl)_bl.style.display=isRenter()?'':'none';
  $('#allItemsPanel').style.display=isAdm?'':'none';
  $('#lentPanel').style.display=isAdm?'none':'';
  $('#borrowPanel').style.display=isAdm?'none':'';
  $('#myKpis').innerHTML=(isAdm?[
    ['ของทั้งหมดในระบบ',items.length,'รายการที่ลงทะเบียนไว้','<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M9 3v18"/>'],
    ['พร้อมให้ยืม',items.filter(i=>i.st==='available').length,'ว่างอยู่ตอนนี้','<path d="M6 2h12l1 6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M5 11v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"/>'],
    ['อยู่ระหว่างสัญญา',items.filter(i=>i.st==='borrowed'||i.st==='returning').length,'ถูกยืม / รอคืน','<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'],
    ['ของที่มีข้อพิพาท',items.filter(i=>disputedNames.has(i.name)).length,'เคสที่ยังไม่ปิด','<path d="M12 3v18M6 7l-4 7h8zM18 7l-4 7h8z"/><path d="M4 7h16"/>']
  ]:[
    ['ของที่ปล่อยให้ยืม',lent.length,'รายการที่ลงทะเบียน','<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M9 3v18"/>'],
    ['ของที่กำลังยืม',bor.length,'สัญญาที่ยังไม่ปิด','<path d="M6 2h12l1 6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M5 11v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"/>'],
    ['รายได้สะสม',earned.toFixed(3)+' ETH','รับจริงจากสัญญาที่ปิดแล้ว (หักค่าธรรมเนียม)','<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'],
    ['รายจ่ายสะสม',isUser?spent.toFixed(2)+' ETH':'—',isUser?'ค่าเช่า + มัดจำที่จ่ายไป':'เฉพาะบัญชีผู้ใช้ทั่วไป','<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>']
  ]).map(k=>`<div class="kpi"><div class="k-lbl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${k[3]}</svg>${k[0]}</div><div class="k-val">${k[1]}</div><div class="k-sub">${k[2]}</div></div>`).join('');
  $('#lentCount').textContent=lent.length+' รายการ';
  $('#borrowCount').textContent=bor.length+' รายการ';
  /* ประวัติสัญญาที่ปิดแล้ว แยกสองฝั่งตามบทบาทในสัญญานั้น สร้างจาก event บนเชน */
  histTable('#histPanel','#histCount','#histWrap',
    isAdm?[]:RENT_HISTORY.filter(r=>eqAddr(r.lender,_me)), true, isAdm,
    ['ยังไม่มีสัญญาที่ปล่อยให้ยืมแล้วปิดจบ','สัญญาที่คนอื่นยืมของคุณแล้วจบลง จะมาแสดงที่นี่พร้อมยอดที่คุณได้รับ']);
  histTable('#histBorPanel','#histBorCount','#histBorWrap',
    isAdm?[]:RENT_HISTORY.filter(r=>eqAddr(r.renter,_me)), false, isAdm,
    ['ยังไม่มีประวัติการยืม','ของที่คุณเคยยืมแล้วปิดสัญญาเรียบร้อย จะมาแสดงที่นี่พร้อมยอดเงินมัดจำที่ได้คืน']);
  $('#lentWrap').innerHTML=lent.length?rows(lent,'lent'):emptyBox(isUser?'ยังไม่มีสิ่งของที่ปล่อยให้ยืม':'wallet นี้ไม่มีรายการสิ่งของ',isUser?'กด “ลงทะเบียนสิ่งของ” เพื่อเริ่มสร้างรายได้':'คุณกำลังใช้ Role '+ROLES[state.role].en+' · สลับกลับเป็น User เพื่อดูของของคุณ');
  $('#borrowWrap').innerHTML=bor.length?rows(bor,'bor'):emptyBox(isUser?'ยังไม่มีของที่กำลังยืม':'wallet นี้ไม่มีสัญญายืม',isUser?'ไปที่หน้า Browse เพื่อเลือกยืมสิ่งของ':'สลับกลับเป็น Role User เพื่อดูสัญญาของคุณ');
  $('#lentWrap').querySelectorAll('[data-act]').forEach(bindAct);
  $('#borrowWrap').querySelectorAll('[data-act]').forEach(bindAct);
  if(isAdm){
    $('#allItemsCount').textContent=items.length+' รายการ';
    $('#allItemsWrap').innerHTML=items.length?`<div style="overflow-x:auto"><table><thead><tr><th>รายการ</th><th>หมวดหมู่</th><th>เจ้าของ</th><th>ราคา/วัน</th><th>สถานะ</th><th>ข้อพิพาท</th></tr></thead><tbody>${
      items.map(i=>{const dq=disputes.filter(d=>d.item===i.name), op=dq.filter(d=>d.st==='open').length;
      return `<tr><td style="font-weight:700">${esc(i.name)}</td><td style="color:#7a86a8">${CATS.find(c=>c.id===i.cat)?.th||i.cat}</td>
      <td><code class="hash">${esc(i.owner)}</code></td><td>${i.price} ETH</td>
      <td><span class="tag ${ST[i.st].tag}">${ST[i.st].th}</span></td>
      <td>${op?`<span class="tag pend">${op} เคสเปิดอยู่</span>`:dq.length?`<span class="tag off">เคยมี ${dq.length} เคส</span>`:'<span style="color:#98a2bf">—</span>'}</td></tr>`}).join('')
    }</tbody></table></div>`:emptyBox('ยังไม่มีสิ่งของในระบบ','เมื่อผู้ใช้ลงทะเบียนของ รายการจะมาแสดงที่นี่');
  }
}
/* ---------- ตรวจสอบสภาพสินค้าก่อนปล่อยเงินมัดจำ (ฝั่งผู้ให้ยืม) ---------- */
function openInspect(id){
  const it=items.find(x=>x.id===id); if(!it)return;
  const rent=+(it.price*it.days).toFixed(3);
  const due=(it.returnedAt||Date.now())+3*86400000;
  const left=Math.max(0,Math.ceil((due-Date.now())/86400000));
  showModal(`<div class="modal-body" style="padding-top:26px">
    <div style="display:flex;gap:13px;align-items:flex-start">
      <div class="cf-ico warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></div>
      <div><h2 style="font-size:19px">ตรวจสอบสภาพสินค้า</h2>
        <p class="m-sub">${esc(it.name)} — ผู้เช่าส่งคืนแล้ว ตรวจสภาพก่อนปล่อยเงินมัดจำ</p></div>
    </div>
    <div class="dt-grid">
      <div class="dt-box"><div class="l">ผู้เช่า</div><div class="v">${esc(it.borrower||'—')}</div></div>
      <div class="dt-box"><div class="l">ระยะเวลาเช่า</div><div class="v">${it.days} วัน · ${it.price} ETH/วัน</div></div>
      <div class="dt-box"><div class="l">คืนเมื่อ</div><div class="v">${it.returnedAt?thDate(it.returnedAt)+' · '+thTime(it.returnedAt):'เมื่อสักครู่'}</div></div>
      <div class="dt-box"><div class="l">ต้องตรวจภายใน</div><div class="v" style="color:${left<=1?'#c0392b':'#a9690b'}">${thDate(due)} · เหลือ ${left} วัน</div></div>
    </div>
    <div class="esc-tb">
      <div class="esc-r"><span>ค่าเช่ารวม (เข้าบัญชีคุณ)</span><b style="color:#0f8a52">+${rent.toFixed(3)} ETH</b></div>
      <div class="esc-r"><span>เงินมัดจำของผู้เช่า (รอปล่อย)</span><b>${it.dep.toFixed(3)} ETH</b></div>
      <div class="esc-r"><span>เงินประกันของคุณ (คืนเมื่อปิดสัญญา)</span><b>${it.bond.toFixed(3)} ETH</b></div>
    </div>
    <div class="cf-what" style="margin-top:14px">
      <b>ถ้าของอยู่ในสภาพดี</b> กดคืนเงินมัดจำ สัญญาจะปิดทันทีและของกลับมาสถานะพร้อมให้ยืม<br>
      <b>ถ้าของเสียหายหรือสูญหาย</b> เปิดข้อพิพาทเพื่อให้ผู้พิพาทตัดสินว่าควรหักเงินมัดจำเท่าไหร่ — คุณหักเองไม่ได้
    </div>
    <div class="m-actions" style="margin-top:20px">
      <button class="btn-lg btn-primary" onclick="acceptReturn(${it.id})">สภาพดี · คืนเงินมัดจำ ${it.dep.toFixed(2)} ETH</button>
      <button class="btn-lg btn-ghost" style="color:#c0392b;border-color:#ffd4d4" onclick="disputeFromInspect(${it.id})">⚖ ของเสียหาย · เปิดข้อพิพาท</button>
      <button class="btn-lg btn-ghost" onclick="closeModal()">ตรวจทีหลัง</button>
    </div>
  </div>`);
}
function acceptReturn(id){
  if(admin.paused){toast('err','สัญญาถูกหยุดชั่วคราว','Admin สั่ง pause() อยู่ — ปล่อยเงินมัดจำไม่ได้');return;}
  const it=items.find(x=>x.id===id); if(!it)return;
  if(onChain()){closeModal();sendTx('ตรวจรับของ · ปิดสัญญา',c=>c.acceptReturn(it.rentalId));return;}
  const rent=+(it.price*it.days).toFixed(3), fee=+(rent*admin.fee/100).toFixed(3);
  it.st='available'; delete it.borrower; delete it.returnedAt;
  state.bal+=+(rent-fee).toFixed(3);
  txs.unshift({h:randHash(),type:'Refund',item:'คืนเงินมัดจำ: '+it.name,amt:'-'+it.dep.toFixed(2)+' ETH',st:'ok',time:'เมื่อสักครู่'});
  txs.unshift({h:randHash(),type:'Lend',item:'ปิดสัญญา: '+it.name,amt:'+'+(rent-fee).toFixed(3)+' ETH',st:'ok',time:'เมื่อสักครู่'});
  closeModal();updateWallet();renderMy();renderPopular();renderStats();
  toast('ok','ปิดสัญญาเรียบร้อย','คืนเงินมัดจำ '+it.dep.toFixed(2)+' ETH ให้ผู้เช่า · คุณได้ค่าเช่า '+(rent-fee).toFixed(3)+' ETH หลังหักค่าธรรมเนียม');
}
function disputeFromInspect(id){
  closeModal();
  openDispute();
  const sel=$('#d-item'); if(sel)sel.value=String(id);
  const ty=$('#d-type'); if(ty)ty.value='สินค้าชำรุด/เสียหาย';
  const rs=$('#d-reason'); if(rs)rs.placeholder='ระบุความเสียหายที่พบตอนตรวจสภาพ พร้อมหลักฐาน เช่น รอยขีดข่วน ชิ้นส่วนที่หาย...';
}
/* โหมดออกแบบเท่านั้น — จำลองว่าผู้ให้ยืมตรวจรับของและปล่อยเงินมัดจำคืน */
function simulateInspection(id){
  setTimeout(()=>{
    const it=items.find(x=>x.id===id);
    if(!it||it.st!=='inspect')return;
    it.st='available'; it.mineBorrow=false; delete it.borrower; delete it.returnedAt;
    state.bal=+(state.bal+it.dep).toFixed(3);
    txs.unshift({h:randHash(),type:'Refund',item:'ผู้ให้ยืมตรวจรับแล้ว · คืนมัดจำ: '+it.name,amt:'+'+it.dep.toFixed(2)+' ETH',st:'ok',time:'เมื่อสักครู่'});
    notify(curAddr(),'✅','#e6f7ef','ผู้ให้ยืมตรวจรับของแล้ว',it.name+' · สภาพเรียบร้อย คืนเงินมัดจำ '+it.dep.toFixed(2)+' ETH เข้ากระเป๋าแล้ว','myitems');
    updateWallet();renderMy();renderPopular();renderStats();renderNotifs();
    if(state.page==='tx')renderTx();
    toast('ok','ผู้ให้ยืมตรวจรับแล้ว','คืนเงินมัดจำ '+it.dep.toFixed(2)+' ETH · สัญญาปิดเรียบร้อย');
  },6000);
}
function emptyBox(t,s){return `<div style="padding:34px;text-align:center"><h4 style="font-size:14px;font-weight:700;font-family:'Noto Sans Thai',sans-serif">${t}</h4><p style="font-size:12.5px;color:#7a86a8;margin-top:5px;font-family:'Noto Sans Thai',sans-serif">${s}</p></div>`;}
/* ตารางประวัติสัญญาที่ปิดแล้ว ใช้ร่วมกันทั้งฝั่งปล่อยเช่าและฝั่งยืม
   asLender=true → แสดงยอดฝั่งผู้ปล่อยเช่า, false → ยอดที่ผู้เช่าได้คืน */
function histTable(panelSel,countSel,wrapSel,list,asLender,hide,empty){
  const p=$(panelSel); if(!p)return;
  p.style.display=hide?'none':'';
  const c=$(countSel); if(c)c.textContent=list.length+' รายการ';
  const w=$(wrapSel); if(!w)return;
  w.innerHTML=list.length?`<div style="overflow-x:auto"><table><thead><tr><th>รายการ</th><th>${asLender?'ผู้เช่า':'เจ้าของ'}</th><th>ผลลัพธ์</th><th style="text-align:right">${asLender?'ยอดที่คุณได้รับ':'ยอดที่คุณได้คืน'}</th><th>เวลา</th></tr></thead><tbody>${
    list.map(r=>`<tr><td style="font-weight:700">${esc(r.itemName)}</td>
      <td><code class="hash">${shortAddr(asLender?r.renter:r.lender)}</code></td>
      <td><span class="tag ${r.cls}">${r.how}</span></td>
      <td style="text-align:right;font-weight:700;color:#0f8a52">+${(asLender?r.toLender:r.toRenter).toFixed(3)} ETH</td>
      <td style="color:#7a86a8">บล็อก ${r.block}</td></tr>`).join('')
  }</tbody></table></div>`:emptyBox(empty[0],empty[1]);
}
function rows(list,kind){
  return `<div style="overflow-x:auto"><table><thead><tr><th>รายการ</th><th>หมวดหมู่</th><th>ราคา/วัน</th><th>ระยะเวลา</th><th>สถานะ</th><th style="text-align:right">จัดการ</th></tr></thead><tbody>${
    list.map(i=>`<tr><td style="font-weight:700">${esc(i.name)}</td><td style="color:#7a86a8">${CATS.find(c=>c.id===i.cat)?.th||i.cat}</td><td>${i.price} ETH</td><td>${i.days} วัน</td><td><span class="tag ${ST[i.st].tag}">${ST[i.st].th}</span></td>
    <td style="text-align:right;white-space:nowrap">${
      /* ยื่นข้อพิพาทแล้ว = พ้นมือคู่สัญญา ต้องรอผู้พิพาทตัดสิน ไม่มีปุ่มให้กดทั้งสองฝ่าย */
      disputeOf(i)
      ? `<span class="claimed">⚖ รอผู้พิพาทตัดสิน</span> <button class="tbtn g" data-act="open" data-id="${i.id}">ดู</button>`
      : kind==='bor'
      ? (i.st==='inspect'
          ? `<span class="claimed">⏳ รอผู้ให้ยืมตรวจสอบ</span> <button class="tbtn g" data-act="open" data-id="${i.id}">ดู</button>`
          : `<button class="tbtn p" data-act="return" data-id="${i.id}">คืนของ</button> <button class="tbtn g" data-act="open" data-id="${i.id}">ดู</button>`)
      : (i.st==='inspect'
          ? `<button class="tbtn p" data-act="inspect" data-id="${i.id}">🔍 ตรวจสอบสินค้า</button> <button class="tbtn g" data-act="open" data-id="${i.id}">ดู</button>`
          : `<button class="tbtn g" data-act="toggle" data-id="${i.id}">${i.st==='closed'?'เปิดให้ยืม':'ปิดชั่วคราว'}</button> <button class="tbtn g" data-act="open" data-id="${i.id}">ดู</button>`)}</td></tr>`).join('')
  }</tbody></table></div>`;
}
function openMyItemDetail(id){
  const it=items.find(i=>i.id===id); if(!it)return;
  const status=ST[it.st]||{th:it.st,cls:''};
  const cat=CATS.find(c=>c.id===it.cat)?.th||it.cat||'—';
  const escInfo=escOf(it);
  const row=(label,value)=>`<div class="m-row"><span class="k">${label}</span><span class="v">${value}</span></div>`;
  showModal(`
    <div class="modal-art">${it.art||''}${closeBtn}<span class="badge ${status.cls}" style="left:14px;top:14px"><i></i>${status.th}</span></div>
    <div class="modal-body">
      <h2>${esc(it.name)}</h2>
      <p class="m-sub">${esc(it.desc||'ไม่มีรายละเอียดเพิ่มเติม')}</p>
      <div class="m-grid">
        <div class="m-box"><div class="l">ค่าเช่า / วัน</div><div class="v">${Number(it.price||0).toFixed(3)} ETH</div></div>
        <div class="m-box"><div class="l">ระยะเวลา</div><div class="v">${it.days||'—'} วัน</div></div>
        <div class="m-box"><div class="l">เงินมัดจำ</div><div class="v">${Number(it.dep||0).toFixed(3)} ETH</div></div>
      </div>
      ${row('สถานะปัจจุบัน',`<b>${status.th}</b>`)}
      ${row('หมวดหมู่',cat)}
      ${row('ผู้ให้ยืม',esc(it.mine?'คุณ (เจ้าของ)':(it.owner||'—')))}
      ${row('ผู้ยืม',esc(it.borrower||'—'))}
      ${row('เงินประกันผู้ให้ยืม',`${Number(it.bond||0).toFixed(3)} ETH`)}
      ${it.returnedAt?row('วันที่ส่งคืน',`${thDate(it.returnedAt)} · ${thTime(it.returnedAt)}`):''}
      ${it.st==='inspect'?`<div class="notice" style="margin-top:14px"><div>⏳ ผู้ยืมส่งคืนสิ่งของแล้ว ขณะนี้กำลังรอผู้ให้ยืมตรวจสอบสภาพสินค้า</div></div>`:''}
      <div class="m-actions" style="margin-top:20px"><button class="btn-lg btn-ghost" onclick="closeModal()">ปิด</button></div>
    </div>`);
}

function bindAct(b){
  b.onclick=()=>{
    const it=items.find(i=>i.id===+b.dataset.id);
    if(b.dataset.act==='open')return openMyItemDetail(it.id);
    if(b.dataset.act==='return'){
      if(!requireWallet())return;
      if(admin.paused){toast('err','สัญญาถูกหยุดชั่วคราว','Admin สั่ง pause() อยู่ — ส่งคืนสิ่งของไม่ได้');return;}
      if(onChain()){sendTx('ส่งคืนสิ่งของ',c=>c.returnItem(it.rentalId));return;}
      /* ส่งคืนแล้วยังไม่ปิดสัญญา — รอเจ้าของตรวจสภาพก่อนจึงปล่อยเงินมัดจำ */
      it.st='inspect'; it.returnedAt=Date.now();
      txs.unshift({h:randHash(),type:'Return',item:it.name,amt:'0.00 ETH',st:'pend',time:'เมื่อสักครู่'});
      renderMy();renderPopular();renderStats();
      if(state.page==='tx')renderTx();
      toast('ok','ส่งคืนสิ่งของแล้ว','เข้าสู่ขั้นตอนตรวจสอบสภาพ · เงินมัดจำ '+it.dep.toFixed(2)+' ETH ยังล็อกอยู่จนกว่าผู้ให้ยืมจะตรวจเสร็จ');
      /* ผู้ให้ยืมเป็นคนละ wallet ที่สลับไปไม่ได้ในเดโม จึงจำลองการตรวจรับให้ flow เดินครบวง */
      if(DESIGN_MODE&&it.mineBorrow)simulateInspection(it.id);
    }
    if(b.dataset.act==='inspect')return openInspect(it.id);
    if(b.dataset.act==='toggle'){
      if(onChain()){sendTx('เปลี่ยนสถานะการให้เช่า',c=>c.setAvailability(it.id,!it.allowRent));return;}
      it.st=it.st==='closed'?'available':'closed';renderMy();renderPopular();
      toast('info','อัปเดตสถานะแล้ว',it.name+' → '+ST[it.st].th);
    }
  };
}

/* ---------- transactions ---------- */
function randHash(){const h='0123456789abcdef';let a='',b='';for(let i=0;i<4;i++)a+=h[Math.random()*16|0];for(let i=0;i<4;i++)b+=h[Math.random()*16|0];return '0x'+a+'...'+b;}
function renderTx(){
  const arbView=state.role==='arbitrator', admView=state.role==='admin', usrView=!arbView&&!admView;
  /* Admin เห็นทุกธุรกรรมในระบบ · บทบาทอื่นเห็นเฉพาะที่ address ของตัวเองเกี่ยวข้อง */
  const meAddr=String(curAddr()||'').toLowerCase();
  const isMine=t=>(!t.onchain||!t.who||!t.who.length)?true:t.who.includes(meAddr);
  /* บทบาท User = ทุกธุรกรรมของ address นี้ ไม่ตัดประเภทใดทิ้ง (เช่น ค่าสมัครผู้พิพาทที่จ่ายไปจริง)
     บทบาท Arbitrator = มุมมองเฉพาะงานตัดสินของ address นี้ */
  const scoped=admView?txs
    :arbView?txs.filter(t=>ARB_TX.includes(t.type)&&isMine(t))
    :txs.filter(isMine);
  /* Admin เห็นทุกธุรกรรมในระบบ และกรองตามประเภทได้ */
  const fb=$('#txFilterBar');
  if(fb){
    fb.style.display=admView?'':'none';
    if(admView){
      const types=['all',...[...new Set(txs.map(t=>t.type))]];
      if(!types.includes(state.txFilter))state.txFilter='all';
      fb.innerHTML=types.map(k=>`<button class="fchip ${state.txFilter===k?'active':''}" onclick="setTxFilter('${k}')">${k==='all'?'ทั้งหมด':esc(txLabel(k))}<i>${k==='all'?txs.length:txs.filter(t=>t.type===k).length}</i></button>`).join('');
    }
  }
  const list=(admView&&state.txFilter!=='all')?scoped.filter(t=>t.type===state.txFilter):scoped;
  const sc=$('#txScope');
  if(sc){
    sc.style.display='';
    sc.textContent=(onChain()?'จากเชนจริง · ':'')+(admView?'มุมมองผู้ดูแล · ทุกธุรกรรมในระบบ'
      :(arbView?'เฉพาะธุรกรรมผู้พิพาทของ ':'เฉพาะธุรกรรมของ ')+shortAddr(curAddr()));
  }
  const _a=myArb();
  const comm=list.filter(t=>t.type==='Reward').reduce((n,t)=>n+amtNum(t),0);
  const inflow=list.filter(t=>t.amt.startsWith('+')).length;
  const volume=txs.reduce((n,t)=>n+Math.abs(amtNum(t)),0);
  const commTotal=admin.rewardPaid;
  /* คลังค่าธรรมเนียมของระบบ — สัญญาหักเข้า treasury ทุกครั้งที่ปิดสัญญาหรือตัดสินข้อพิพาท */
  const treasuryVal=(chainInfo.data&&chainInfo.data.treasury)||0;
  const staked=admin.arbs.reduce((n,a)=>n+a.stake,0);
  $('#txKpis').innerHTML=(admView?[
    ['ธุรกรรมทั้งหมด',txs.length,'ทุกบทบาทรวมกัน · บันทึกบนเชน'],
    ['มูลค่าที่ไหลผ่านระบบ',volume.toFixed(2)+' ETH','รวมเงินเข้าและออกทุกรายการ'],
    ['คอมมิชชันจ่ายผู้พิพาท',commTotal.toFixed(3)+' ETH','รวม '+admin.arbs.length+' คน'],
    ['เงินประกันล็อกอยู่',staked.toFixed(2)+' ETH','ค้ำระบบจากผู้พิพาท'],
    ['รายได้ค่าธรรมเนียมในคลัง',treasuryVal.toFixed(4)+' ETH','เก็บจากทุกสัญญาที่ปิด · ถอนได้',
      `<button class="tbtn g" style="margin-top:9px;width:100%;${treasuryVal>0?'color:#0f8a52;border-color:#bfe8d0;background:#f1fbf5':''}" ${treasuryVal>0?'':'disabled'} onclick="openTreasuryWithdraw()">${treasuryVal>0?'ถอนรายได้ออก':'ยังไม่มีรายได้'}</button>`]
  ]:usrView?[
    ['ธุรกรรมของฉัน',list.length,'รายการที่คุณทำบนเชน'],
    ['สำเร็จแล้ว',list.filter(t=>t.st==='ok').length,'ยืนยันบนบล็อกเชนแล้ว'],
    ['รอยืนยัน',list.filter(t=>t.st==='pend').length,'กำลังรอ confirm'],
    ['ยอดใช้จ่าย',list.filter(t=>t.amt.startsWith('-')).reduce((n,t)=>n+Math.abs(amtNum(t)),0).toFixed(2)+' ETH','รวมเงินที่จ่ายออก']
  ]:arbView?[
    ['ธุรกรรมผู้พิพาท',list.length,'คอมมิชชัน · ประกัน · ลงรับเคส'],
    ['สำเร็จแล้ว',list.filter(t=>t.st==='ok').length,'confirmed'],
    ['รอยืนยัน',list.filter(t=>t.st==='pend').length,'pending'],
    ['ค่าคอมมิชชันสะสม',(_a?(_a.earned||0):comm).toFixed(3)+' ETH','จาก '+(_a?_a.cases:list.filter(t=>t.type==='Reward').length)+' เคสที่ตัดสิน']
  ]:[
    ['ธุรกรรมทั้งหมด',list.length,'บันทึกบนเชน'],
    ['สำเร็จแล้ว',list.filter(t=>t.st==='ok').length,'confirmed'],
    ['รอยืนยัน',list.filter(t=>t.st==='pend').length,'pending'],
    ['รายรับ',inflow,'รายการเงินเข้า']
  ]).map(k=>`<div class="kpi"><div class="k-lbl">${k[0]}</div><div class="k-val">${k[1]}</div><div class="k-sub">${k[2]}</div>${k[3]||''}</div>`).join('');
  $('#txKpis').style.gridTemplateColumns=admView?'repeat(5,1fr)':'';
  /* แบ่งหน้าละ 15 รายการ — ประวัติบนเชนยาวขึ้นเรื่อย ๆ ตามการใช้งาน */
  const PER=15, pages=Math.max(1,Math.ceil(list.length/PER));
  if(!state.txPage||state.txPage>pages)state.txPage=1;
  const from=(state.txPage-1)*PER, page=list.slice(from,from+PER);
  renderPager('#txPager','setTxPage',state.txPage,pages,list.length,from,page.length);
  $('#txTable').innerHTML=`<thead><tr><th>Tx Hash</th><th>ประเภท</th><th>รายการ</th><th>จำนวน</th><th>สถานะ</th><th>เวลา</th></tr></thead><tbody>${
    page.length?page.map(t=>`<tr><td><code class="hash">${t.h}</code></td><td><div style="font-weight:700;font-family:'Noto Sans Thai',sans-serif">${esc(txLabel(t.type))}</div><div style="font-size:10.5px;color:#98a2bf;margin-top:2px">${t.type}</div></td><td>${esc(t.item)}</td>
    <td style="font-weight:700;color:${t.amt.startsWith('+')?'#0f8a52':t.amt.startsWith('-')?'#c0392b':'#5e6b89'}">${t.amt}</td>
    <td><span class="tag ${t.st}">${t.st==='ok'?'Confirmed':t.st==='pend'?'Pending':'Dispute'}</span></td><td style="color:#7a86a8">${t.time}</td></tr>`).join('')
    :`<tr><td colspan="6" style="padding:0">${emptyBox(admView?'ไม่มีธุรกรรมประเภทนี้':'ยังไม่มีธุรกรรมของผู้พิพาท',admView?'ลองเลือกประเภทอื่น หรือกด “ทั้งหมด” เพื่อดูทุกรายการ':'เมื่อคุณวางเงินประกัน ลงรับเคส หรือตัดสินเคสจนได้คอมมิชชัน รายการจะมาแสดงที่นี่')}</td></tr>`
  }</tbody>`;
  $('#txTable').querySelectorAll('.hash').forEach(c=>{c.style.cursor='pointer';c.title=explorerBase()?'คลิกเพื่อเปิดใน Explorer':'คลิกเพื่อคัดลอก';
    c.onclick=()=>{const h=c.textContent;
      if(explorerBase()&&h.length===66){window.open(txLink(h),'_blank','noopener');return;}
      navigator.clipboard?.writeText(h);toast('ok','คัดลอก Tx Hash แล้ว',h);}});
}

/* ---------- dispute ---------- */
function renderDispute(){
  if(!$('#dKpis'))return;
  const _m=myArb(), _sus=_m&&!okStake(_m);
  $('#dBanner').innerHTML=roleBanner()+(_sus?`<div class="notice" style="margin:-10px 0 18px;background:#fff4f4;border-color:#ffd4d4;color:#c0392b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div><b>คุณถูกพักสิทธิ์ตัดสิน</b> — เงินประกันเหลือ ${_m?_m.stake.toFixed(2):'0.00'} ETH ต่ำกว่าขั้นต่ำ ${admin.minStake.toFixed(2)} ETH ที่ระบบกำหนด เติมเงินประกันในการ์ดด้านล่างก่อนจึงจะกดตัดสินได้</div></div>`:'');
  const open=disputes.filter(d=>d.st==='open').length;
  const _adm=state.role==='admin';
  const _act2=admin.arbs.filter(okStake).length;
  const _unclaimed=disputes.filter(d=>d.st==='open'&&!d.arb).length;
  const _usr=state.role==='user';
  const _myD=disputes.filter(involvesMe);
  const _myOpen=_myD.filter(d=>d.st==='open').length;
  const _myVal=_myD.filter(d=>d.st==='open').reduce((n,d)=>n+(parseFloat(d.amt)||0),0);
  $('#dKpis').innerHTML=(_usr?[
    ['ข้อพิพาทของฉัน',_myD.length,'สัญญาที่คุณเป็นคู่กรณี'],
    ['กำลังพิจารณา',_myOpen,_myOpen?'รอผู้พิพาทตัดสิน':'ไม่มีเคสค้างอยู่'],
    ['ปิดแล้ว',_myD.filter(d=>d.st==='closed').length,'ตัดสินเสร็จสิ้น'],
    ['มูลค่าที่พิพาทอยู่',_myVal.toFixed(2)+' ETH','จะปลดล็อกเมื่อตัดสินเสร็จ']
  ]:_adm?[
    ['ผู้พิพาทในระบบ',_act2+' / '+admin.arbs.length,'ใช้งานได้ / ทั้งหมด'],
    ['เคสไร้ผู้รับผิดชอบ',_unclaimed,_unclaimed?'ยังไม่มีผู้พิพาทลงรับ':'ทุกเคสมีคนดูแลแล้ว'],
    ['ปิดแล้ววันนี้',closedToday(),'จากทั้งหมด '+disputes.filter(d=>d.st==='closed').length+' เคสที่ปิดแล้ว'],
    ['คอมมิชชันจ่ายออก',admin.rewardPaid.toFixed(3)+' ETH','รวมทุกคน · ครั้งละ '+admin.reward.toFixed(3)+' ETH']
  ]:[
    ['ข้อพิพาทเปิดอยู่',open,'รอการตัดสิน'],
    ['ปิดแล้ววันนี้',closedToday(),'จากทั้งหมด '+disputes.filter(d=>d.st==='closed').length+' เคสที่ปิดแล้ว'],
    ['ปิดเคสของฉัน',_m?_m.cases:0,_m?'เคสที่คุณตัดสินเสร็จแล้ว':'ยังไม่ได้เป็นผู้พิพาท'],
    ['ค่าคอมมิชชันทั้งหมด',(_m?(_m.earned||0):0).toFixed(3)+' ETH',_m?('ค่าตอบแทนสะสม · ครั้งละ '+admin.reward.toFixed(3)+' ETH'):'สมัครเป็นผู้พิพาทเพื่อเริ่มรับค่าตอบแทน']
  ]).map(k=>`<div class="kpi"><div class="k-lbl">${k[0]}</div><div class="k-val">${k[1]}</div><div class="k-sub">${k[2]}</div></div>`).join('');
  renderArbOverview(_adm);
  renderArbPanel();
  const _act=canJudge(), pool=openPool(), mine=myCases();
  const nb=$('#navDisputeBadge');
  const claimable=pool.filter(d=>!isParty(d));
  if(nb){nb.textContent=claimable.length;nb.classList.toggle('on',_act&&claimable.length>0);}

  $('#poolPanel').style.display=_act?'':'none';
  $('#poolCount').textContent=pool.length+' เคส';
  $('#poolWrap').innerHTML=pool.length?pool.map(d=>`
    <div class="case-row">
      <div class="case-ic">${caseIcon()}</div>
      <div style="flex:1;min-width:230px">
        <div class="case-t">${d.id} · ${esc(d.item)} <span class="tag pend" style="margin-left:5px">${esc(d.type||'ข้อพิพาท')}</span></div>
        <div class="case-s">${esc(d.reason)}</div>
        <div class="case-m"><span>ผู้ยื่น: ${esc(d.by)}</span><span>วันที่: ${esc(d.date)}</span><span>มูลค่า: ${esc(d.amt)}</span><span style="color:#0f8a52;font-weight:700">ค่าตอบแทน +${admin.reward.toFixed(3)} ETH</span></div>
      </div>
      <div class="case-act">
        <button class="tbtn g" onclick="openCaseDetail('${d.id}')">ดูรายละเอียด</button>
        ${isParty(d)?`<span class="conflict-pill">🔒 คุณเป็นคู่กรณี</span>`:`<button class="tbtn p" onclick="claimCase('${d.id}')">⚖ ลงรับเคสนี้</button>`}
      </div>
    </div>`).join(''):emptyBox('ไม่มีเคสใหม่รอลงรับ','เคสที่ผู้เช่าเปิดเข้ามาใหม่จะเด้งขึ้นที่นี่ทันที');

  $('#minePanel').style.display=(myArb()&&mine.length)?'':'none';
  $('#mineCount').textContent=mine.length+' เคส';
  $('#mineWrap').innerHTML=mine.map(d=>`
    <div class="case-row">
      <div class="case-ic mine">${caseIcon()}</div>
      <div style="flex:1;min-width:230px">
        <div class="case-t">${d.id} · ${esc(d.item)} <span class="tag info" style="margin-left:5px">คุณเป็นผู้พิพาท</span></div>
        <div class="case-s">${esc(d.reason)}</div>
        <div class="case-m"><span>ผู้ยื่น: ${esc(d.by)}</span><span>คู่กรณี: ${esc(d.against||'—')}</span><span>มูลค่า: ${esc(d.amt)}</span></div>
        <div class="arb-bar">
          <button class="tbtn p" onclick="judge('${d.id}','borrower')">⚖ ตัดสินให้ผู้เช่า</button>
          <button class="tbtn p" onclick="judge('${d.id}','lender')">⚖ ตัดสินให้ผู้ปล่อยเช่า</button>
          <button class="tbtn g" onclick="openCaseDetail('${d.id}')">ดูรายละเอียด</button>
        </div>
      </div>
    </div>`).join('');

  /* User เห็นเฉพาะข้อพิพาทที่ตัวเองเป็นคู่กรณี · บทบาทอื่นเห็นทั้งระบบเหมือนเดิม */
  const _scope=_usr?_myD:disputes;
  /* Admin ไม่ได้เป็นคู่สัญญาหรือผู้พิพาทของเคสไหน จึงไม่มีชิป "เคสของฉัน" */
  const _keys=_usr?['all','open','closed']:_adm?['all','open','wait','closed']:DFILTERS.map(f=>f.k);
  if(!_keys.includes(state.dFilter))state.dFilter='all';
  const df=DFILTERS.find(f=>f.k===state.dFilter)||DFILTERS[0];
  $('#dListTitle').textContent=_usr?'ข้อพิพาทของฉัน':'รายการข้อพิพาททั้งหมด';
  $('#dListScope').textContent=_usr?'เฉพาะสัญญาที่คุณเกี่ยวข้อง':'สาธารณะบนเชน';
  const fbar=$('#dFilterBar');
  if(fbar)fbar.innerHTML=_keys.map(k=>{const f=DFILTERS.find(x=>x.k===k);
    return `<button class="fchip ${f.k===df.k?'active':''}" onclick="setDFilter('${f.k}')">${f.label}<i>${_scope.filter(f.fn).length}</i></button>`}).join('');
  const dlist=_scope.filter(df.fn);
  $('#disputeWrap').innerHTML=dlist.length?dlist.map(d=>`
    <div class="dispute-card">
      <div class="d-ico ${d.st==='closed'?'ok':''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d.st==='closed'?'<path d="m5 13 4 4L19 7"/>':'<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>'}</svg>
      </div>
      <div style="flex:1">
        <div class="d-t">${d.id} · ${esc(d.item)} <span class="tag ${d.st==='open'?'pend':'ok'}" style="margin-left:6px">${d.st==='open'?'กำลังพิจารณา':'ปิดเคสแล้ว'}</span>${involvesMe(d)?`<span class="tag me" style="margin-left:5px">${eqAddr(d.arb,curAddr())?'คุณเป็นผู้พิพาท':eqAddr(d.by,curAddr())?'คุณเป็นผู้ยื่น':'คุณเป็นคู่กรณี'}</span>`:''}</div>
        <div class="d-s">${esc(d.reason)}</div>
        <div class="d-meta"><span>ผู้ยื่น: ${esc(d.by)}</span><span>วันที่: ${esc(d.date)}</span><span>มูลค่าที่พิพาท: ${esc(d.amt)}</span>${d.verdict?`<span style="color:#0f8a52;font-weight:700">ผลตัดสิน: ${esc(d.verdict)}</span>`:''}</div>
      </div>
      <div class="case-act">
        ${d.arb?`<span class="claimed">⚖ ${esc(d.arbName)}</span>`:(d.st==='open'?`<span class="claimed" style="background:#fff3e2;color:#a9690b">รอผู้พิพาทลงรับ</span>`:'')}
        <button class="tbtn g" onclick="openCaseDetail('${d.id}')">ดูรายละเอียด</button>
      </div>
    </div>`).join(''):emptyBox(
      (_usr&&df.k==='all')?'คุณยังไม่มีข้อพิพาท':df.empty[0],
      (_usr&&df.k==='all')?'ถ้าสัญญาไหนมีปัญหา กด “เปิดข้อพิพาทใหม่” เพื่อยื่นเรื่อง':df.empty[1]);
}

/* ---------- ภาพรวมผู้พิพาท (มุมมอง Admin) ---------- */
function renderArbOverview(show){
  const p=$('#ovPanel'); if(!p)return;
  p.style.display=show?'':'none';
  if(!show)return;
  const totalCases=admin.arbs.reduce((n,a)=>n+(a.cases||0),0)||1;
  $('#ovCount').textContent=admin.arbs.length+' คน';
  $('#ovWrap').innerHTML=admin.arbs.length?[...admin.arbs]
    .sort((a,b)=>(b.cases||0)-(a.cases||0))
    .map((a,i)=>{
      const ok=okStake(a), share=Math.round((a.cases||0)/totalCases*100);
      const held=disputes.filter(d=>d.st==='open'&&eqAddr(d.arb,a.addr)).length;
      const mine=disputes.filter(d=>d.st==='closed'&&eqAddr(d.arb,a.addr)&&d.outcome);
      const nR=mine.filter(d=>d.outcome==='borrower').length, nL=mine.filter(d=>d.outcome==='lender').length, nT=nR+nL;
      const lowRep=(a.rep||100)<85, skew=nT>=4&&(nR/nT>=0.85||nL/nT>=0.85);
      return `<div class="ov-card ${ok?'':'sus'}">
        <div class="arb-ava" style="${ok?'':'filter:grayscale(1);opacity:.6'}">${esc(a.name.trim().charAt(0))}</div>
        <div style="flex:1;min-width:250px">
          <div class="ov-head">
            <span class="ov-nm">${esc(a.name)}</span>
            <span class="tag ${ok?'ok':'bad'}">${ok?'ACTIVE':'SUSPENDED'}</span>
            <span class="claimed">อันดับ ${i+1}</span>
          </div>
          <div class="ov-sub">${esc(a.addr)} · เครดิต ${a.rep||100}/100 · เงินประกัน <b style="color:${ok?'#0f8a52':'#c0392b'}">${a.stake.toFixed(2)}</b> / ${admin.minStake.toFixed(2)} ETH</div>
          <div class="stake-bar ${ok?'':'low'}" style="max-width:100%"><i style="width:${Math.min(100,a.stake/Math.max(admin.minStake,0.01)*100)}%"></i></div>
          <div class="ov-stats">
            <div class="ov-s"><div class="sl">ปิดเคสไปแล้ว</div><div class="sv">${a.cases||0}</div></div>
            <div class="ov-s"><div class="sl">คอมมิชชันที่ได้</div><div class="sv" style="color:#0f8a52">${(a.earned||0).toFixed(3)}</div></div>
            <div class="ov-s"><div class="sl">ถืออยู่ตอนนี้</div><div class="sv" style="color:${held?'#a9690b':'var(--ink)'}">${held}</div></div>
            <div class="ov-s"><div class="sl">ส่วนแบ่งงาน</div><div class="sv">${share}%</div></div>
          </div>
          <div class="ov-load">
            <div class="ll">สัดส่วนเคสที่รับผิดชอบเทียบทั้งระบบ<b>${a.cases||0} / ${totalCases} เคส</b></div>
            <div class="lb"><i style="width:${share}%"></i></div>
          </div>
          ${nT?`<div class="ov-load"><div class="ll">แนวโน้มคำตัดสิน · ผู้เช่า ${Math.round(nR/nT*100)}% · ผู้ปล่อยเช่า ${Math.round(nL/nT*100)}%<b>${nT} เคสที่วัดได้</b></div>
            <div class="ov-bias"><div class="br" style="width:${nR/nT*100}%"></div><div class="bl" style="width:${nL/nT*100}%"></div></div></div>`:''}
          ${(!ok||lowRep||skew)?`<div class="ov-flag">⚠ ${!ok?'เงินประกันต่ำกว่าเกณฑ์ · รับเคสใหม่ไม่ได้':lowRep?'เครดิตต่ำกว่า 85 · ควรตรวจสอบคำตัดสินย้อนหลัง':'คำตัดสินเอนไปทางฝ่ายเดียวเกิน 85%'}</div>`:''}
        </div>
        <div class="case-act" style="align-self:center">
          <button class="tbtn g" onclick="go('admin')">จัดการใน Admin</button>
        </div>
      </div>`}).join('')
    :emptyBox('ยังไม่มีผู้พิพาทในระบบ','รอผู้ใช้สมัครเข้ามาและอนุมัติที่หน้า Admin');
}

/* ---------- wallet ---------- */
/* ================= สัญญาบนเชน ================= */
/* ที่อยู่สัญญา RentalEscrow ที่ deploy แล้ว */
const CONTRACT_ADDRESS='0x01a93f394e462367b7d400Ed554148C805dc4F5b';
const EXPLORER={'0x1':'https://etherscan.io','0xaa36a7':'https://sepolia.etherscan.io','0x5':'https://goerli.etherscan.io',
 '0x89':'https://polygonscan.com','0x13882':'https://amoy.polygonscan.com','0x38':'https://bscscan.com',
 '0xa4b1':'https://arbiscan.io','0xa':'https://optimistic.etherscan.io','0x2105':'https://basescan.org'};
const explorerBase=()=>EXPLORER[state.chainId]||'';
const addrLink=a=>explorerBase()?explorerBase()+'/address/'+a:'';
const txLink=h=>explorerBase()?explorerBase()+'/tx/'+h:'';

/* เฉพาะฟังก์ชันที่หน้าเว็บเรียกใช้จริง ไม่ต้องใส่ ABI ทั้งก้อน */
const ESCROW_ABI=[
 'function owner() view returns (address)',
 'function paused() view returns (bool)',
 'function applicationsOpen() view returns (bool)',
 'function feeBps() view returns (uint16)',
 'function minStake() view returns (uint256)',
 'function arbReward() view returns (uint256)',
 'function treasury() view returns (uint256)',
 'function withdrawTreasury(address to, uint256 amount)',
 'function rewardPaid() view returns (uint256)',
 'function itemCount() view returns (uint256)',
 'function disputeCount() view returns (uint256)',
 'function arbitratorCount() view returns (uint256)',
 'function categoryCount() view returns (uint256)',
 'function applicationCount() view returns (uint256)',
 'function exitRequestCount() view returns (uint256)',
 'function pendingWithdrawal(address) view returns (uint256)',
 'function isActiveArbitrator(address) view returns (bool)',
 'function withdraw()',
 // รายชื่อผู้พิพาทและสถิติรายคน
 'function arbitrators(uint256) view returns (address)',
 'function stakeOf(address) view returns (uint256)',
 'function casesClosed(address) view returns (uint256)',
 'function earnedOf(address) view returns (uint256)',
 'function repOf(address) view returns (uint16)',
 'function isArbitrator(address) view returns (bool)',
 'function applications(uint256) view returns (address applicant, uint128 stake, uint64 at, string profileURI, bool open)',
 'function exitRequests(uint256) view returns (address arbitrator, uint64 at, uint8 reason, bool open)',
 // วงจรผู้พิพาท — เขียนลงเชนจริง
 'function applyArbitrator(string profileURI) payable',
 'function approveApplication(uint256 appId)',
 'function rejectApplication(uint256 appId)',
 'function topUpStake() payable',
 'function requestExit(uint8 reason)',
 'function cancelExit()',
 'function approveExit(uint256 exitId)',
 'function rejectExit(uint256 exitId)',
 'function slashStake(address arb, uint256 amount, uint8 reason)',
 'function revokeArbitrator(address arb)',
 // เหตุการณ์ที่ใช้สร้างประวัติธุรกรรมย้อนหลัง
 'event ApplicationSubmitted(uint256 indexed appId, address indexed applicant, uint256 stake)',
 'event ApplicationApproved(uint256 indexed appId, address indexed arbitrator)',
 'event ApplicationRejected(uint256 indexed appId, address indexed applicant, uint256 refunded)',
 'event StakeAdded(address indexed arbitrator, uint256 amount, uint256 total)',
 'event StakeSlashed(address indexed arbitrator, uint256 amount, uint256 remaining, uint8 reason)',
 'event ExitRequested(uint256 indexed exitId, address indexed arbitrator, uint8 reason)',
 'event ExitApproved(uint256 indexed exitId, address indexed arbitrator, uint256 stakeReturned)',
 'event ArbitratorRevoked(address indexed arbitrator, uint256 stakeReturned, uint256 casesReleased)',
 'event RewardPaid(address indexed arbitrator, uint256 indexed disputeId, uint256 amount)',
 'event Withdrawn(address indexed to, uint256 amount)',
 // หมวดหมู่ · สิ่งของ · สัญญาเช่า · ข้อพิพาท
 'function items(uint256) view returns (address lender, bytes32 categoryId, uint128 pricePerDay, uint128 deposit, uint128 bond, uint32 maxDays, bool allowRent, uint8 status, string metaURI)',
 'function rentals(uint256) view returns (uint256 itemId, address renter, address lender, uint128 rent, uint128 deposit, uint128 bond, uint128 fee, uint64 startAt, uint64 dueAt, uint64 returnedAt, uint8 status)',
 'function disputes(uint256) view returns (uint256 rentalId, address opener, address renter, address lender, address arbitrator, uint64 openedAt, uint64 claimedAt, uint64 closedAt, uint8 outcome, uint128 cut, uint8 problemType, string reasonURI, bool resolved)',
 'function activeRentalOf(uint256) view returns (uint256)',
 'function cutCap(uint256 disputeId, uint8 outcome) view returns (uint256)',
 'function listItem(bytes32 categoryId, uint128 pricePerDay, uint32 maxDays, uint128 deposit, uint128 bond, bool allowRent, string metaURI) payable returns (uint256)',
 'function setAvailability(uint256 itemId, bool allowRent)',
 'function delistItem(uint256 itemId)',
 'function borrow(uint256 itemId, uint32 daysCount) payable returns (uint256)',
 'function returnItem(uint256 rentalId)',
 'function acceptReturn(uint256 rentalId)',
 'function claimAfterInspectWindow(uint256 rentalId)',
 'function openDispute(uint256 rentalId, uint8 problemType, string reasonURI) returns (uint256)',
 'function claimCase(uint256 disputeId)',
 'function judge(uint256 disputeId, uint8 outcome, uint128 cut)',
 'function addCategory(string name)',
 'function removeCategory(bytes32 id)',
 'function setFeeBps(uint16 bps)',
 'function setMinStake(uint256 v)',
 'function setArbReward(uint256 v)',
 'function setApplicationsOpen(bool v)',
 'function setPaused(bool v)',
 'event CategoryAdded(bytes32 indexed id, string name)',
 'event CategoryRemoved(bytes32 indexed id)',
 'event ItemListed(uint256 indexed itemId, address indexed lender, bytes32 indexed category, uint256 pricePerDay, uint256 deposit, uint256 bond)',
 'event Borrowed(uint256 indexed rentalId, uint256 indexed itemId, address indexed renter, uint256 rent, uint256 deposit, uint256 dueAt)',
 'event Returned(uint256 indexed rentalId, address indexed renter, uint256 at)',
 'event ReturnAccepted(uint256 indexed rentalId, address indexed lender, uint256 toRenter, uint256 toLender, uint256 fee)',
 'event AutoReleased(uint256 indexed rentalId, uint256 toRenter, uint256 toLender, uint256 fee)',
 'event DisputeOpened(uint256 indexed disputeId, uint256 indexed rentalId, address indexed opener, uint8 problemType, string reasonURI)',
 'event CaseClaimed(uint256 indexed disputeId, address indexed arbitrator, uint256 at)',
 'event Judged(uint256 indexed disputeId, address indexed arbitrator, uint8 outcome, uint256 cut, uint256 toRenter, uint256 toLender, uint256 fee)',
 // การตั้งค่าสัญญาโดย Admin · สถานะสิ่งของ · เคสที่ถูกปล่อยกลับคิว
 'event FeeChanged(uint16 oldBps, uint16 newBps)',
 'event MinStakeChanged(uint256 oldValue, uint256 newValue)',
 'event RewardChanged(uint256 oldValue, uint256 newValue)',
 'event ApplicationsOpenChanged(bool open)',
 'event PausedChanged(bool paused)',
 'event TreasuryWithdrawn(address indexed to, uint256 amount)',
 'event ItemAvailabilityChanged(uint256 indexed itemId, bool allowRent)',
 'event ItemDelisted(uint256 indexed itemId, uint256 bondReturned)',
 'event CaseReleased(uint256 indexed disputeId, address indexed formerArbitrator, string why)',
 'event ExitCancelled(uint256 indexed exitId, address indexed arbitrator)',
 'event ExitRejected(uint256 indexed exitId, address indexed arbitrator)'
];
/* ประเภทปัญหา เก็บเป็นรหัสบนเชน ลำดับตรงกับดรอปดาวน์ในฟอร์ม */
const DTYPES=['สินค้าไม่ตรงตามรายละเอียด','สินค้าชำรุด/เสียหาย','คืนของล่าช้ากว่ากำหนด','ไม่ได้รับเงินมัดจำคืน','อื่น ๆ'];
const IST=['available','borrowed','inspect','closed'];
const CAT_HUE={electronics:205,sports:100,lifestyle:285,books:262,tools:18};
const packMeta=(n,d)=>JSON.stringify({n,d});
function unpackMeta(u){try{const o=JSON.parse(u);return{n:o.n||'ไม่มีชื่อ',d:o.d||''};}catch(e){return{n:u||'ไม่มีชื่อ',d:''};}}
const E=v=>Number(ethers.formatEther(v));
/* เหตุผลการขอถอนตัว เก็บเป็นรหัสตัวเลขบนเชน แปลงเป็นข้อความฝั่งหน้าเว็บ */
const EXIT_REASONS=['ไม่มีเวลาพิจารณาเคสแล้ว','ต้องการถอนเงินประกันไปใช้','ย้ายไปทำบทบาทอื่นในระบบ','อื่น ๆ'];
const SLASH_REASONS=['ตัดสินไม่เป็นธรรม / เข้าข้างฝ่ายใดฝ่ายหนึ่ง','ไม่ตอบสนองเกิน 72 ชั่วโมง','มีหลักฐานการรับสินบน','ตัดสินโดยไม่ตรวจหลักฐาน','อื่น ๆ'];
/* โหมดเชน: วงจรผู้พิพาททำงานบนสัญญาจริง ไม่ใช่ข้อมูลจำลอง */
const onChain=()=>chainInfo.linked;
let chainInfo={linked:false,err:'',data:null};
/* address จำลองตั้งต้นของแต่ละบทบาท ไว้คืนค่าเมื่อตัดการเชื่อมต่อ */
const DEF_ADDR={user:ROLES.user.addr,arbitrator:ROLES.arbitrator.addr,admin:ROLES.admin.addr};

/**
 * บทบาทจริงตัดสินจากสัญญา ไม่ใช่จากปุ่มสลับ
 *   owner() ของสัญญา        → Admin   (คนที่ deploy)
 *   isActiveArbitrator(เรา) → Arbitrator
 *   นอกนั้นทั้งหมด            → User
 */
function chainRole(){
  const d=chainInfo.data;
  if(!chainInfo.linked||!d)return null;
  if(d.isOwner)return 'admin';
  if(d.isArb)return 'arbitrator';
  return 'user';
}
function applyChainRole(){
  const r=chainRole(); if(!r||!state.realAddr)return;
  /* ข้อมูลเดโมผูกกับ address จริงไว้ตอนเชื่อมกระเป๋า — ถ้าบทบาทจริงไม่ใช่ผู้ใช้ทั่วไป ให้ย้ายกลับ */
  if(r!=='user'&&ROLES.user.addr===state.realAddr)remapAddr(state.realAddr,DEF_ADDR.user);
  Object.keys(ROLES).forEach(k=>{if(k!==r&&ROLES[k].addr===state.realAddr)ROLES[k].addr=DEF_ADDR[k];});
  ROLES[r].addr=state.realAddr;
  setRole(r,true);
  renderRoleMenu();
  toast('info','กำหนดบทบาทจากสัญญาแล้ว · '+ROLES[r].en,
    r==='admin'?'กระเป๋านี้คือ owner() ของสัญญา — ได้สิทธิ์ Admin เต็ม'
    :r==='arbitrator'?'กระเป๋านี้เป็นผู้พิพาทที่ได้รับอนุมัติและเงินประกันผ่านเกณฑ์'
    :'กระเป๋าทั่วไปในระบบ — ลงของ ยืม และเปิดข้อพิพาทได้');
}

function escrow(runner){return new ethers.Contract(CONTRACT_ADDRESS,ESCROW_ABI,runner);}
async function escrowRead(){return escrow(new ethers.BrowserProvider(ethereum));}
async function escrowWrite(){return escrow(await new ethers.BrowserProvider(ethereum).getSigner());}

/** ส่งธุรกรรมแล้วรอยืนยัน พร้อมจัดการข้อความผิดพลาดให้อ่านรู้เรื่อง */
async function sendTx(label, fn){
  if(!onChain()){toast('err','ยังไม่ได้เชื่อมสัญญา','กด Connect Wallet แล้วกด “อ่านค่าจากเชน” ในหน้า Admin ก่อน');return false;}
  try{
    const tx=await fn(await escrowWrite());
    toast('info',label+' · ส่งธุรกรรมแล้ว','รอยืนยันบนเชน · '+tx.hash.slice(0,12)+'...');
    const rc=await tx.wait();
    await syncChain();
    toast('ok',label+'สำเร็จ','ยืนยันแล้วในบล็อก '+rc.blockNumber);
    return true;
  }catch(e){
    const m=(e&&(e.shortMessage||e.reason||e.message))||'';
    if(e&&(e.code===4001||e.code==='ACTION_REJECTED'))toast('info','ยกเลิกธุรกรรม','คุณกดปฏิเสธใน MetaMask');
    else toast('err',label+'ไม่สำเร็จ',ERRTH[m]||m||'ลองใหม่อีกครั้ง');
    return false;
  }
}
/* แปลรหัส require ในสัญญาเป็นภาษาไทย */
const ERRTH={
 'ADMIN_ONLY':'เฉพาะ Admin เท่านั้น','NOT_ARBITRATOR':'กระเป๋านี้ไม่ใช่ผู้พิพาท',
 'STAKE_TOO_LOW':'เงินประกันต่ำกว่าเกณฑ์ขั้นต่ำ','ALREADY_APPLIED':'คุณยื่นใบสมัครไปแล้ว',
 'ALREADY_ARBITRATOR':'กระเป๋านี้เป็นผู้พิพาทอยู่แล้ว','ADMIN_CANNOT_APPLY':'Admin สมัครเป็นผู้พิพาทไม่ได้ (แยกอำนาจ)',
 'APPLICATIONS_CLOSED':'ขณะนี้ปิดรับสมัครผู้พิพาท','HAS_OPEN_CASES':'ยังถือเคสค้างอยู่ ต้องตัดสินให้เสร็จก่อน',
 'ALREADY_REQUESTED':'คุณยื่นคำขอถอนตัวไปแล้ว','NO_REQUEST':'ไม่พบคำขอถอนตัว',
 'CLOSED':'รายการนี้ถูกปิดไปแล้ว','PAUSED':'สัญญาถูกหยุดชั่วคราวโดย Admin',
 'CONFLICT_OF_INTEREST':'คุณเป็นคู่กรณีของเคสนี้','NOT_YOUR_CASE':'ไม่ใช่เคสที่คุณรับผิดชอบ',
 'EXIT_PENDING':'คุณยื่นขอถอนตัวไว้ ลงรับเคสใหม่ไม่ได้','NOTHING_TO_WITHDRAW':'ไม่มียอดค้างให้ถอน',
 'BAD_AMOUNT':'จำนวนเงินไม่ถูกต้อง'
};

async function readContract(){
  chainInfo={linked:false,err:'',data:null};
  if(!hasEth()){chainInfo.err='ไม่พบ MetaMask ในเบราว์เซอร์นี้';return;}
  if(!state.realAddr){chainInfo.err='ยังไม่ได้เชื่อมกระเป๋า — กด Connect Wallet ก่อน';return;}
  if(typeof ethers==='undefined'){chainInfo.err='โหลดไลบรารี ethers ไม่สำเร็จ (ตรวจอินเทอร์เน็ต)';return;}
  try{
    const code=await ethereum.request({method:'eth_getCode',params:[CONTRACT_ADDRESS,'latest']});
    if(!code||code==='0x'){chainInfo.err='ไม่พบสัญญาที่อยู่นี้บนเครือข่าย '+(state.chainName||'ปัจจุบัน')+' · สลับเครือข่ายใน MetaMask ให้ตรงกับตอน deploy';return;}
    const prov=new ethers.BrowserProvider(ethereum);
    const c=new ethers.Contract(CONTRACT_ADDRESS,ESCROW_ABI,prov);
    const [own,pz,apOpen,fee,ms,rw,tr,rp,ic,dc,ac,cc,apc,exc,pend,isArb]=await Promise.all([
      c.owner(),c.paused(),c.applicationsOpen(),c.feeBps(),c.minStake(),c.arbReward(),
      c.treasury(),c.rewardPaid(),c.itemCount(),c.disputeCount(),c.arbitratorCount(),
      c.categoryCount(),c.applicationCount(),c.exitRequestCount(),
      c.pendingWithdrawal(state.realAddr),c.isActiveArbitrator(state.realAddr)
    ]);
    const eth=v=>Number(ethers.formatEther(v));
    chainInfo={linked:true,err:'',data:{
      owner:own,paused:pz,applicationsOpen:apOpen,feeBps:Number(fee),
      minStake:eth(ms),arbReward:eth(rw),treasury:eth(tr),rewardPaid:eth(rp),
      items:Number(ic),disputes:Number(dc),arbs:Number(ac),cats:Number(cc),
      apps:Number(apc),exits:Number(exc),pending:eth(pend),isArb,
      isOwner:own.toLowerCase()===state.realAddr.toLowerCase()
    }};
  }catch(e){chainInfo.err=(e&&e.shortMessage)||(e&&e.message)||'อ่านข้อมูลจากสัญญาไม่สำเร็จ';}
}
/**
 * ดึงสถานะวงจรผู้พิพาทกลับจากสัญญา — รายชื่อ เงินประกัน สถิติ ใบสมัคร คำขอถอนตัว
 * เปิดแอปใหม่เมื่อไหร่ก็ได้ของเดิมกลับมาครบ เพราะทุกอย่างอยู่บนเชน ไม่ได้อยู่ในหน่วยความจำ
 */
async function loadArbitratorsFromChain(){
  const c=await escrowRead(), d=chainInfo.data;
  const names={};   // address -> ชื่อที่กรอกตอนสมัคร (เก็บไว้ใน profileURI)
  // ใบสมัครทั้งหมด ทั้งที่ยังเปิดและที่อนุมัติไปแล้ว ใช้ย้อนหาชื่อ
  const apps=[];
  for(let i=0;i<d.apps;i++){
    const a=await c.applications(i);
    const pm=unpackMeta(a.profileURI);
    const nm=(a.profileURI?pm.n:'')||shortAddr(a.applicant);
    names[a.applicant.toLowerCase()]=nm;
    if(a.open)apps.push({id:i,addr:a.applicant,name:nm,
      stake:Number(ethers.formatEther(a.stake)),
      exp:pm.d||'ผู้สมัครไม่ได้ระบุประสบการณ์เพิ่มเติม',
      at:Number(a[2])*1000,
      date:thDate(Number(a[2])*1000)});
  }
  const arbs=[];
  for(let i=0;i<d.arbs;i++){
    const ad=await c.arbitrators(i);
    const [st,cs,er,rp]=await Promise.all([c.stakeOf(ad),c.casesClosed(ad),c.earnedOf(ad),c.repOf(ad)]);
    arbs.push({addr:ad,name:names[ad.toLowerCase()]||shortAddr(ad),
      cases:Number(cs),stake:Number(ethers.formatEther(st)),
      earned:Number(ethers.formatEther(er)),rep:Number(rp)});
  }
  const exits=[];
  for(let i=0;i<d.exits;i++){
    const x=await c.exitRequests(i);
    if(!x.open)continue;
    const a=arbs.find(v=>v.addr.toLowerCase()===x.arbitrator.toLowerCase());
    exits.push({id:i,addr:x.arbitrator,name:(a&&a.name)||shortAddr(x.arbitrator),
      stake:(a&&a.stake)||0,cases:(a&&a.cases)||0,
      reason:EXIT_REASONS[Number(x.reason)]||'อื่น ๆ',date:thDate(Number(x[1])*1000)});
  }
  admin.arbs=arbs; admin.apps=apps; admin.exits=exits;
  admin.fee=d.feeBps/100; admin.minStake=d.minStake; admin.reward=d.arbReward;
  admin.openApply=d.applicationsOpen; admin.paused=d.paused; admin.rewardPaid=d.rewardPaid;
  // index ของ appId/exitId บนเชน ใช้ตอนกดอนุมัติ
  admin.apps.forEach((a,i)=>a.chainId=a.id);
  admin.exits.forEach((x,i)=>x.chainId=x.id);
}

/* ---------- ตัวอ่าน event log กลาง ----------
   ดึงทีเดียวต่อการซิงก์หนึ่งรอบ แล้วให้ทั้งหมวดหมู่และประวัติธุรกรรมใช้ชุดเดียวกัน
   ลองยิงทั้งเชนก่อน ถ้า RPC ปฏิเสธช่วงกว้างค่อยไล่ย้อนหลังทีละก้อน */
let CHAIN_LOGS=[], LOGS_PARTIAL=false;
/* ประวัติสัญญาเช่าที่ปิดแล้ว สร้างจาก event — ของที่ปิดไปแล้วไม่อยู่ใน items อีกต่อไป */
let RENT_HISTORY=[];
/* รายได้สะสมจริงต่อ address — คำนวณจาก event ตอนโหลดประวัติ ไม่ใช่ยอดในกระเป๋า */
let EARNED={};
async function loadLogsFromChain(){
  const c=await escrowRead();
  const prov=new ethers.BrowserProvider(ethereum);
  const head=await prov.getBlockNumber();
  const decode=raw=>raw.map(l=>{
    try{const d=c.interface.parseLog(l);
      return d?{name:d.name,args:d.args,transactionHash:l.transactionHash,blockNumber:l.blockNumber}:null;}
    catch(e){return null;}
  }).filter(Boolean);
  const base={address:CONTRACT_ADDRESS};
  LOGS_PARTIAL=false;
  try{
    CHAIN_LOGS=decode(await prov.getLogs({...base,fromBlock:0,toBlock:head}));
    return;
  }catch(e){ /* RPC สาธารณะมักจำกัดช่วงบล็อก — ไล่ย้อนหลังทีละก้อนแทน */ }
  const STEP=9000, CAP=120000;
  let out=[], floor=Math.max(0,head-CAP);
  for(let b=head;b>=floor;b-=STEP){
    const a=Math.max(floor,b-STEP+1);
    try{ out=decode(await prov.getLogs({...base,fromBlock:a,toBlock:b})).concat(out); }
    catch(e){ LOGS_PARTIAL=true; }
    if(a===floor)break;
  }
  if(floor>0)LOGS_PARTIAL=true;
  CHAIN_LOGS=out;
}
const logsOf=n=>CHAIN_LOGS.filter(l=>l.name===n);

/* แจ้งเตือนที่สร้างจาก event บนเชนของ address ที่เชื่อมอยู่
   จำเป็นเพราะการกระทำของ Admin (ถอดสิทธิ์ / อนุมัติ / ริบประกัน) เกิดคนละเครื่องกับผู้รับผล
   ต้องอ่านย้อนจากเชนเท่านั้นถึงจะเห็น */
let NOTIF_SEEN=new Set(), NOTIF_ADDR='';
const CHAIN_NOTIF={
  ArbitratorRevoked:[a=>a.arbitrator,'⛔','#fff4f4','คุณถูกถอดสิทธิ์ผู้พิพาท',
    a=>'Admin ถอดสิทธิ์ผู้พิพาทของกระเป๋านี้ · คืนเงินประกัน '+E(a.stakeReturned).toFixed(3)+' ETH และปล่อยเคสที่ถืออยู่ '+Number(a.casesReleased)+' เคสกลับคิว · เมนูผู้พิพาทถูกปิดแล้ว','tx'],
  ApplicationApproved:[a=>a.arbitrator,'✅','#f1fbf5','ใบสมัครผู้พิพาทได้รับอนุมัติ',
    ()=>'Admin อนุมัติแล้ว · กระเป๋านี้เป็นผู้พิพาทเต็มตัว ลงรับเคสได้ทันที','arb'],
  ApplicationRejected:[a=>a.applicant,'↩️','#fff8ec','ใบสมัครผู้พิพาทถูกปฏิเสธ',
    a=>'Admin ปฏิเสธใบสมัคร · คืนเงินประกัน '+E(a.refunded).toFixed(3)+' ETH เข้ายอดถอนแล้ว','tx'],
  StakeSlashed:[a=>a.arbitrator,'⚠️','#fff4f4','เงินประกันของคุณถูกริบ',
    a=>'ถูกริบ '+E(a.amount).toFixed(3)+' ETH · เหลือ '+E(a.remaining).toFixed(3)+' ETH · '+(SLASH_REASONS[Number(a.reason)]||''),'arb'],
  ExitApproved:[a=>a.arbitrator,'👋','#f1fbf5','อนุมัติให้ถอนตัวแล้ว',
    a=>'Admin อนุมัติคำขอถอนตัว · คืนเงินประกัน '+E(a.stakeReturned).toFixed(3)+' ETH · สิทธิ์ผู้พิพาทสิ้นสุดแล้ว','tx'],
  ExitRejected:[a=>a.arbitrator,'🚫','#fff8ec','คำขอถอนตัวถูกปฏิเสธ',
    ()=>'Admin ยังไม่อนุมัติให้ถอนตัว · คุณยังมีหน้าที่ตัดสินเคสตามปกติ','arb'],
  CaseReleased:[a=>a.formerArbitrator,'↩️','#fff8ec','เคสถูกดึงกลับคิว',
    a=>'เคส #'+a.disputeId+' ถูกปล่อยกลับคิวกลาง · '+(a.why||''),'dispute'],
  DisputeOpened:[null,'⚖️','#fff4f4','มีข้อพิพาทในสัญญาของคุณ',
    a=>'เปิดข้อพิพาท #'+a.disputeId+' กับสัญญาเช่า #'+a.rentalId+' · รอผู้พิพาทลงรับเคส','dispute']
};
function buildNotifsFromChain(partyOfRental){
  const me=(state.realAddr||'').toLowerCase();
  if(!me)return;
  /* สลับกระเป๋า = แจ้งเตือนของคนละคน ต้องสร้างใหม่ทั้งชุด */
  if(NOTIF_ADDR!==me){NOTIF_ADDR=me;NOTIF_SEEN=new Set();notifs=notifs.filter(n=>!n.block);}
  for(const lg of CHAIN_LOGS){
    const n=CHAIN_NOTIF[lg.name]; if(!n)continue;
    const [who,ic,bg,title,body,page]=n;
    const target=who?String(who(lg.args)||'').toLowerCase()
                   :(partyOfRental?partyOfRental(lg.args.rentalId):[]).map(x=>String(x).toLowerCase());
    const hit=who?target===me:target.includes(me);
    if(!hit)continue;
    const key=lg.transactionHash+':'+lg.name+':'+lg.blockNumber;
    if(NOTIF_SEEN.has(key))continue;
    NOTIF_SEEN.add(key);
    notifs.push({to:state.realAddr,ic,bg,t:title,b:body(lg.args),
      time:'บล็อก '+lg.blockNumber,un:true,go:page||'',block:lg.blockNumber});
  }
  notifs.sort((a,b)=>(b.block||0)-(a.block||0));
}
/* ชื่อหมวดจาก event CategoryAdded — ใช้ได้แม้หมวดนั้นถูกลบไปแล้ว ต่างจาก CHAIN_CATS ที่เก็บเฉพาะหมวดที่ยังอยู่ */
function catNameOf(hash){
  const l=logsOf('CategoryAdded').find(x=>String(x.args.id)===String(hash));
  if(!l)return '';
  const n=unpackCat(l.args.name);
  return n.th+(n.en!==n.th?' · '+n.en:'');
}

/** หมวดหมู่: ชื่อเก็บอยู่ใน event CategoryAdded เพราะบนสัญญาเก็บแค่ keccak hash */
async function loadCategoriesFromChain(){
  const added=logsOf('CategoryAdded');
  const removed=logsOf('CategoryRemoved');
  const gone=new Set(removed.map(l=>String(l.args.id)));
  const live=[];
  const seen=new Set();
  for(const l of added){
    const id=String(l.args.id);
    if(gone.has(id)||seen.has(id))continue;
    seen.add(id);
    const nm=unpackCat(l.args.name);
    live.push({id:catId(nm.en,nm.th),en:nm.en,th:nm.th,hash:id,ic:CAT_ICON});
  }
  CHAIN_CATS=live;
  CATS=[CATS[0]].concat(live.map(x=>({id:x.id,en:x.en,th:x.th,ic:x.ic}))).concat([CATS[CATS.length-1]]);
}
let CHAIN_CATS=[];
const catHash=id=>{const c=CHAIN_CATS.find(x=>x.id===id);return c?c.hash:null;};

/* ชื่อหมวดเก็บลงเชนเป็น "อังกฤษ|ไทย" เพื่อให้ชื่อไทยไม่หายตอนโหลดกลับมา
   ของเก่าที่ไม่มี | ยังอ่านได้ปกติ (ใช้ชื่อเดียวทั้งสองภาษา) */
const packCat=(en,th)=>en+'|'+th;
function unpackCat(raw){
  const s=String(raw||''), i=s.indexOf('|');
  if(i<0)return{en:s,th:s};
  const en=s.slice(0,i).trim(), th=s.slice(i+1).trim();
  return{en:en||th,th:th||en};
}
/* รหัสหมวดใช้ภายใน UI เท่านั้น — ถ้าชื่ออังกฤษไม่มีตัว a-z ให้สร้างจาก hash ของชื่อไทย
   จะได้รหัสเดิมทุกครั้งที่โหลดกลับมา */
function catId(en,th){
  const slug=String(en||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  if(slug)return slug;
  try{return 'c'+ethers.id(String(th||en||'')).slice(2,10);}
  catch(e){return 'c'+Math.abs(String(th||en||'').split('').reduce((a,ch)=>((a<<5)-a+ch.charCodeAt(0))|0,0)).toString(16);}
}

/** สิ่งของทั้งหมด + สัญญาเช่าที่ผูกอยู่ */
async function loadItemsFromChain(){
  const c=await escrowRead(), d=chainInfo.data, me=(state.realAddr||'').toLowerCase();
  const out=[];
  let bad=0, lastErr='';
  /* รวม id จากสองทาง: itemCount() บนสัญญา และ event ItemListed ในประวัติ
     ถ้าทางใดทางหนึ่งอ่านไม่ได้ อีกทางยังดึงของขึ้นมาได้ครบ */
  const ids=new Set();
  for(let i=0;i<(d.items||0);i++)ids.add(i);
  logsOf('ItemListed').forEach(l=>ids.add(Number(l.args.itemId)));
  for(const i of [...ids].sort((a,b)=>a-b)){
    try{
      const it=await c.items(i);
      if(Number(it.status)===3)continue;                 // Delisted
      const m=unpackMeta(it.metaURI);
      const cat=CHAIN_CATS.find(x=>String(x.hash)===String(it.categoryId));
      const o={id:i,name:m.n,desc:m.d,cat:cat?cat.id:'other',
        st:IST[Number(it.status)]||'available',
        days:Number(it.maxDays),price:E(it.pricePerDay),dep:E(it.deposit),bond:E(it.bond),
        pop:50,owner:it.lender,lender:it.lender,allowRent:it.allowRent,
        mine:String(it.lender).toLowerCase()===me,
        art:artGeneric(CAT_HUE[cat?cat.id:'']||205,'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>')};
      /* สัญญาเช่าที่ผูกอยู่เป็นข้อมูลเสริม อ่านไม่ได้ก็ยังต้องเห็นตัวสิ่งของ */
      try{
        const rid=Number(await c.activeRentalOf(i));
        if(rid>0){
          const r=await c.rentals(rid-1);
          o.rentalId=rid-1; o.borrower=r.renter;
          o.mineBorrow=String(r.renter).toLowerCase()===me;
          o.esc={rent:E(r.rent),dep:E(r.deposit),bond:E(r.bond),fee:E(r.fee)};
          if(Number(r.returnedAt)>0)o.returnedAt=Number(r.returnedAt)*1000;
        }
      }catch(e2){ console.warn('rental of item',i,e2); }
      out.push(o);
    }catch(e){ bad++; lastErr=(e&&(e.shortMessage||e.message))||''; console.warn('item',i,e); }
  }
  out.sort((a,b)=>a.id-b.id);
  items=out;
  if(bad)toast('err','อ่านสิ่งของไม่ได้ '+bad+' รายการ',lastErr||'ลองกด “อ่านค่าจากเชน” ในหน้า Admin อีกครั้ง');
}

/** ข้อพิพาททั้งหมด พร้อมเงินใน escrow และคำตัดสิน */
async function loadDisputesFromChain(){
  const c=await escrowRead(), d=chainInfo.data;
  const out=[];
  for(let i=0;i<d.disputes;i++){
    const x=await c.disputes(i);
    const r=await c.rentals(x.rentalId);
    const it=await c.items(r.itemId);
    const m=unpackMeta(it.metaURI);
    const arbName=(admin.arbs.find(a=>a.addr.toLowerCase()===x.arbitrator.toLowerCase())||{}).name;
    const o={id:'DSP-'+String(i).padStart(4,'0'),chainId:i,rentalId:Number(x.rentalId),
      item:m.n,reason:x.reasonURI,type:DTYPES[Number(x.problemType)]||'อื่น ๆ',
      st:x.resolved?'closed':'open',
      by:x.opener,renter:x.renter,lender:x.lender,
      against:x.opener.toLowerCase()===x.renter.toLowerCase()?x.lender:x.renter,
      date:thDate(Number(x.openedAt)*1000),
      amt:E(r.deposit).toFixed(2)+' ETH',
      esc:{rent:E(r.rent),dep:E(r.deposit),bond:E(r.bond),fee:E(r.fee)},
      arb:x.arbitrator===ethers.ZeroAddress?null:x.arbitrator,
      arbName:arbName||(x.arbitrator===ethers.ZeroAddress?null:shortAddr(x.arbitrator)),
      claimedAt:Number(x.claimedAt)?Number(x.claimedAt)*1000:undefined,
      closedAt:Number(x.closedAt)?Number(x.closedAt)*1000:undefined};
    if(x.resolved){
      o.outcome=Number(x.outcome)===1?'borrower':'lender';
      const cut=E(x.cut), T=o.esc.rent+o.esc.dep+o.esc.bond;
      let renter,lender;
      if(o.outcome==='borrower'){renter=o.esc.dep+cut;lender=o.esc.rent+o.esc.bond-cut;}
      else{renter=o.esc.dep-cut;lender=o.esc.rent+o.esc.bond+cut;}
      const plat=Math.min(o.esc.fee,Math.max(0,lender));
      o.payout={renter:+renter.toFixed(4),lender:+(lender-plat).toFixed(4),plat:+plat.toFixed(4),cut:+cut.toFixed(4),T:+T.toFixed(4)};
      o.verdict=verdictText(o.outcome,cut);
    }
    out.push(o);
  }
  out.reverse();
  disputes=out;
}

/** สร้างประวัติธุรกรรมย้อนหลังจาก event logs ของสัญญา */
async function loadHistoryFromChain(){
  const logs=CHAIN_LOGS;
  const MAP={
    ApplicationSubmitted:['ApplyArbitrator',a=>['ยื่นสมัครผู้พิพาท: '+shortAddr(a.applicant),'-'+Number(ethers.formatEther(a.stake)).toFixed(2)]],
    ApplicationApproved :['GrantRole',a=>['อนุมัติผู้พิพาท: '+shortAddr(a.arbitrator),'0.00']],
    ApplicationRejected :['Refund',a=>['คืนประกันใบสมัคร: '+shortAddr(a.applicant),'+'+Number(ethers.formatEther(a.refunded)).toFixed(2)]],
    StakeAdded          :['Stake',a=>['เติมเงินประกัน: '+shortAddr(a.arbitrator),'-'+Number(ethers.formatEther(a.amount)).toFixed(2)]],
    StakeSlashed        :['Slash',a=>['ริบประกัน: '+shortAddr(a.arbitrator)+' — '+(SLASH_REASONS[Number(a.reason)]||''),'-'+Number(ethers.formatEther(a.amount)).toFixed(2)]],
    ExitRequested       :['RequestExit',a=>['ขอถอนตัวจากผู้พิพาท: '+shortAddr(a.arbitrator),'0.00']],
    ExitApproved        :['Unstake',a=>['อนุมัติถอนตัว คืนประกัน: '+shortAddr(a.arbitrator),'+'+Number(ethers.formatEther(a.stakeReturned)).toFixed(2)]],
    ArbitratorRevoked   :['Unstake',a=>['ถอดสิทธิ์ผู้พิพาท: '+shortAddr(a.arbitrator),'+'+Number(ethers.formatEther(a.stakeReturned)).toFixed(2)]],
    RewardPaid          :['Reward',a=>['ค่าตอบแทนตัดสินเคส #'+a.disputeId,'+'+Number(ethers.formatEther(a.amount)).toFixed(3)]],
    Withdrawn           :['Refund',a=>['ถอนเงินออกจากสัญญา: '+shortAddr(a.to),'+'+Number(ethers.formatEther(a.amount)).toFixed(3)]],
    CategoryAdded       :['AddCategory',a=>{const n=unpackCat(a.name);return[n.th+(n.en!==n.th?' · '+n.en:''),'0.00'];}],
    CategoryRemoved     :['RemoveCategory',a=>{const n=catNameOf(a.id);return[n||'หมวดหมู่ '+String(a.id).slice(0,10)+'…','0.00'];}],
    FeeChanged          :['SetFee',a=>['ค่าธรรมเนียมระบบ '+(Number(a.oldBps)/100).toFixed(2)+'% → '+(Number(a.newBps)/100).toFixed(2)+'%','0.00']],
    MinStakeChanged     :['SetMinStake',a=>['เงินประกันขั้นต่ำ '+E(a.oldValue).toFixed(2)+' → '+E(a.newValue).toFixed(2)+' ETH','0.00']],
    RewardChanged       :['SetReward',a=>['ค่าตอบแทนต่อเคส '+E(a.oldValue).toFixed(3)+' → '+E(a.newValue).toFixed(3)+' ETH','0.00']],
    ApplicationsOpenChanged:['SetApplyOpen',a=>[a.open?'เปิดรับสมัครผู้พิพาท':'ปิดรับสมัครผู้พิพาท','0.00']],
    PausedChanged       :['SetPaused',a=>[a.paused?'หยุดสัญญาฉุกเฉิน · ระงับทุกธุรกรรมเงิน':'เปิดสัญญาให้ทำงานตามปกติ','0.00']],
    TreasuryWithdrawn   :['Treasury',a=>['ถอนรายได้ระบบไปที่ '+shortAddr(a.to),'+'+E(a.amount).toFixed(3)]],
    ItemAvailabilityChanged:['ItemStatus',a=>['สิ่งของ #'+a.itemId+' · '+(a.allowRent?'เปิดให้เช่า':'ปิดรับการเช่า'),'0.00']],
    ItemDelisted        :['Delist',a=>['ถอนสิ่งของ #'+a.itemId+' ออกจากระบบ','+'+E(a.bondReturned).toFixed(3)]],
    CaseReleased        :['ReleaseCase',a=>['ปล่อยเคส #'+a.disputeId+' กลับคิว · '+(a.why||''),'0.00']],
    ExitCancelled       :['CancelExit',a=>['ยกเลิกคำขอถอนตัว: '+shortAddr(a.arbitrator),'0.00']],
    ExitRejected        :['RejectExit',a=>['ปฏิเสธคำขอถอนตัว: '+shortAddr(a.arbitrator),'0.00']],
    ItemListed          :['List Item',a=>['ลงทะเบียนสิ่งของ #'+a.itemId,'-'+Number(ethers.formatEther(a.bond)).toFixed(3)]],
    Borrowed            :['Borrow',a=>['ทำสัญญาเช่า #'+a.rentalId+' · ของชิ้นที่ '+a.itemId,'-'+(Number(ethers.formatEther(a.rent))+Number(ethers.formatEther(a.deposit))).toFixed(3)]],
    Returned            :['Return',a=>['ส่งคืนของ · สัญญา #'+a.rentalId,'0.00']],
    ReturnAccepted      :['Lend',a=>['ปิดสัญญา #'+a.rentalId+' · ตรวจรับแล้ว','+'+Number(ethers.formatEther(a.toLender)).toFixed(3)]],
    AutoReleased        :['Refund',a=>['ปล่อยมัดจำอัตโนมัติ · สัญญา #'+a.rentalId,'+'+Number(ethers.formatEther(a.toRenter)).toFixed(3)]],
    DisputeOpened       :['Dispute',a=>['เปิดข้อพิพาท #'+a.disputeId+' · สัญญา '+a.rentalId,'0.00']],
    CaseClaimed         :['ClaimCase',a=>['ลงรับเคส #'+a.disputeId,'0.00']],
    Judged              :['Refund',a=>['ตัดสินเคส #'+a.disputeId+' · หัก '+Number(ethers.formatEther(a.cut)).toFixed(3)+' ETH','0.00']]
  };
  /* ---- รอบแรก: ไล่ log เพื่อรู้ว่าใครเป็นคู่สัญญาของแต่ละ rental / dispute ----
     เหตุการณ์บางตัว (เช่น AutoReleased, Judged) ไม่ได้แนบ address ของคู่สัญญามาด้วย
     จึงต้องย้อนไปหาจาก ItemListed → Borrowed → DisputeOpened */
  const L=a=>String(a||'').toLowerCase();
  const itemLender={}, rentalRenter={}, rentalItem={}, disputeRental={}, disputeArb={};
  for(const lg of logs){
    const a=lg.args;
    if(lg.name==='ItemListed')   itemLender[String(a.itemId)]=L(a.lender);
    if(lg.name==='Borrowed'){    rentalRenter[String(a.rentalId)]=L(a.renter); rentalItem[String(a.rentalId)]=String(a.itemId); }
    if(lg.name==='DisputeOpened')disputeRental[String(a.disputeId)]=String(a.rentalId);
    if(lg.name==='CaseClaimed')  disputeArb[String(a.disputeId)]=L(a.arbitrator);
  }
  const partyOfRental=r=>{const k=String(r);return [rentalRenter[k],itemLender[rentalItem[k]]].filter(Boolean);};
  const partyOfDispute=d=>{const k=String(d);return partyOfRental(disputeRental[k]||'').concat(disputeArb[k]?[disputeArb[k]]:[]);};
  const ADM=L(chainInfo.data&&chainInfo.data.owner);
  /* ใครเกี่ยวข้องกับธุรกรรมนี้บ้าง — ใช้กรองให้แต่ละ address เห็นเฉพาะของตัวเอง
     Admin มองเห็นทุกรายการอยู่แล้ว จึงไม่ต้องอยู่ในลิสต์นี้ ยกเว้นรายการที่ Admin เป็นคนทำเอง */
  const WHO={
    ApplicationSubmitted:a=>[L(a.applicant)],
    ApplicationApproved :a=>[L(a.arbitrator),ADM],
    ApplicationRejected :a=>[L(a.applicant),ADM],
    StakeAdded          :a=>[L(a.arbitrator)],
    StakeSlashed        :a=>[L(a.arbitrator),ADM],
    ExitRequested       :a=>[L(a.arbitrator)],
    ExitApproved        :a=>[L(a.arbitrator),ADM],
    ArbitratorRevoked   :a=>[L(a.arbitrator),ADM],
    RewardPaid          :a=>[L(a.arbitrator)],
    Withdrawn           :a=>[L(a.to)],
    CategoryAdded       :()=>[ADM],
    CategoryRemoved     :()=>[ADM],
    FeeChanged          :()=>[ADM],
    MinStakeChanged     :()=>[ADM],
    RewardChanged       :()=>[ADM],
    ApplicationsOpenChanged:()=>[ADM],
    PausedChanged       :()=>[ADM],
    TreasuryWithdrawn   :a=>[L(a.to),ADM],
    ItemAvailabilityChanged:a=>[itemLender[String(a.itemId)]],
    ItemDelisted        :a=>[itemLender[String(a.itemId)]],
    CaseReleased        :a=>[L(a.formerArbitrator),ADM].concat(partyOfDispute(a.disputeId)),
    ExitCancelled       :a=>[L(a.arbitrator)],
    ExitRejected        :a=>[L(a.arbitrator),ADM],
    ItemListed          :a=>[L(a.lender)],
    Borrowed            :a=>[L(a.renter),itemLender[String(a.itemId)]],
    Returned            :a=>[L(a.renter)].concat(partyOfRental(a.rentalId)),
    ReturnAccepted      :a=>[L(a.lender)].concat(partyOfRental(a.rentalId)),
    AutoReleased        :a=>partyOfRental(a.rentalId),
    DisputeOpened       :a=>[L(a.opener)].concat(partyOfRental(a.rentalId)),
    CaseClaimed         :a=>[L(a.arbitrator)].concat(partyOfDispute(a.disputeId)),
    Judged              :a=>[L(a.arbitrator)].concat(partyOfDispute(a.disputeId))
  };
  /* รายได้จริงของผู้ปล่อยเช่า — นับเฉพาะตอนที่สัญญาจ่ายเงินออกให้จริงแล้วเท่านั้น
     ปิดสัญญาปกติ (ReturnAccepted) · ปล่อยอัตโนมัติครบกำหนดตรวจ (AutoReleased) · คำตัดสินข้อพิพาท (Judged) */
  EARNED={};
  const credit=(who,v)=>{const k=L(who);if(!k||!v)return;EARNED[k]=(EARNED[k]||0)+E(v);};
  for(const lg of logs){
    const a=lg.args;
    if(lg.name==='ReturnAccepted')credit(a.lender,a.toLender);
    if(lg.name==='AutoReleased')  credit(itemLender[rentalItem[String(a.rentalId)]],a.toLender);
    if(lg.name==='Judged')        credit(itemLender[rentalItem[String(disputeRental[String(a.disputeId)]||'')]],a.toLender);
  }
  /* สัญญาที่ปิดจบแล้ว เก็บไว้แสดงเป็นประวัติใต้รายการของที่ปล่อยให้ยืม */
  RENT_HISTORY=[];
  const nameOfItem=id=>{const it=items.find(x=>x.id===Number(id));return it?it.name:'สิ่งของ #'+id;};
  const pushHist=(rid,how,cls,toRenter,toLender,lg)=>{
    const k=String(rid), iid=rentalItem[k];
    if(iid===undefined)return;
    RENT_HISTORY.push({rentalId:Number(rid),itemId:Number(iid),itemName:nameOfItem(iid),
      renter:rentalRenter[k]||'',lender:itemLender[iid]||'',
      how,cls,toRenter:E(toRenter),toLender:E(toLender),
      block:lg.blockNumber,hash:lg.transactionHash});
  };
  for(const lg of logs){
    const a=lg.args;
    if(lg.name==='ReturnAccepted')pushHist(a.rentalId,'ตรวจรับปกติ','ok',a.toRenter,a.toLender,lg);
    if(lg.name==='AutoReleased')  pushHist(a.rentalId,'ปล่อยอัตโนมัติ','info',a.toRenter,a.toLender,lg);
    if(lg.name==='Judged'){
      const rid=disputeRental[String(a.disputeId)];
      if(rid!==undefined)pushHist(rid,'ผ่านคำตัดสินข้อพิพาท','pend',a.toRenter,a.toLender,lg);
    }
  }
  RENT_HISTORY.sort((x,y)=>y.block-x.block);
  const out=[];
  for(const lg of logs){
    const m=MAP[lg.name];
    if(!m)continue;
    const [item,amt]=m[1](lg.args);
    const w=WHO[lg.name]?WHO[lg.name](lg.args):[];
    out.push({h:lg.transactionHash,type:m[0],item,amt:amt+' ETH',st:'ok',
      time:'บล็อก '+lg.blockNumber,onchain:true,who:[...new Set(w.filter(Boolean))]});
  }
  out.reverse();
  // เก็บเฉพาะธุรกรรมจริงจากเชน ไม่ปนกับของจำลอง
  txs=out;
  /* สร้างแจ้งเตือนของ address นี้จาก event เดียวกัน — ใช้ตารางคู่สัญญาที่เพิ่งสร้างไว้ */
  try{ buildNotifsFromChain(partyOfRental); }catch(e){ console.warn('notif',e); }
}

/** ซิงก์ทุกอย่างจากเชนแล้ววาดหน้าใหม่ */
async function syncChain(){
  await readContract();
  if(!onChain()){renderChainPanel();return;}
  try{ await loadLogsFromChain(); }catch(e){ console.warn('log sync',e); toast('err','อ่าน event log ไม่สำเร็จ',(e&&(e.shortMessage||e.message))||'หมวดหมู่และประวัติอาจไม่ครบ'); }
  if(LOGS_PARTIAL)toast('info','ประวัติย้อนหลังอาจไม่ครบ','RPC จำกัดช่วงบล็อกที่ค้นได้ · ดึงย้อนหลังได้ราว 120,000 บล็อก · สถานะปัจจุบันถูกต้องครบ');
  try{ await loadCategoriesFromChain(); }catch(e){ console.warn('cat sync',e); }
  try{ await loadArbitratorsFromChain(); }catch(e){ console.warn('arb sync',e); toast('err','โหลดข้อมูลผู้พิพาทไม่สำเร็จ',(e&&(e.shortMessage||e.message))||'ดูรายละเอียดใน Console'); }
  try{ await loadItemsFromChain(); }catch(e){ console.warn('item sync',e); toast('err','โหลดรายการสิ่งของไม่สำเร็จ',(e&&(e.shortMessage||e.message))||'ดูรายละเอียดใน Console'); }
  try{ await loadDisputesFromChain(); }catch(e){ console.warn('dispute sync',e); toast('err','โหลดข้อพิพาทไม่สำเร็จ',(e&&(e.shortMessage||e.message))||'ดูรายละเอียดใน Console'); }
  try{ await loadHistoryFromChain(); }catch(e){ console.warn('history sync',e); toast('info','ดึงประวัติธุรกรรมไม่ครบ',((e&&(e.shortMessage||e.message))||'อ่าน log ไม่สำเร็จ')+' · สถานะปัจจุบันยังถูกต้อง'); }
  await readBalance();
  renderChainPanel(); refreshAll(); applyChainRole();
}

async function refreshChain(){
  const t=$('#chainTag'); if(t){t.textContent='กำลังอ่าน...';t.className='tag pend';}
  await syncChain();
  toast(chainInfo.linked?'ok':'err',chainInfo.linked?'อ่านข้อมูลจากสัญญาแล้ว':'เชื่อมสัญญาไม่สำเร็จ',chainInfo.linked?CONTRACT_ADDRESS:chainInfo.err);
}
async function withdrawOnChain(){
  if(!chainInfo.linked){toast('err','ยังไม่ได้เชื่อมสัญญา','กด Connect Wallet แล้วกดรีเฟรชก่อน');return;}
  try{
    const prov=new ethers.BrowserProvider(ethereum);
    const c=new ethers.Contract(CONTRACT_ADDRESS,ESCROW_ABI,await prov.getSigner());
    const tx=await c.withdraw();
    toast('info','ส่งธุรกรรมแล้ว','รอยืนยันบนเชน · '+tx.hash.slice(0,10)+'...');
    await tx.wait();
    await readContract(); renderChainPanel(); await readBalance(); updateWallet();
    toast('ok','ถอนเงินสำเร็จ','เงินเข้ากระเป๋าแล้ว');
  }catch(e){
    if(e&&(e.code===4001||e.code==='ACTION_REJECTED'))toast('info','ยกเลิกธุรกรรม','คุณกดปฏิเสธใน MetaMask');
    else toast('err','ถอนไม่สำเร็จ',(e&&e.shortMessage)||(e&&e.message)||'ลองใหม่อีกครั้ง');
  }
}
function renderChainPanel(){
  const w=$('#chainPanel'); if(!w)return;
  const t=$('#chainTag'), d=chainInfo.data;
  if(t){
    t.textContent=chainInfo.linked?('เชื่อมแล้ว · '+(state.chainName||'')):'ยังไม่ได้เชื่อม';
    t.className='tag '+(chainInfo.linked?'ok':'off');
  }
  const link=addrLink(CONTRACT_ADDRESS);
  const head=`<div class="admin-row">
      <div style="flex:1;min-width:220px">
        <div class="al">ที่อยู่สัญญา</div>
        <div class="as" style="margin-top:4px"><code class="hash" style="font-size:11.5px">${CONTRACT_ADDRESS}</code></div>
      </div>
      ${link?`<a class="tbtn g" href="${link}" target="_blank" rel="noopener">เปิดใน Explorer ↗</a>`:''}
      <button class="tbtn g" onclick="navigator.clipboard?.writeText('${CONTRACT_ADDRESS}');toast('ok','คัดลอกที่อยู่สัญญาแล้ว','')">คัดลอก</button>
      <button class="tbtn p" onclick="refreshChain()">↻ อ่านค่าจากเชน</button>
    </div>`;
  if(!chainInfo.linked){
    w.innerHTML=head+`<div class="notice" style="margin:14px 18px 18px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>${esc(chainInfo.err||'กด “อ่านค่าจากเชน” เพื่อดึงค่าจริงจากสัญญา')}</div></div>`;
    return;
  }
  const row=(l,sub,v)=>`<div class="rule-row"><div style="flex:1;min-width:150px"><div class="rl">${l}</div><div class="rs">${sub}</div></div><span class="rv">${v}</span></div>`;
  w.innerHTML=head+
    row('เจ้าของสัญญา (Admin)',d.isOwner?'กระเป๋าที่เชื่อมอยู่คือเจ้าของสัญญา':'กระเป๋าที่เชื่อมอยู่ไม่ใช่เจ้าของ',shortAddr(d.owner))+
    row('ค่าธรรมเนียมแพลตฟอร์ม','feeBps บนสัญญา',(d.feeBps/100).toFixed(2)+'%')+
    row('เงินประกันขั้นต่ำ','minStake',d.minStake.toFixed(2)+' ETH')+
    row('ค่าตอบแทนต่อเคส','arbReward',d.arbReward.toFixed(3)+' ETH')+
    row('จำนวนที่อ่านได้จากสัญญา','itemCount / disputeCount / categoryCount / arbitratorCount',
        d.items+' / '+d.disputes+' / '+d.cats+' / '+d.arbs)+
    row('ที่โหลดขึ้นหน้าเว็บจริง','สิ่งของ / ข้อพิพาท / หมวดหมู่ ที่แสดงอยู่ตอนนี้',
        items.length+' / '+disputes.length+' / '+CHAIN_CATS.length)+
    row('สถานะสัญญา','paused',d.paused?'หยุดชั่วคราว':'ทำงานปกติ')+
    row('เปิดรับสมัครผู้พิพาท','applicationsOpen',d.applicationsOpen?'เปิด':'ปิด')+
    row('ข้อมูลในสัญญา','สิ่งของ · ข้อพิพาท · ผู้พิพาท · หมวดหมู่',d.items+' · '+d.disputes+' · '+d.arbs+' · '+d.cats)+
    row('รออนุมัติ','ใบสมัคร · คำขอถอนตัว',d.apps+' · '+d.exits)+
    row('คลังค่าธรรมเนียม','treasury · จ่ายผู้พิพาทไปแล้ว '+d.rewardPaid.toFixed(3)+' ETH',d.treasury.toFixed(4)+' ETH')+
    `<div class="admin-row">
      <div style="flex:1;min-width:200px"><div class="al">ยอดที่สัญญาค้างจ่ายให้คุณ</div>
        <div class="as">pendingWithdrawal · มัดจำคืน ค่าเช่า ค่าตอบแทน เงินประกัน รวมอยู่ในก้อนนี้</div></div>
      <span class="rv" style="color:${d.pending>0?'#0f8a52':'#5e6b89'}">${d.pending.toFixed(4)} ETH</span>
      <button class="tbtn p" ${d.pending>0?'':'disabled'} onclick="withdrawOnChain()">${d.pending>0?'ถอนเงินออก':'ไม่มียอดค้าง'}</button>
    </div>`;
}

/* ================= MetaMask ================= */
const CHAINS={'0x1':'Ethereum Mainnet','0x5':'Goerli','0xaa36a7':'Sepolia Testnet','0x89':'Polygon','0x13882':'Polygon Amoy',
 '0x38':'BNB Chain','0xa4b1':'Arbitrum One','0xa':'Optimism','0x2105':'Base','0x7a69':'Hardhat Local','0x539':'Ganache Local'};
const hasEth=()=>typeof window!=='undefined'&&typeof window.ethereum!=='undefined';
const shortAddr=a=>a&&a.length>12?a.slice(0,6)+'...'+a.slice(-4):a;
/* ย้ายข้อมูลเดโมทั้งหมดจาก address เดิมไปยัง address ใหม่ ให้สัญญาและเคสยังเป็นของเรา */
function remapAddr(from,to){
  if(!from||!to||from===to)return;
  items.forEach(i=>{['owner','borrower','lender'].forEach(k=>{if(i[k]===from)i[k]=to;});});
  disputes.forEach(d=>{['by','against','renter','lender','arb'].forEach(k=>{if(d[k]===from)d[k]=to;});});
  notifs.forEach(n=>{if(n.to===from)n.to=to;});
  [admin.arbs,admin.apps,admin.exits].forEach(l=>l.forEach(o=>{if(o.addr===from)o.addr=to;}));
  ROLES.user.addr=to; ME=to;
}
async function readChain(){
  try{
    const id=await ethereum.request({method:'eth_chainId'});
    state.chainId=id; state.chainName=CHAINS[id]||('Chain '+parseInt(id,16));
  }catch(e){state.chainName='';}
}
async function readBalance(){
  if(!state.realAddr)return;
  try{
    const wei=await ethereum.request({method:'eth_getBalance',params:[state.realAddr,'latest']});
    state.bal=+(parseInt(wei,16)/1e18).toFixed(4);
  }catch(e){/* อ่านยอดไม่ได้ ใช้ยอดเดิมต่อ */}
}
async function connectWallet(){
  if(!hasEth()){
    toast('err','ไม่พบ MetaMask','ติดตั้งส่วนขยาย MetaMask ก่อน หรือเปิดหน้านี้ในเบราว์เซอร์ที่มีกระเป๋า · ตอนนี้ยังใช้โหมดจำลองได้ตามปกติ');
    return false;
  }
  try{
    const accs=await ethereum.request({method:'eth_requestAccounts'});
    if(!accs||!accs.length){toast('err','ไม่ได้เลือกบัญชี','กดเชื่อมต่ออีกครั้งแล้วเลือกบัญชีใน MetaMask');return false;}
    const prev=ROLES.user.addr;
    state.realAddr=accs[0];
    remapAddr(prev,accs[0]);
    state.connected=true;
    await readChain(); await readBalance();
    loadFav();
    if(!ethereum.__drBound){
      ethereum.__drBound=true;
      ethereum.on('accountsChanged',a=>{
        if(!a||!a.length){disconnectWallet();return;}
        const prev2=ROLES.user.addr; state.realAddr=a[0]; remapAddr(prev2,a[0]);
        items=[];txs=[];disputes=[];notifs=[];
        readBalance()
          .then(()=>syncChain())
          .then(()=>{loadFav();refreshAll();applyChainRole();toast('info','สลับบัญชีใน MetaMask',shortAddr(a[0])+' · ดึงข้อมูลของบัญชีนี้จากเชนใหม่แล้ว');});
      });
      ethereum.on('chainChanged',()=>{readChain().then(()=>readBalance()).then(()=>{refreshAll();toast('info','เปลี่ยนเครือข่ายแล้ว',state.chainName||'');});});
    }
    syncChain();
    refreshAll();
    toast('ok','เชื่อมต่อ MetaMask สำเร็จ',shortAddr(accs[0])+(state.chainName?' · '+state.chainName:'')+' · ยอด '+state.bal.toFixed(4)+' ETH');
    return true;
  }catch(e){
    if(e&&e.code===4001)toast('info','ยกเลิกการเชื่อมต่อ','คุณกดปฏิเสธใน MetaMask');
    else toast('err','เชื่อมต่อไม่สำเร็จ',(e&&e.message)||'ลองใหม่อีกครั้ง');
    return false;
  }
}
function disconnectWallet(){
  const prev=ROLES.user.addr;
  remapAddr(prev,DEF_ADDR.user);
  Object.keys(ROLES).forEach(k=>ROLES[k].addr=DEF_ADDR[k]);
  state.realAddr=null; state.connected=false; state.chainName=''; state.bal=0.240;
  chainInfo={linked:false,err:'',data:null};
  setRole('user',true); loadFav(); refreshAll(); renderRoleMenu();
  toast('info','ตัดการเชื่อมต่อแล้ว','กลับสู่โหมดจำลอง · ถ้าต้องการตัดสิทธิ์เว็บนี้จริง ให้ลบออกใน MetaMask → Connected sites');
}
function refreshAll(){
  renderChainPanel();updateWallet();renderCats();renderPopular();renderMy();renderDispute();renderArb();renderAdmin();renderNotifs();renderStats();
  if(state.page==='browse')renderBrowse();
  if(state.page==='tx')renderTx();
}
function updateWallet(){
  $('#balVal').textContent=state.bal.toFixed(state.realAddr?4:3)+' ETH';
  $('#connectBtn').textContent=state.connected?'Disconnect Wallet':'Connect Wallet';
  const nc=$('#netChip');
  if(nc)nc.innerHTML=state.realAddr
    ? `<span class="net-chip real"><i></i>${esc(state.chainName||'เชื่อมต่อแล้ว')}</span>`
    : `<span class="net-chip"><i></i>โหมดจำลอง · ยังไม่ต่อกระเป๋าจริง</span>`;
  $('#ddWalletBtn').querySelector('span').textContent=state.connected?'ตัดการเชื่อมต่อ':'เชื่อมต่อกระเป๋า';
  document.body.classList.toggle('connected',state.connected);
}
function toggleWallet(){
  $('#walletMenu').classList.remove('open');
  if(state.connected){disconnectWallet();return;}
  if(hasEth()){connectWallet();return;}
  /* ไม่มี MetaMask ในเบราว์เซอร์ — เปิดโหมดจำลองให้ทดลองกดได้ครบ */
  state.connected=true; updateWallet();
  toast('info','ไม่พบ MetaMask · ใช้โหมดจำลอง','ติดตั้งส่วนขยาย MetaMask แล้วกดใหม่เพื่อเชื่อมกระเป๋าจริง · ตอนนี้ทุกปุ่มยังกดทดลองได้ครบ');
}
const DESIGN_MODE=true; // เฟสออกแบบ: ยังไม่ต่อกระเป๋าจริง ทุกปุ่มกดทดลองได้เลย
function ensureFunds(n){
  if(state.bal>=n)return true;
  if(DESIGN_MODE){
    const add=Math.ceil(n-state.bal)+1;
    state.bal=+(state.bal+add).toFixed(3);updateWallet();
    toast('info','โหมดออกแบบ · เติม ETH ทดสอบอัตโนมัติ','+'+add.toFixed(2)+' ETH เพื่อให้ทดลองกดได้ครบทุกขั้นตอน');
    return true;
  }
  toast('err','ยอด ETH ไม่พอ','มี '+state.bal.toFixed(3)+' ETH ต้องใช้ '+n.toFixed(2)+' ETH');return false;
}
function requireWallet(){
  if(DESIGN_MODE||state.connected)return true;
  toast('err','ยังไม่ได้เชื่อมต่อกระเป๋า','กด Connect Wallet ก่อนทำธุรกรรม');return false;
}
function copyAddr(){
  const a=state.realAddr||'0x7a3f9c5e21b84d07fa6c3e18b95d4a2f7c0a9e2c';
  navigator.clipboard?.writeText(a);
  toast('ok','คัดลอกที่อยู่แล้ว',shortAddr(a));
  $('#walletMenu').classList.remove('open');
}
function faucet(){state.bal+=25;updateWallet();toast('ok','รับ ETH ทดสอบแล้ว','+25.000 ETH เข้ากระเป๋า (Testnet)');if($('#modal').dataset.item)openItem(+$('#modal').dataset.item);}
$('#walletChip').onclick=e=>{e.stopPropagation();$('#walletMenu').classList.toggle('open')};
document.addEventListener('click',()=>$('#walletMenu').classList.remove('open'));
$('#walletMenu').onclick=e=>e.stopPropagation();

/* ---------- modal ---------- */
function closeModal(){$('#overlay').classList.remove('open');$('#modal').dataset.item='';$('#modal').innerHTML='';}
$('#overlay').onclick=e=>{if(e.target.id==='overlay')closeModal()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function showModal(html){$('#modal').innerHTML=html;$('#overlay').classList.add('open');}
const closeBtn=`<button class="modal-close" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;

function openItem(id){
  const it=items.find(i=>i.id===id);if(!it)return;
  $('#modal').dataset.item=id;
  const costs=escOf(it);
  const total=+(costs.rent+costs.dep).toFixed(3);
  const ownItem=isOwnItem(it);
  const can=it.st==='available'&&!ownItem&&isRenter()&&it.allowRent!==false;
  const poor=state.bal<total;
  showModal(`
  <div class="modal-art">${it.art}${closeBtn}<span class="badge ${ST[it.st].cls}" style="left:14px;top:14px"><i></i>${ST[it.st].th}</span></div>
  <div class="modal-body">
    <h2>${esc(it.name)}</h2>
    <p class="m-sub">${esc(it.desc)}</p>
    <div class="m-grid">
      <div class="m-box"><div class="l">ค่าเช่า / วัน</div><div class="v">${it.price} ETH</div></div>
      <div class="m-box"><div class="l">ระยะเวลาสูงสุด</div><div class="v">${it.days} วัน</div></div>
      <div class="m-box"><div class="l">เงินมัดจำ</div><div class="v">${it.dep} ETH</div></div>
    </div>
    <div class="m-row"><span class="k">ผู้ให้ยืม</span><span class="v">${it.mine?'คุณ (เจ้าของ)':it.owner}</span></div>
    <div class="m-row"><span class="k">หมวดหมู่</span><span class="v">${CATS.find(c=>c.id===it.cat)?.th||it.cat}</span></div>
    <div class="m-row"><span class="k">สัญญา</span><span class="v">RentalEscrow.sol</span></div>
    <div class="m-row"><span class="k">เงินประกันของผู้ปล่อยเช่า (ล็อกไว้ค้ำคุณ)</span><span class="v" style="color:#0f8a52">${costs.bond.toFixed(2)} ETH</span></div>
    <div class="m-row"><span class="k">ค่าธรรมเนียมแพลตฟอร์ม (${admin.fee}%)</span><span class="v" style="color:#7a86a8">${costs.fee.toFixed(3)} ETH · หักจากผู้ปล่อยเช่า</span></div>
    <div class="m-row"><span class="k">ยอดที่คุณต้องชำระ (ค่าเช่า + มัดจำ)</span><span class="v" style="color:#2f5ae0">${total.toFixed(2)} ETH</span></div>
    ${can&&poor?`<div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>ยอด ETH ในกระเป๋าไม่พอ (มี ${state.bal.toFixed(3)} ETH ต้องใช้ ${total.toFixed(2)} ETH) — <b style="cursor:pointer;text-decoration:underline" onclick="faucet()">รับ ETH ทดสอบฟรี</b></div></div>`:''}
    ${!isRenter()?`<div class="notice" style="background:#f4f7ff;border-color:#cfdcff;color:#2b53cf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div><b>มุมมองผู้ดูแล</b> — Role ${ROLES[state.role].en} ไม่ได้เป็นคู่สัญญาเช่า จึงดูข้อมูลได้แต่ทำสัญญาไม่ได้</div></div>`:ownItem?`<div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div><b>สิ่งของของคุณ</b> — ไม่สามารถเช่าสิ่งของที่คุณเป็นเจ้าของเองได้</div></div>`:it.allowRent===false?`<div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div><b>เจ้าของไม่เปิดให้เช่า</b> — สามารถดูรายละเอียดได้ แต่ไม่สามารถเช่าสิ่งของรายการนี้ได้</div></div>`:(!can&&!it.mine)?`<div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>ขณะนี้รายการนี้${ST[it.st].th} จึงยังยืมไม่ได้ กด “แจ้งเตือนเมื่อว่าง” เพื่อรับการแจ้งเตือน</div></div>`:''}
    <div class="m-actions">
      ${can
        ? `<button class="btn-lg btn-primary" ${poor?'disabled':''} onclick="borrow(${it.id})">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
             ยืนยันยืม · ${total.toFixed(2)} ETH</button>`
        : !isRenter()
          ? ''
          : ownItem
          ? `<button class="btn-lg btn-primary" onclick="toast('info','จัดการรายการของคุณ','ไปที่หน้า My Items เพื่อแก้ไขสถานะ');closeModal();go('myitems')">จัดการรายการนี้</button>`
          : it.allowRent===false ? ''
          : `<button class="btn-lg btn-primary" onclick="toast('ok','ตั้งการแจ้งเตือนแล้ว','เราจะแจ้งเมื่อ ${esc(it.name)} ว่าง');closeModal()">แจ้งเตือนเมื่อว่าง</button>`}
      <button class="btn-lg btn-ghost" onclick="closeModal()">ปิด</button>
    </div>
  </div>`);
}
function borrow(id){
  if(!requireWallet())return;
  if(!isRenter()){toast('err','บทบาทนี้ทำสัญญาเช่าไม่ได้','เฉพาะผู้ใช้ทั่วไปเท่านั้นที่ยืมของได้');return;}
  if(admin.paused){toast('err','สัญญาถูกหยุดชั่วคราว','Admin สั่ง pause() อยู่ — ทำธุรกรรมไม่ได้จนกว่าจะเปิดใหม่');return;}
  const it=items.find(i=>i.id===id);
  if(!it){toast('err','ไม่พบสิ่งของ','รายการนี้อาจถูกลบแล้ว');return;}
  if(isOwnItem(it)){toast('err','ไม่สามารถเช่าของตัวเองได้','คุณเป็นเจ้าของสิ่งของรายการนี้');return;}
  if(it.allowRent===false){toast('err','ไม่สามารถเช่าได้','เจ้าของไม่อนุญาตให้เช่าสิ่งของรายการนี้');return;}
  const e=escOf(it);
  const total=+(e.rent+e.dep).toFixed(3);
  if(onChain()){closeModal();sendTx('ทำสัญญาเช่า',c=>c.borrow(it.id,it.days,{value:ethers.parseEther(String(total))}));return;}
  if(!ensureFunds(total))return;
  state.bal=+(state.bal-total).toFixed(3);it.st='borrowed';it.mineBorrow=true;it.esc=e;
  it.borrower=curAddr(); it.lender=it.owner;
  txs.unshift({h:randHash(),type:'Borrow',item:it.name,amt:'-'+total.toFixed(2)+' ETH',st:'pend',time:'เมื่อสักครู่'});
  updateWallet();closeModal();renderPopular();renderBrowse();renderStats();
  toast('ok','ทำสัญญายืมสำเร็จ 🎉','เซ็น Smart Contract แล้ว · '+it.name);
  setTimeout(()=>{txs[0].st='ok';if(state.page==='tx')renderTx();toast('info','ธุรกรรมได้รับการยืนยัน',txs[0].h+' · 12 confirmations')},2600);
}

/* ---------- list item modal ---------- */
function openList(){
  if(!isRenter()){toast('err','บทบาทนี้ลงทะเบียนของไม่ได้',ROLES[state.role].en+' มีหน้าที่กำกับดูแลระบบ ไม่ได้เป็นคู่สัญญาเช่า · สลับเป็น User เพื่อปล่อยของให้ยืม');return;}
  showModal(`<div class="modal-body" style="padding-top:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2>ลงทะเบียนสิ่งของให้ยืม</h2><p class="m-sub">กรอกรายละเอียด แล้วระบบจะสร้าง Smart Contract ให้อัตโนมัติ</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div style="margin-top:18px">
      <div class="field"><label>ชื่อสิ่งของ</label><input id="f-name" placeholder="เช่น iPad Pro 11 นิ้ว M4"></div>
      <div class="f2">
        <div class="field"><label>หมวดหมู่</label><select id="f-cat">${CATS.filter(c=>!['all','more'].includes(c.id)).map(c=>`<option value="${c.id}">${c.en} · ${c.th}</option>`).join('')}</select></div>
        <div class="field"><label>ระยะเวลาให้ยืมสูงสุด (วัน)</label><input id="f-days" type="number" min="1" max="60" value="7"></div>
      </div>
      <div class="f2">
        <div class="field"><label>ค่าเช่า / วัน (ETH)</label><input id="f-price" type="number" step="0.1" min="0" value="0.5"></div>
        <div class="field"><label>เงินมัดจำที่ผู้เช่าต้องวาง (ETH)</label><input id="f-dep" type="number" step="0.1" min="0" value="0.3"></div>
      </div>
      <div class="field"><label>เงินประกันของคุณ (ผู้ปล่อยเช่า)</label>
        <input id="f-bond" type="number" step="0.1" min="0" value="0.3">
        <div class="hint">ล็อกไว้ค้ำว่าของตรงปก ถ้าคุณเป็นฝ่ายผิดผู้พิพาทจะยกเงินก้อนนี้ให้ผู้เช่า · ได้คืนเต็มเมื่อจบสัญญาด้วยดี</div></div>
      <div class="field"><label>การอนุญาตให้เช่า</label>
        <select id="f-allow-rent"><option value="yes" selected>เปิดให้ผู้เช่าเช่าได้</option><option value="no">ไม่อนุญาตให้ผู้เช่าเช่าเอง</option></select>
        <div class="hint">หากเลือกไม่อนุญาต รายการจะแสดงให้ดูรายละเอียดได้ แต่ผู้เช่าจะไม่สามารถทำสัญญาเช่าได้ และจะไม่มีการติดต่อเจ้าหน้าที่</div>
      </div>
      <div class="field"><label>รายละเอียด</label><textarea id="f-desc" placeholder="สภาพสินค้า อุปกรณ์ที่แถม เงื่อนไขการใช้งาน..."></textarea></div>
      <div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>การลงทะเบียนมีค่า Gas ประมาณ 0.002 ETH · ค่าธรรมเนียมแพลตฟอร์ม ${admin.fee}% จะถูกหักจากค่าเช่าที่คุณได้รับตอนจบสัญญา</div></div>
      <div class="m-actions">
        <button class="btn-lg btn-primary" onclick="submitList()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></svg>ลงทะเบียนสิ่งของ</button>
        <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
      </div>
    </div></div>`);
}
function submitList(){
  if(!requireWallet())return;
  if(!isRenter()){toast('err','บทบาทนี้ลงทะเบียนของไม่ได้','เฉพาะผู้ใช้ทั่วไปเท่านั้นที่เป็นคู่สัญญาเช่าได้');return;}
  if(admin.paused){toast('err','สัญญาถูกหยุดชั่วคราว','Admin สั่ง pause() อยู่ — ลงทะเบียนของใหม่ไม่ได้');return;}
  const name=$('#f-name').value.trim();
  if(!name){toast('err','กรุณากรอกชื่อสิ่งของ','ช่องชื่อสิ่งของห้ามว่าง');$('#f-name').focus();return;}
  const cat=$('#f-cat').value, days=Math.max(1,+$('#f-days').value||1);
  const price=Math.max(0,+$('#f-price').value||0), dep=Math.max(0,+$('#f-dep').value||0), bond=Math.max(0,+($('#f-bond')?.value)||0);
  const desc=$('#f-desc').value.trim()||'เจ้าของยังไม่ได้ระบุรายละเอียดเพิ่มเติมสำหรับรายการนี้';
  const hues={electronics:205,sports:100,lifestyle:285,books:262,tools:18};
  const allowRent=$('#f-allow-rent').value==='yes';
  if(onChain()){
    const h=catHash(cat);
    if(!h){toast('err','ไม่พบหมวดหมู่นี้บนสัญญา','ให้ Admin เพิ่มหมวดหมู่ก่อน');return;}
    closeModal();
    sendTx('ลงทะเบียนสิ่งของ',c=>c.listItem(h,ethers.parseEther(String(price)),days,
      ethers.parseEther(String(dep)),ethers.parseEther(String(bond)),allowRent,
      packMeta(name,desc),{value:ethers.parseEther(String(bond))}));
    return;
  }
  const it={id:Date.now(),name,cat,st:'available',days,price,dep,bond,allowRent,pop:50,owner:ME,mine:true,desc,
    art:artGeneric(hues[cat]||205,'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>')};
  items.unshift(it);
  state.bal=Math.max(0,state.bal-0.002);
  txs.unshift({h:randHash(),type:'List Item',item:name,amt:'-0.002 ETH',st:'ok',time:'เมื่อสักครู่'});
  updateWallet();closeModal();renderCats();renderPopular();renderStats();
  if(state.page==='browse')renderBrowse();
  toast('ok','ลงทะเบียนสำเร็จ 🎉',name+' ถูกบันทึกบนเชนแล้ว');
  setTimeout(()=>go('myitems'),600);
}

/* ---------- dispute modal ---------- */
function openDispute(){
  if(!canOpenDispute()){toast('err','ผู้พิพาทเปิดข้อพิพาทไม่ได้','บทบาทผู้พิพาทมีหน้าที่ตัดสินเคสของผู้อื่นเท่านั้น ไม่ได้เป็นคู่สัญญาเช่าจึงไม่มีข้อพิพาทให้ยื่น');return;}
  const mine=items.filter(i=>i.mine||i.mineBorrow);
  if(!mine.length){toast('err','คุณยังไม่มีสัญญาเช่า','ข้อพิพาทเปิดได้เฉพาะจากสัญญาที่คุณเป็นคู่สัญญา — ลงทะเบียนของให้ยืม หรือยืมของสักชิ้นก่อน');return;}
  const opts=mine.map(i=>`<option value="${i.id}">${esc(i.name)} · ${i.mine?'ของที่คุณปล่อยให้ยืม':'ของที่คุณกำลังยืม'}</option>`).join('');
  dPhotos=[];
  showModal(`<div class="modal-body" style="padding-top:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2>เปิดข้อพิพาท</h2><p class="m-sub">ระบบ Arbitrator แบบกระจายศูนย์จะพิจารณาภายใน 48 ชั่วโมง</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div style="margin-top:18px">
      <div class="field"><label>เลือกรายการที่มีปัญหา</label><select id="d-item">${opts}</select></div>
      <div class="field"><label>ประเภทปัญหา</label><select id="d-type">
        <option>สินค้าไม่ตรงตามรายละเอียด</option><option>สินค้าชำรุด/เสียหาย</option>
        <option>คืนของล่าช้ากว่ากำหนด</option><option>ไม่ได้รับเงินมัดจำคืน</option><option>อื่น ๆ</option></select></div>
      <div class="field"><label>แนบรูปหลักฐาน <span style="font-weight:600;color:var(--muted)">(ไม่บังคับ)</span></label>
        <label class="ph-drop">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="10" r="1.8"/><path d="m4 17 5-5 4 4 2.5-2.5L20 17"/></svg>
          <div style="flex:1"><div class="pt">เลือกรูปจากเครื่อง</div><div class="ps">สูงสุด 4 รูป · ระบบย่อขนาดให้อัตโนมัติ</div></div>
          <span class="tag off" id="d-photoCount">0 / 4 รูป</span>
          <input type="file" accept="image/*" multiple onchange="addDisputePhotos(event)">
        </label>
        <div class="ph-grid" id="d-photoWrap"></div>
        <div class="hint">รูปจะถูกแนบไปกับเคส ผู้พิพาทที่รับเคสจะเห็นเพื่อใช้ประกอบการตัดสิน</div></div>
      <div class="field"><label>อธิบายรายละเอียด</label><textarea id="d-reason" placeholder="เล่าเหตุการณ์ วันที่ และหลักฐานที่มี..."></textarea><div class="hint">แนบรูป/หลักฐานเพิ่มเติมได้ภายหลังในหน้าเคส</div></div>
      <div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>เงินมัดจำจะถูกล็อกไว้ในสัญญาจนกว่าข้อพิพาทจะได้ข้อสรุป</div></div>
      <div class="m-actions">
        <button class="btn-lg btn-primary" onclick="submitDispute()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M6 7l-4 7h8zM18 7l-4 7h8z"/><path d="M4 7h16"/></svg>ยื่นข้อพิพาท</button>
        <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
      </div>
    </div></div>`);
}
/* ---------- แนบรูปหลักฐานในข้อพิพาท ---------- */
let dPhotos=[];
function addDisputePhotos(e){
  const files=[...(e.target.files||[])];
  e.target.value='';
  if(!files.length)return;
  const room=4-dPhotos.length;
  if(room<=0){toast('err','แนบได้สูงสุด 4 รูป','ลบรูปเดิมออกก่อนถ้าต้องการเปลี่ยน');return;}
  if(files.length>room)toast('info','แนบได้อีก '+room+' รูป','ระบบจะรับเฉพาะรูปแรกๆ ที่เลือกมา');
  files.slice(0,room).forEach(f=>{
    if(!/^image\//.test(f.type)){toast('err','ไฟล์นี้ไม่ใช่รูปภาพ',f.name);return;}
    const fr=new FileReader();
    fr.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        /* ย่อด้านยาวสุดเหลือ 900px ก่อนเก็บ กันรูปจากมือถือกินหน่วยความจำ */
        const max=900, sc=Math.min(1,max/Math.max(img.width,img.height));
        const c=document.createElement('canvas');
        c.width=Math.round(img.width*sc); c.height=Math.round(img.height*sc);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height);
        dPhotos.push({name:f.name,url:c.toDataURL('image/jpeg',0.82)});
        renderDisputePhotos();
      };
      img.onerror=()=>toast('err','เปิดรูปนี้ไม่ได้',f.name);
      img.src=fr.result;
    };
    fr.onerror=()=>toast('err','อ่านไฟล์ไม่สำเร็จ',f.name);
    fr.readAsDataURL(f);
  });
}
function removeDisputePhoto(i){dPhotos.splice(i,1);renderDisputePhotos();}
function renderDisputePhotos(){
  const w=$('#d-photoWrap'); if(!w)return;
  w.innerHTML=dPhotos.map((ph,i)=>`<div class="ph-item"><img src="${ph.url}" alt="${esc(ph.name)}"><button type="button" class="ph-x" onclick="removeDisputePhoto(${i})" title="ลบรูปนี้">×</button></div>`).join('');
  const c=$('#d-photoCount'); if(c)c.textContent=dPhotos.length+' / 4 รูป';
}
function zoomEvidence(id,i){
  const d=disputes.find(x=>x.id===id); if(!d||!d.photos||!d.photos[i])return;
  showModal(`<div class="modal-body" style="padding-top:22px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <div><h2 style="font-size:17px">หลักฐาน ${i+1} / ${d.photos.length}</h2>
        <p class="m-sub">${esc(d.id)} · ${esc(d.item)}</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="openCaseDetail('${d.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <img src="${d.photos[i].url}" alt="หลักฐาน" style="width:100%;border-radius:12px;margin-top:14px;border:1px solid var(--line)">
    <div class="m-actions"><button class="btn-lg btn-ghost" onclick="openCaseDetail('${d.id}')">กลับไปที่เคส</button></div>
  </div>`);
}
function submitDispute(){
  if(!requireWallet())return;
  if(admin.paused){toast('err','สัญญาถูกหยุดชั่วคราว','Admin สั่ง pause() อยู่ — ยื่นข้อพิพาทใหม่ไม่ได้');return;}
  const it=items.find(i=>i.id===+$('#d-item').value);
  const reason=$('#d-reason').value.trim();
  if(reason.length<10){toast('err','รายละเอียดสั้นเกินไป','กรุณาอธิบายอย่างน้อย 10 ตัวอักษร');$('#d-reason').focus();return;}
  if(onChain()){
    if(it.rentalId===undefined){toast('err','ของชิ้นนี้ไม่มีสัญญาเช่าที่ยังเปิดอยู่','เปิดข้อพิพาทได้เฉพาะสัญญาที่กำลังดำเนินอยู่');return;}
    const ty=$('#d-type');
    if(dPhotos.length)toast('info','รูปหลักฐานยังไม่ถูกส่งขึ้นเชน','ไฟล์รูปต้องอัปโหลดผ่าน IPFS ก่อน · ข้อความคำอธิบายถูกบันทึกบนเชนครบ');
    closeModal();
    sendTx('ยื่นข้อพิพาท',c=>c.openDispute(it.rentalId,ty?ty.selectedIndex:4,reason));
    dPhotos=[];
    return;
  }
  const id='DSP-'+(500+Math.floor(Math.random()*400));
  /* ระบุฝั่งจากสัญญาจริง — ผู้ยื่นอาจเป็นผู้เช่าหรือผู้ปล่อยเช่าก็ได้ */
  const iAmLender=isOwnItem(it);
  if(iAmLender&&!it.borrower){toast('err','ยังไม่มีคู่สัญญาของสิ่งของนี้','เปิดข้อพิพาทได้เฉพาะสัญญาเช่าที่มีผู้เช่าจริงบนเชน');return;}
  const renter=iAmLender?it.borrower:curAddr();
  const lender=iAmLender?curAddr():(it.lender||it.owner);
  disputes.unshift({id,item:it.name,reason,type:$('#d-type').value,st:'open',by:curAddr(),against:(curAddr()===renter?lender:renter),renter,lender,
    date:new Date().toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'}),amt:(it.dep).toFixed(2)+' ETH',esc:it.esc||escOf(it),photos:dPhotos.slice(),arb:null,arbName:null});
  dPhotos=[];
  txs.unshift({h:randHash(),type:'Dispute',item:it.name,amt:'0.00 ETH',st:'info',time:'เมื่อสักครู่'});
  const _nd=disputes[0];
  admin.arbs.filter(a=>okStake(a)&&!partyOf(_nd,a.addr)).forEach(a=>notify(a.addr,'⚖️','#fff1e8','มีข้อพิพาทใหม่รอลงรับ',id+' · '+it.name+' — กดลงรับเคสเพื่อเป็นผู้พิพาทของรายการนี้','dispute'));
  closeModal();renderDispute();renderNotifs();go('dispute');
  toast('ok','ยื่นข้อพิพาทสำเร็จ','เลขเคส '+id+' · แจ้งเตือนผู้พิพาทในระบบแล้ว');
}


/* ---------- notifications ---------- */
function notify(to,ic,bg,t,b,page){
  notifs.unshift({to,ic,bg,t,b,time:'เมื่อสักครู่',un:true,go:page||''});
  renderNotifs();
}
const mineNotifs=()=>notifs.filter(n=>n.to==='all'||n.to===state.role||eqAddr(n.to,curAddr()));
function renderNotifs(){
  const list=mineNotifs(), un=list.filter(n=>n.un).length;
  const bell=$('#bellBtn'); if(!bell)return;
  bell.classList.toggle('has',un>0);
  $('#bellCnt').textContent=un>9?'9+':un;
  const pend=admin.apps.length+admin.exits.length;
  const nb=$('#navAdminBadge');
  if(nb){nb.textContent=pend;nb.classList.toggle('on',pend>0);}
  $('#bellMenu').innerHTML=`
    <div class="nf-head"><b>การแจ้งเตือน</b>${un?`<button onclick="markAllRead()">อ่านทั้งหมดแล้ว</button>`:'<span style="font-size:11.5px;color:#98a2bf">ไม่มีรายการใหม่</span>'}</div>
    <div class="nf-list">${list.length?list.map((n,i)=>`
      <button class="nf ${n.un?'un':''}" onclick="openNotif(${notifs.indexOf(n)})">
        <div class="nf-ic" style="background:${n.bg||'#eef2fe'}">${n.ic||'🔔'}</div>
        <div style="flex:1"><div class="nf-t">${esc(n.t)}</div><div class="nf-b">${esc(n.b)}</div><div class="nf-time">${esc(n.time)}</div></div>
      </button>`).join(''):`<div style="padding:26px 14px;text-align:center;font-size:12.5px;color:#98a2bf;font-family:'Noto Sans Thai',sans-serif">ยังไม่มีการแจ้งเตือนสำหรับ Role นี้</div>`}</div>`;
}
function openNotif(i){
  const n=notifs[i]; if(!n)return;
  n.un=false; $('#bellMenu').classList.remove('open');
  if(n.go)go(n.go); else renderNotifs();
  renderNotifs();
}
function markAllRead(){mineNotifs().forEach(n=>n.un=false);renderNotifs();toast('info','อ่านการแจ้งเตือนทั้งหมดแล้ว','');}

/* ---------- roles ---------- */
function roleBanner(){
  const R=ROLES[state.role];
  return `<div class="role-banner" style="background:${R.bg};border-color:${R.c}44;color:${R.c}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 21c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg>
    <div><div class="rb-t">Role ปัจจุบัน: ${R.en} · ${R.th}</div><div class="rb-s">${R.desc}</div></div></div>`;
}
function renderRoleMenu(){
  /* เชื่อมกระเป๋าแล้ว = บทบาทมาจากสัญญาอย่างเดียว สลับเองไม่ได้
     อยากเปลี่ยนบทบาทต้องสลับ address ใน MetaMask */
  const cr=chainRole(), locked=!!cr;
  $('#roleMenu').innerHTML=Object.entries(ROLES).map(([k,R])=>{
    const on=locked?cr===k:state.role===k;
    const dim=locked&&cr!==k;
    return `<button class="rmi ${on?'sel':''}" data-role="${k}"
      style="${dim?'opacity:.42;cursor:not-allowed':locked?'cursor:default':''}">
      <span class="rdot" style="background:${R.dot}"></span>
      <span><span class="rt">${R.en} · ${R.th}${cr===k?' <span class="tag ok" style="margin-left:4px">จากสัญญา</span>':''}</span><span class="rs" style="display:block">${R.short}</span></span>
    </button>`;}).join('')+
    `<div class="dd-sep"></div><div style="padding:8px 11px;font-size:11px;color:#98a2bf;font-family:'Noto Sans Thai',sans-serif;line-height:1.6">${
      locked
        ? 'กระเป๋านี้คือ <b style="color:#0f8a52">'+ROLES[cr].en+'</b> อ่านจากสัญญาบนเชน · สลับบทบาทเองไม่ได้ ถ้าต้องการบทบาทอื่นให้สลับ address ใน MetaMask'
        : 'ยังไม่ได้เชื่อมกระเป๋า — กด Connect Wallet แล้วระบบจะกำหนดบทบาทจากสัญญาให้เอง'
    }</div>`;
  $$('#roleMenu .rmi').forEach(b=>b.onclick=()=>{
    if(locked){
      toast('info','บทบาทกำหนดจากสัญญา','กระเป๋า '+shortAddr(state.realAddr)+' เป็น '+ROLES[cr].en+' · สลับ address ใน MetaMask เพื่อใช้บทบาทอื่น');
      $('#roleMenu').classList.remove('open');
      return;
    }
    setRole(b.dataset.role);
  });
}
function setRole(r,quiet){
  state.role=r;const R=ROLES[r];
  $('#roleName').textContent=R.en;
  $('#roleDot').style.background=R.dot;
  $('#chipAddr').textContent=shortAddr(R.addr);
  $('#sideAddr').textContent=shortAddr(R.addr);
  const sb=$('#sideRole');
  sb.textContent=R.en+' · '+R.th;sb.style.background=R.bg;sb.style.color=R.c;
  /* บทบาทมาจากสัญญา = ป้ายแสดงผลอย่างเดียว ซ่อนลูกศรให้รู้ว่ากดไม่ได้ */
  const _rc=$('#roleChip'), _lk=!!chainRole();
  if(_rc){
    const _ar=_rc.querySelector('svg'); if(_ar)_ar.style.display=_lk?'none':'';
    _rc.style.cursor=_lk?'default':'';
    _rc.title=_lk?('บทบาทอ่านจากสัญญาบนเชน · '+R.en+' · เปลี่ยนได้โดยสลับ address ใน MetaMask')
                 :'สลับ Role (ยังไม่ได้เชื่อมกระเป๋า)';
  }
  /* ถอนตัวแล้วหรือถูกถอดสิทธิ์แล้ว = ไม่ใช่ผู้พิพาทอีกต่อไป เมนูและหน้าที่ทั้งหมดหายไปทันที */
  const isArb=r==='arbitrator'&&!!myArb();
  $('#navArb').style.display=isArb?'':'none';
  $('#navAdmin').style.display=r==='admin'?'':'none';
  $('#roleMenu').classList.remove('open');
  renderRoleMenu();
  /* ผู้พิพาทเห็นแค่ 3 เมนูที่เกี่ยวกับหน้าที่ตัวเอง — ไม่ได้เป็นคู่สัญญาเช่าจึงไม่ต้องมีหน้าฝั่งผู้ใช้ */
  /* wallet ผู้พิพาทไม่ใช่คู่สัญญาเช่า หน้าฝั่งผู้ใช้จึงซ่อนตลอด แม้ถูกถอดสิทธิ์แล้ว
     เหลือ Dispute ไว้ให้สมัครกลับเข้ามาใหม่ได้ และ Transactions ไว้ดูประวัติ */
  const hideUserPages=r==='arbitrator';
  ['home','browse','myitems'].forEach(k=>{
    const b=$$('.navlink').find(x=>x.dataset.page===k);
    if(b)b.style.display=hideUserPages?'none':'';
  });
  if(r!=='admin'&&state.page==='admin'){go('home');}
  if(!isArb&&state.page==='arb'){go(r==='arbitrator'?'dispute':'home');}
  if(hideUserPages&&['home','browse','myitems'].includes(state.page)){go('arb');}
  loadFav(); if(state.favOnly&&!state.fav.size)state.favOnly=false;
  renderCats();renderPopular();
  renderArb();syncApplyUI();
  renderMy();renderDispute();renderAdmin();renderNotifs();
  if(state.page==='tx')renderTx();
  if(!quiet)toast('info','สลับ Role เป็น '+R.en,R.addr+' · '+R.short);
}
$('#roleChip').onclick=e=>{
  e.stopPropagation();
  $('#walletMenu').classList.remove('open');$('#bellMenu').classList.remove('open');
  /* เชื่อมกระเป๋าแล้ว บทบาทมาจากสัญญาอย่างเดียว — ไม่เปิดเมนูให้สลับ */
  if(chainRole()){
    $('#roleMenu').classList.remove('open');
    toast('info','บทบาทกำหนดจากสัญญาบนเชน',shortAddr(state.realAddr)+' = '+ROLES[chainRole()].en+' · เปลี่ยนบทบาทได้โดยสลับ address ใน MetaMask เท่านั้น');
    return;
  }
  $('#roleMenu').classList.toggle('open');
};
$('#bellBtn').onclick=e=>{e.stopPropagation();$('#walletMenu').classList.remove('open');$('#roleMenu').classList.remove('open');renderNotifs();$('#bellMenu').classList.toggle('open')};
$('#bellMenu').onclick=e=>e.stopPropagation();
$('#roleMenu').onclick=e=>e.stopPropagation();

function escTable(e){
  if(!e)return '';
  return `<div class="esc-tb">
    <div class="esc-r"><span class="who w-r">ผู้เช่า</span>ค่าเช่า (ค้างใน escrow)<span class="amt">${e.rent.toFixed(2)} ETH</span></div>
    <div class="esc-r"><span class="who w-r">ผู้เช่า</span>เงินมัดจำ<span class="amt">${e.dep.toFixed(2)} ETH</span></div>
    <div class="esc-r"><span class="who w-l">ผู้ปล่อยเช่า</span>เงินประกัน<span class="amt">${e.bond.toFixed(2)} ETH</span></div>
    <div class="esc-r tot">รวมเงินที่ล็อกอยู่ · ตัดสินแบ่งได้ทั้งหมด<span class="amt">${(e.rent+e.dep+e.bond).toFixed(2)} ETH</span></div>
    <div class="esc-r" style="color:#7a86a8;font-size:12px">ค่าธรรมเนียมแพลตฟอร์ม ${admin.fee}% (หักจากผู้ปล่อยเช่า)<span class="amt" style="font-size:13px;color:#7a86a8">${e.fee.toFixed(3)} ETH</span></div>
  </div>`;
}
function payPreview(e,outcome,cut){
  const r=settle(e,outcome,cut);
  return `<div class="pay-grid">
    <div class="pay-b pay-r"><div class="l">ผู้เช่าได้รับ</div><div class="v">${r.renter.toFixed(2)}</div></div>
    <div class="pay-b pay-l"><div class="l">ผู้ปล่อยเช่าได้รับ</div><div class="v">${r.lender.toFixed(2)}</div></div>
    <div class="pay-b pay-p"><div class="l">แพลตฟอร์ม</div><div class="v">${r.plat.toFixed(2)}</div></div>
  </div>`;
}
function caseIcon(mine){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M6 7l-4 7h8zM18 7l-4 7h8z"/><path d="M4 7h16"/></svg>`;}
function claimCase(id){
  if(admin.paused){toast('err','สัญญาถูกหยุดชั่วคราว','Admin สั่ง pause() อยู่ — ลงรับเคสใหม่ไม่ได้');return;}
  const me=myArb();
  if(!me){toast('err','คุณยังไม่ใช่ผู้พิพาท','สมัครและรอ Admin อนุมัติก่อนจึงจะลงรับเคสได้');return;}
  if(!okStake(me)){toast('err','ถูกพักสิทธิ์','เงินประกันต่ำกว่าเกณฑ์ ลงรับเคสใหม่ไม่ได้');return;}
  if(myExit()){toast('err','คุณยื่นขอถอนตัวไว้','ระหว่างรอ Admin อนุมัติ จะลงรับเคสใหม่ไม่ได้ · ยกเลิกคำขอก่อนถ้าต้องการรับเคสต่อ');return;}
  const d=disputes.find(x=>x.id===id); if(!d)return;
  if(isParty(d)){toast('err','รับเคสนี้ไม่ได้ — คุณเป็นคู่กรณี',CONFLICT_SUB);renderDispute();return;}
  if(d.arb){toast('err','เคสนี้มีผู้พิพาทแล้ว','คุณ'+d.arbName+' ลงรับเคสนี้ไปก่อนแล้ว · 1 เคสมีผู้พิพาทได้คนเดียว');renderDispute();return;}
  if(onChain()){sendTx('ลงรับเคส '+d.id,c=>c.claimCase(d.chainId));return;}
  d.arb=curAddr(); d.arbName=me.name; d.claimedAt=Date.now();
  txs.unshift({h:randHash(),type:'ClaimCase',item:'ลงรับเคส '+d.id+': '+d.item,amt:'0.00 ETH',st:'ok',time:'เมื่อสักครู่'});
  notify(d.by,'⚖️','#e9f0ff','มีผู้พิพาทรับเคสของคุณแล้ว',d.id+' · '+me.name+' จะเป็นผู้ตัดสินข้อพิพาทรายการนี้','dispute');
  renderDispute();renderArb();renderNotifs();
  toast('ok','ลงรับเคส '+d.id+' แล้ว','คุณเป็นผู้พิพาทของเคสนี้เพียงคนเดียว · ตัดสินได้ที่ “เคสที่คุณรับผิดชอบ”');
}
function openCaseDetail(id){
  const d=disputes.find(x=>x.id===id); if(!d)return;
  const me=myArb(), isMine=eqAddr(d.arb,curAddr()), conflict=isParty(d), canClaim=me&&okStake(me)&&d.st==='open'&&!d.arb&&!conflict;
  showModal(`<div class="modal-body" style="padding-top:26px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2 style="font-size:20px">${d.id} · ${esc(d.item)}</h2>
        <p class="m-sub">${esc(d.type||'ข้อพิพาท')} · ยื่นเมื่อ ${esc(d.date)}</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div style="margin-top:12px"><span class="tag ${d.st==='open'?'pend':'ok'}">${d.st==='open'?'กำลังพิจารณา':'ปิดเคสแล้ว'}</span>
      ${d.arb?`<span class="tag info" style="margin-left:6px">ผู้พิพาท: ${esc(d.arbName)}</span>`:`<span class="tag off" style="margin-left:6px">ยังไม่มีผู้พิพาทลงรับ</span>`}</div>
    <div class="dt-grid">
      <div class="dt-box"><div class="l">ผู้ยื่นข้อพิพาท</div><div class="v">${esc(d.by)}${d.renter?`<span class="tag ${d.by===d.renter?'info':'pend'}" style="margin-left:5px">${d.by===d.renter?'ผู้เช่า':'ผู้ปล่อยเช่า'}</span>`:''}</div></div>
      <div class="dt-box"><div class="l">คู่กรณี</div><div class="v">${esc(d.against||'—')}${d.renter?`<span class="tag ${d.against===d.renter?'info':'pend'}" style="margin-left:5px">${d.against===d.renter?'ผู้เช่า':'ผู้ปล่อยเช่า'}</span>`:''}</div></div>
      <div class="dt-box"><div class="l">มูลค่าที่พิพาท</div><div class="v" style="color:#2f5ae0">${esc(d.amt)}</div></div>
      <div class="dt-box"><div class="l">ค่าตอบแทนผู้พิพาท</div><div class="v" style="color:#0f8a52">+${admin.reward.toFixed(3)} ETH</div></div>
      ${d.claimedAt?`<div class="dt-box"><div class="l">ลงรับเคสเมื่อ</div><div class="v">${thDate(d.claimedAt)} · ${thTime(d.claimedAt)}</div></div>
      <div class="dt-box"><div class="l">กรอบเวลาพิจารณา</div><div class="v">${slaText(d)||'—'}</div></div>`:''}
      ${d.closedAt?`<div class="dt-box" style="grid-column:1/-1"><div class="l">ปิดเคสเมื่อ</div><div class="v">${thDate(d.closedAt)} · ${thTime(d.closedAt)}${isToday(d.closedAt)?' <span class="tag me" style="margin-left:5px">วันนี้</span>':''}</div></div>`:''}
    </div>
    <div class="dt-reason"><b>รายละเอียดจากผู้ยื่น</b><br>${esc(d.reason)}</div>
    ${(d.photos&&d.photos.length)?`<div style="font-size:12.5px;font-weight:800;margin-top:16px;font-family:'Noto Sans Thai',sans-serif">รูปหลักฐานจากผู้ยื่น · ${d.photos.length} รูป <span style="font-weight:600;color:var(--muted)">(กดเพื่อดูเต็ม)</span></div>
    <div class="ev-grid">${d.photos.map((ph,i)=>`<img src="${ph.url}" alt="${esc(ph.name||'หลักฐาน')}" onclick="zoomEvidence('${d.id}',${i})">`).join('')}</div>`:''}
    ${(me&&conflict)?`<div class="conflict-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><div><b>คุณเป็นคู่กรณีในเคสนี้ — รับและตัดสินไม่ได้</b><br>${esc(CONFLICT_SUB)} ระบบจะส่งเคสนี้ให้ผู้พิพาทคนอื่นในระบบพิจารณาแทน</div></div>`:''}
    ${d.esc?`<div style="font-size:12.5px;font-weight:800;margin-top:16px;font-family:'Noto Sans Thai',sans-serif">เงินที่ล็อกอยู่ในสัญญา (escrow)</div>${escTable(d.esc)}`:''}
    ${d.verdict?`<div class="diff down" style="margin-top:12px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg><div><b>ผลตัดสิน:</b> ${esc(d.verdict)}</div></div>`:''}
    <div class="m-actions">
      ${canClaim?`<button class="btn-lg btn-primary" onclick="closeModal();claimCase('${d.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>ลงรับเคสนี้เป็นผู้พิพาท</button>`:''}
      ${(isMine&&d.st==='open')?`<button class="btn-lg btn-primary" onclick="closeModal();go('dispute')">ไปตัดสินเคสนี้</button>`:''}
      <button class="btn-lg btn-ghost" onclick="closeModal()">ปิด</button>
    </div>
  </div>`);
}
let pendingJudge=null;
function judge(id,outcome){
  if(!requireWallet())return;
  if(admin.paused){toast('err','สัญญาถูกหยุดชั่วคราว','Admin สั่ง pause() อยู่ — ปล่อยเงินจาก escrow ไม่ได้');return;}
  const me=myArb();
  if(!me){toast('err','คุณยังไม่ใช่ผู้พิพาท','สมัครและรอ Admin อนุมัติก่อนจึงจะตัดสินได้');return;}
  if(!okStake(me)){toast('err','ถูกพักสิทธิ์ · เงินประกันไม่พอ','เหลือ '+me.stake.toFixed(2)+' ETH จากขั้นต่ำ '+admin.minStake.toFixed(2)+' ETH');return;}
  const d=disputes.find(x=>x.id===id);if(!d)return;
  if(isParty(d)){toast('err','ตัดสินเคสนี้ไม่ได้ — คุณเป็นคู่กรณี',CONFLICT_SUB);renderDispute();return;}
  if(!d.arb){toast('err','ยังไม่ได้ลงรับเคสนี้','กด “ลงรับเคสนี้” ก่อนจึงจะตัดสินได้');return;}
  if(!eqAddr(d.arb,curAddr())){toast('err','ไม่ใช่เคสของคุณ','เคสนี้มี '+d.arbName+' เป็นผู้พิพาทอยู่แล้ว');return;}
  const e=d.esc||{rent:0,dep:0,bond:0,fee:0};
  const cap=cutCap(e,outcome), init=cap;
  pendingJudge={id,outcome,cut:init};
  showModal(`<div class="modal-body" style="padding-top:26px">
    <div style="display:flex;gap:13px;align-items:flex-start">
      <div class="cf-ico warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M6 7l-4 7h8zM18 7l-4 7h8z"/><path d="M4 7h16"/></svg></div>
      <div><h2 style="font-size:19px">ยืนยันคำตัดสิน</h2>
        <p class="m-sub">${d.id} · ${esc(d.item)} — คำตัดสินเป็นที่สิ้นสุด แก้ไขภายหลังไม่ได้</p></div>
    </div>
    <div class="cf-what" style="margin-top:14px">ผลตัดสิน: <b>${esc(OUTCOME[outcome])}</b></div>
    ${escTable(e)}
    <div class="cut-box">
      <div class="cut-h">
        <div>
          <div class="cut-l">จำนวนเงินที่หัก</div>
          <div class="cut-s">${esc(CUTFROM[outcome])} · ปรับได้ตามความเหมาะสมของเคส สูงสุด ${cap.toFixed(2)} ETH</div>
        </div>
        <div class="cut-in"><input id="cutNum" type="number" min="0" max="${cap}" step="0.01" value="${init.toFixed(2)}" oninput="setCut(this.value)"><span>ETH</span></div>
      </div>
      <input id="cutRange" class="cut-rng" type="range" min="0" max="${cap}" step="0.01" value="${init}" oninput="setCut(this.value)">
      <div class="cut-ticks">
        <button type="button" onclick="setCut(0)">ไม่หัก</button>
        <button type="button" onclick="setCut(${(cap*0.25).toFixed(3)})">25%</button>
        <button type="button" onclick="setCut(${(cap*0.5).toFixed(3)})">ครึ่งหนึ่ง</button>
        <button type="button" onclick="setCut(${(cap*0.75).toFixed(3)})">75%</button>
        <button type="button" onclick="setCut(${cap.toFixed(3)})">เต็มจำนวน</button>
      </div>
      <div class="cut-sum" id="cutSum"></div>
    </div>
    <div style="font-size:12.5px;font-weight:800;margin-top:16px;font-family:'Noto Sans Thai',sans-serif">เงินจะถูกจ่ายออกแบบนี้</div>
    <div id="payBox">${payPreview(e,outcome,init)}</div>
    <div class="diff same" style="margin-top:12px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
      <div>ตัดสินเสร็จคุณจะได้ค่าตอบแทน <b style="color:#0f8a52">+${admin.reward.toFixed(3)} ETH</b> และเครดิตเพิ่ม 1 แต้ม · ถ้าตัดสินไม่เป็นธรรม Admin ริบเงินประกันคุณได้</div>
    </div>
    <div class="m-actions">
      <button class="btn-lg btn-primary" onclick="commitJudge()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>ยืนยันคำตัดสิน</button>
      <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
    </div>
  </div>`);
  setCut(init);
}
function setCut(v){
  if(!pendingJudge)return;
  const d=disputes.find(x=>x.id===pendingJudge.id); if(!d)return;
  const e=d.esc||{rent:0,dep:0,bond:0,fee:0}, cap=cutCap(e,pendingJudge.outcome);
  let c=parseFloat(v); if(isNaN(c))c=0;
  c=+Math.max(0,Math.min(cap,c)).toFixed(3);
  pendingJudge.cut=c;
  const rng=$('#cutRange'), num=$('#cutNum'), box=$('#payBox'), sum=$('#cutSum');
  if(rng)rng.value=c;
  if(num&&document.activeElement!==num)num.value=c.toFixed(2);
  if(box)box.innerHTML=payPreview(e,pendingJudge.outcome,c);
  if(sum)sum.textContent=c>0
    ? ('หัก '+c.toFixed(3)+' ETH จาก'+(pendingJudge.outcome==='borrower'?'ผู้ปล่อยเช่า':'ผู้เช่า')+' (คิดเป็น '+(cap?Math.round(c/cap*100):0)+'% ของเพดาน '+cap.toFixed(2)+' ETH)')
    : 'ไม่หักเงินฝ่ายใด — คืนเงินทุกฝ่ายตามสัญญาเดิม';
}
function commitJudge(){
  if(!pendingJudge)return;
  const {id,outcome,cut}=pendingJudge; pendingJudge=null;
  const d=disputes.find(x=>x.id===id), me=myArb();
  if(!d||!me){closeModal();return;}
  if(onChain()){closeModal();sendTx('ยืนยันคำตัดสิน',c=>c.judge(d.chainId,outcome==='borrower'?1:2,ethers.parseEther(String(cut))));return;}
  const e=d.esc||{rent:0,dep:0,bond:0,fee:0}, r=settle(e,outcome,cut);
  d.st='closed'; d.closedAt=Date.now(); d.outcome=outcome; d.verdict=verdictText(outcome,r.cut); d.payout=r;
  me.cases++; me.earned=+((me.earned||0)+admin.reward).toFixed(3); me.rep=Math.min(100,(me.rep||100)+1);
  admin.rewardPaid=+(admin.rewardPaid+admin.reward).toFixed(3);
  if(curAddr()===me.addr){state.bal=+(state.bal+admin.reward).toFixed(3);updateWallet();}
  /* จ่ายตามฝั่งในสัญญา ไม่ใช่ตามว่าใครเป็นคนยื่นเรื่อง */
  const _rp=d.renter||d.by, _lp=d.lender||d.against||'';
  if(r.renter>0)refundTo(_rp,r.renter,'คำตัดสิน '+d.id+' · ส่วนของผู้เช่า');
  if(r.lender>0)refundTo(_lp,r.lender,'คำตัดสิน '+d.id+' · ส่วนของผู้ปล่อยเช่า');
  txs.unshift({h:randHash(),type:'Reward',item:'ค่าตอบแทนตัดสินเคส '+d.id,amt:'+'+admin.reward.toFixed(3)+' ETH',st:'ok',time:'เมื่อสักครู่'});
  notify(_rp,'⚖️','#e9f0ff','เคส '+d.id+' ตัดสินแล้ว',d.verdict+' · คุณได้รับ (ฝั่งผู้เช่า) '+r.renter.toFixed(2)+' ETH','dispute');
  if(_lp)notify(_lp,'⚖️','#fff3e2','เคส '+d.id+' ตัดสินแล้ว',d.verdict+' · คุณได้รับ (ฝั่งผู้ปล่อยเช่า) '+r.lender.toFixed(2)+' ETH','dispute');
  closeModal();renderDispute();renderArb();renderStats();renderNotifs();
  toast('ok','ตัดสินเคส '+id+' เรียบร้อย','หัก '+r.cut.toFixed(3)+' ETH · ผู้เช่า '+r.renter.toFixed(2)+' / ผู้ปล่อยเช่า '+r.lender.toFixed(2)+' ETH · คุณได้ +'+admin.reward.toFixed(3)+' ETH');
}
/* ---------- arbitrator overview ---------- */
function renderArb(){
  if(!$('#arbKpis'))return;
  const me=myArb(), ok=me&&okStake(me);
  const pool=openPool().filter(d=>!isParty(d)), mine=myCases();
  const closed=disputes.filter(d=>d.st==='closed'&&eqAddr(d.arb,curAddr()));
  const nb=$('#navArbBadge');
  if(nb){nb.textContent=mine.length||pool.length;nb.classList.toggle('on',!!ok&&(mine.length>0||pool.length>0));}

  /* --- 1. แถบสิทธิ์ --- */
  if(!me){
    $('#arbHero').innerHTML=`<div class="arb-hero"><div class="ava">?</div><div style="flex:1;min-width:230px">
      <div class="nm">คุณยังไม่ได้เป็นผู้พิพาท</div>
      <div class="sb">สมัครและวางเงินประกันอย่างน้อย ${admin.minStake.toFixed(2)} ETH ที่หน้า Dispute Center แล้วรอ Admin อนุมัติ</div></div>
      <div class="acts"><button class="tbtn p" onclick="go('dispute')">ไปหน้าสมัคร</button></div></div>`;
  }else{
    const margin=+(me.stake-admin.minStake).toFixed(3);
    const rank=[...admin.arbs].sort((a,b)=>b.cases-a.cases).findIndex(a=>a.addr===me.addr)+1;
    $('#arbHero').innerHTML=`<div class="arb-hero">
      <div class="ava">${esc(me.name.trim().charAt(0))}</div>
      <div style="flex:1;min-width:240px">
        <div class="nm">${esc(me.name)} <span class="tag ${ok?'ok':'bad'}" style="margin-left:6px">${ok?'ACTIVE':'SUSPENDED'}</span></div>
        <div class="sb">${esc(me.addr)} · เครดิต ${me.rep||100}/100 · อันดับ ${rank} จากผู้พิพาท ${admin.arbs.length} คน</div>
        <div class="stake-bar ${ok?'':'low'}"><i style="width:${Math.min(100,me.stake/Math.max(admin.minStake,0.01)*100)}%"></i></div>
        <div class="sb" style="margin-top:6px">เงินประกัน <b style="color:${ok?'#0f8a52':'#c0392b'}">${me.stake.toFixed(2)} ETH</b> / ขั้นต่ำ ${admin.minStake.toFixed(2)} ETH · เหลือเผื่อ ${margin.toFixed(2)} ETH</div>
        ${margin<=0.5?`<div class="arb-warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" style="width:17px;height:17px;flex:none;margin-top:1px"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>${margin<0?'<b>เงินประกันต่ำกว่าเกณฑ์</b> คุณถูกพักสิทธิ์ตัดสินจนกว่าจะเติมให้ถึงขั้นต่ำ':'<b>เงินประกันเฉียดเกณฑ์</b> ถ้า Admin ปรับขั้นต่ำขึ้นหรือคุณถูกริบประกันบางส่วน จะหลุดสิทธิ์ทันที ควรเติมเผื่อไว้'}</div></div>`:''}
      </div>
      <div class="acts">
        <button class="tbtn p" onclick="openTopUp()">เติมเงินประกัน</button>
        ${myExit()?`<button class="tbtn g" onclick="cancelExit()">ยกเลิกคำขอถอนตัว</button>`:`<button class="tbtn g" onclick="withdrawArb()">ขอถอนตัว · คืนประกัน</button>`}
      </div></div>
      ${myExit()?`<div class="arb-warn" style="background:#fff4f4;border-color:#ffd4d4;color:#9c2f22;margin:-6px 0 18px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" style="width:17px;height:17px;flex:none;margin-top:1px"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div><b>คำขอถอนตัวรอ Admin อนุมัติ</b> — เงินประกัน ${me.stake.toFixed(2)} ETH ยังล็อกอยู่ และคุณลงรับเคสใหม่ไม่ได้จนกว่าจะมีผล · ตัดสินเคสที่ถืออยู่ได้ตามปกติ</div></div>`:''}`;
  }

  /* --- 2. KPI --- */
  $('#arbKpis').innerHTML=[
    ['เคสรอรับในระบบ',pool.length,'ที่คุณรับได้'],
    ['เคสที่ถืออยู่',mine.length,mine.length?'ยังไม่ได้ตัดสิน':'ไม่มีงานค้าง'],
    ['ตัดสินแล้วทั้งหมด',me?me.cases:0,'ตลอดการเป็นผู้พิพาท'],
    ['คอมมิชชันสะสม',(me?(me.earned||0):0).toFixed(3)+' ETH','ครั้งละ '+admin.reward.toFixed(3)+' ETH']
  ].map(k=>`<div class="kpi"><div class="k-lbl">${k[0]}</div><div class="k-val">${k[1]}</div><div class="k-sub">${k[2]}</div></div>`).join('');

  /* --- 3. งานค้าง --- */
  $('#arbTodoCount').textContent=mine.length+' เคส';
  $('#arbTodoWrap').innerHTML=mine.length?mine.map(d=>`
    <div class="case-row">
      <div class="case-ic mine">${caseIcon()}</div>
      <div style="flex:1;min-width:230px">
        <div class="case-t">${d.id} · ${esc(d.item)} <span class="tag pend" style="margin-left:5px">${esc(d.type||'ข้อพิพาท')}</span></div>
        <div class="case-s">${esc(d.reason)}</div>
        <div class="case-m"><span>ผู้ยื่น: ${esc(d.by)}</span><span>คู่กรณี: ${esc(d.against||'—')}</span><span>มูลค่า: ${esc(d.amt)}</span>${slaText(d)}</div>
        <div class="arb-bar">
          <button class="tbtn p" onclick="judge('${d.id}','borrower')">⚖ ตัดสินให้ผู้เช่า</button>
          <button class="tbtn p" onclick="judge('${d.id}','lender')">⚖ ตัดสินให้ผู้ปล่อยเช่า</button>
          <button class="tbtn g" onclick="openCaseDetail('${d.id}')">ดูรายละเอียด</button>
        </div>
      </div>
    </div>`).join(''):emptyBox('ไม่มีงานค้าง','เคสที่คุณกดลงรับจะมารออยู่ตรงนี้ · ตอนนี้มี '+pool.length+' เคสในคิวให้เลือกรับ');

  /* --- 4. อัตราการตัดสิน --- */
  const nR=closed.filter(d=>d.outcome==='borrower').length, nL=closed.filter(d=>d.outcome==='lender').length, nT=nR+nL;
  const avgPc=nT?Math.round(closed.reduce((n,d)=>n+(d.payout&&d.payout.T?d.payout.cut/d.payout.T*100:0),0)/nT):0;
  const skew=nT>=4&&(nR/nT>=0.85||nL/nT>=0.85);
  $('#arbBias').innerHTML=nT?`
    <div class="bias-row">
      <div class="bias-l"><span class="tag info">ผู้เช่า</span>ตัดสินให้ผู้เช่า<span class="pc">${Math.round(nR/nT*100)}%</span></div>
      <div class="bias-bar r"><i style="width:${nR/nT*100}%"></i></div>
    </div>
    <div class="bias-row">
      <div class="bias-l"><span class="tag pend">ผู้ปล่อยเช่า</span>ตัดสินให้ผู้ปล่อยเช่า<span class="pc">${Math.round(nL/nT*100)}%</span></div>
      <div class="bias-bar l"><i style="width:${nL/nT*100}%"></i></div>
    </div>
    <div class="bias-row" style="color:var(--muted);font-size:12.5px;font-family:'Noto Sans Thai',sans-serif;line-height:1.65">
      หักเฉลี่ย <b style="color:#c0392b">${avgPc}%</b> ของเงินที่ล็อกไว้ จาก ${nT} เคสที่ตัดสินไป
      ${skew?'<br><b style="color:#c0392b">สัดส่วนเอนไปทางฝ่ายเดียวมาก</b> — Admin ใช้ตัวเลขนี้ตรวจสอบความเป็นกลางได้':'<br>สัดส่วนยังอยู่ในเกณฑ์สมดุล'}
    </div>`:emptyBox('ยังไม่มีสถิติ','ตัดสินเคสแรกให้เสร็จก่อน ระบบจะเริ่มเก็บสัดส่วนการตัดสินให้อัตโนมัติ');

  /* --- 5. กฎที่ผูกกับฉัน --- */
  $('#arbRules').innerHTML=[
    ['ค่าตอบแทนต่อเคส','จ่ายเมื่อปิดเคสสำเร็จ',admin.reward.toFixed(3)+' ETH'],
    ['เงินประกันขั้นต่ำ','ต่ำกว่านี้ถูกพักสิทธิ์อัตโนมัติ',admin.minStake.toFixed(2)+' ETH'],
    ['ค่าธรรมเนียมแพลตฟอร์ม','หักจากค่าเช่าทุกสัญญา',admin.fee.toFixed(2)+'%'],
    ['เงื่อนไขถูกริบประกัน','ตัดสินไม่เป็นธรรม หรือดองเคสไว้',admin.slashed>0?'ริบไปแล้ว '+admin.slashed.toFixed(2)+' ETH':'ยังไม่เคยถูกริบ']
  ].map(r=>`<div class="rule-row"><div style="flex:1;min-width:150px"><div class="rl">${r[0]}</div><div class="rs">${r[1]}</div></div><span class="rv">${r[2]}</span></div>`).join('');

  /* --- 6. ประวัติคำตัดสิน --- */
  $('#arbVerdictCount').textContent=closed.length+' เคส';
  $('#arbVerdicts').innerHTML=closed.length?closed.map(d=>`
    <div class="vrow">
      <div class="vi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg></div>
      <div style="flex:1;min-width:200px">
        <div class="vt">${d.id} · ${esc(d.item)}</div>
        <div class="vs">${esc(d.verdict||'—')}<br>ปิดเมื่อ ${d.closedAt?thDate(d.closedAt)+' · '+thTime(d.closedAt):'—'}${d.closedAt&&isToday(d.closedAt)?' <span class="tag me">วันนี้</span>':''}</div>
      </div>
      <div class="vcut"><div class="cv">-${d.payout?d.payout.cut.toFixed(3):'0.000'}</div><div class="cl">ETH ที่หัก</div></div>
    </div>`).join(''):emptyBox('ยังไม่มีประวัติคำตัดสิน','เคสที่คุณตัดสินเสร็จจะถูกบันทึกไว้ที่นี่พร้อมจำนวนเงินที่หัก ใช้อ้างอิงย้อนหลังได้');

  /* --- 7. รายได้และเงินประกัน --- */
  /* หน้าภาพรวมผู้พิพาท: เฉพาะธุรกรรมของ address ที่ใช้อยู่ */
  const _me=String(curAddr()||'').toLowerCase();
  const at=txs.filter(t=>ARB_TX.includes(t.type)&&((!t.onchain||!t.who||!t.who.length)||t.who.includes(_me)));
  $('#arbTxTable').innerHTML=`<thead><tr><th>Tx Hash</th><th>ประเภท</th><th>รายการ</th><th>จำนวน</th><th>เวลา</th></tr></thead><tbody>${
    at.length?at.map(t=>`<tr><td><code class="hash">${t.h}</code></td><td><div style="font-weight:700;font-family:'Noto Sans Thai',sans-serif">${esc(txLabel(t.type))}</div><div style="font-size:10.5px;color:#98a2bf;margin-top:2px">${t.type}</div></td><td>${esc(t.item)}</td>
    <td style="font-weight:700;color:${t.amt.startsWith('+')?'#0f8a52':t.amt.startsWith('-')?'#c0392b':'#5e6b89'}">${t.amt}</td>
    <td style="color:#7a86a8">${t.time}</td></tr>`).join('')
    :`<tr><td colspan="5" style="padding:0">${emptyBox('ยังไม่มีธุรกรรม','คอมมิชชันและการเติม-ถอนเงินประกันจะมาแสดงที่นี่')}</td></tr>`}</tbody>`;
}

/* ---------- admin ---------- */
function renderAdmin(){
  if(!$('#adminKpis'))return;
  $('#adminBanner').innerHTML=roleBanner();
  $('#adminKpis').innerHTML=[
    ['ค่าธรรมเนียมแพลตฟอร์ม',admin.fee+'%','หักจากค่าเช่าทุกสัญญา'],
    ['ผู้พิพาทในระบบ',admin.arbs.filter(okStake).length+' / '+admin.arbs.length,'ใช้งานได้ / ทั้งหมด'],
    ['สถานะสัญญา',admin.paused?'Paused':'Active',admin.paused?'หยุดทุกธุรกรรมอยู่':'ทำงานปกติ'],
    ['เคสที่รอตัดสิน',disputes.filter(d=>d.st==='open').length,'ส่งต่อให้ Arbitrator'],
    ['เงินประกันรวมในระบบ',admin.arbs.reduce((t,a)=>t+a.stake,0).toFixed(2)+' ETH','ล็อกไว้ใน escrow ของสัญญา'],
    ['ริบ / จ่ายตอบแทน',admin.slashed.toFixed(2)+' / '+admin.rewardPaid.toFixed(2),'ETH · ริบเข้าคลัง / จ่ายผู้พิพาท']
  ].map(k=>`<div class="kpi"><div class="k-lbl">${k[0]}</div><div class="k-val">${k[1]}</div><div class="k-sub">${k[2]}</div></div>`).join('');
  $('#adminSettings').innerHTML=`
    <div class="admin-row">
      <div style="flex:1"><div class="al">ค่าธรรมเนียมแพลตฟอร์ม</div><div class="as">setPlatformFee(uint256) · สูงสุด 10%</div></div>
      <div class="val-pill">${admin.fee.toFixed(2)}%</div>
      <button class="tbtn p" onclick="openEditSetting('fee')">แก้ไข</button>
    </div>
    <div class="admin-row">
      <div style="flex:1"><div class="al">เงินประกันขั้นต่ำของผู้พิพาท</div><div class="as">setMinStake(uint256) · เกณฑ์รับสมัคร และต่ำกว่านี้จะถูกพักสิทธิ์อัตโนมัติ</div></div>
      <div class="val-pill">${admin.minStake.toFixed(2)} ETH</div>
      <button class="tbtn p" onclick="openEditSetting('minStake')">แก้ไข</button>
    </div>
    <div class="admin-row">
      <div style="flex:1"><div class="al">ค่าตอบแทนผู้พิพาท (ต่อเคส)</div><div class="as">setArbitratorReward(uint256) · จ่ายจากค่าธรรมเนียมแพลตฟอร์มเมื่อปิดเคสสำเร็จ</div></div>
      <div class="val-pill">${admin.reward.toFixed(3)} ETH</div>
      <button class="tbtn p" onclick="openEditSetting('reward')">แก้ไข</button>
    </div>
    <div class="admin-row">
      <div style="flex:1"><div class="al">เปิดรับสมัครผู้พิพาท</div><div class="as">setApplicationsOpen(bool) · ปิดแล้วจะไม่มีใครยื่นใบสมัครใหม่ได้ ใบที่ค้างอยู่ยังพิจารณาได้ตามปกติ</div></div>
      <div class="switch ${admin.openApply?'on':''}" onclick="toggleApply()"></div>
    </div>
    <div class="admin-row">
      <div style="flex:1"><div class="al">หยุดสัญญาฉุกเฉิน (Circuit Breaker)</div><div class="as">pause() · บล็อกการยืมและการลงของทั้งระบบ</div></div>
      <div class="switch ${admin.paused?'on':''}" onclick="togglePause()"></div>
    </div>`;
  $('#appCount').textContent=admin.apps.length+' ใบ';
  $('#appList').innerHTML=admin.apps.map((p,i)=>`
    <div class="admin-row">
      <div class="arb-ava" style="background:linear-gradient(145deg,#cfe0ff,#7aa2f7);color:#1b3a7a">${esc(p.name.trim().charAt(0))}</div>
      <div style="flex:1;min-width:210px">
        <div class="al">${esc(p.name)}<span class="pos-tag" style="color:#2b53cf;background:#e9f0ff">สมัคร: ผู้พิพาท</span></div>
        <div class="as">วางประกันแล้ว <b style="color:#0f8a52">${p.stake.toFixed(2)} ETH</b> · ยื่นเมื่อ ${p.date}</div>
        <div class="as" style="margin-top:4px;max-width:540px">“${esc(p.exp)}”</div>
      </div>
      <span class="addr-pill">${esc(p.addr)}</span>
      <button class="tbtn g" onclick="openAppDetail(${i})">ดูรายละเอียด</button>
      <button class="tbtn p" onclick="approveApp(${i})">อนุมัติ</button>
      <button class="tbtn g" onclick="rejectApp(${i})">ปฏิเสธ · คืนเงิน</button>
    </div>`).join('')||emptyBox('ยังไม่มีใบสมัครใหม่','ผู้สนใจสมัครได้เองที่หน้า Dispute → สมัครเป็นผู้พิพาท');
  $('#exitCount').textContent=admin.exits.length+' คำขอ';
  $('#exitList').innerHTML=admin.exits.map((x,i)=>{
    const held=disputes.filter(d=>d.st==='open'&&eqAddr(d.arb,x.addr)).length;
    return `<div class="admin-row">
      <div class="arb-ava" style="background:linear-gradient(145deg,#ffd9d9,#f08a8a);color:#7a1d1d">${esc(x.name.trim().charAt(0))}</div>
      <div style="flex:1;min-width:210px">
        <div class="al">${esc(x.name)}<span class="pos-tag" style="color:#c0392b;background:#fff4f4">ขอถอนตัว</span></div>
        <div class="as">เงินประกันที่ต้องคืน <b style="color:#0f8a52">${x.stake.toFixed(2)} ETH</b> · ตัดสินไปแล้ว ${x.cases} เคส · ยื่นเมื่อ ${esc(x.date)}</div>
        <div class="as" style="margin-top:4px">เหตุผล: “${esc(x.reason)}”</div>
        ${held?`<div class="as" style="margin-top:4px;color:#c0392b"><b>ยังถือเคสค้าง ${held} เคส</b> — อนุมัติไม่ได้จนกว่าจะตัดสินเสร็จ</div>`:''}
      </div>
      <span class="addr-pill">${esc(x.addr)}</span>
      <button class="tbtn p" ${held?'disabled':''} onclick="approveExit(${i})">อนุมัติ · คืนประกัน</button>
      <button class="tbtn g" onclick="rejectExit(${i})">ปฏิเสธ</button>
    </div>`}).join('')||emptyBox('ไม่มีคำขอถอนตัว','ถ้าผู้พิพาทขอถอนตัว คำขอจะมารออนุมัติที่นี่ เงินประกันจะยังไม่ถูกปล่อยจนกว่าคุณจะกดอนุมัติ');
  $('#arbList').innerHTML=admin.arbs.map((a,i)=>{const ok=okStake(a);return `
    <div class="admin-row">
      <div class="arb-ava" style="${ok?'':'filter:grayscale(1);opacity:.6'}">${esc(a.name.trim().charAt(0))}</div>
      <div style="flex:1;min-width:180px">
        <div class="al">${esc(a.name)}<span class="pos-tag">⚖ ผู้พิพาท</span></div>
        <div class="as">เงินประกัน <b style="color:${ok?'#0f8a52':'#c0392b'}">${a.stake.toFixed(2)} ETH</b> / ขั้นต่ำ ${admin.minStake.toFixed(2)} · ตัดสิน ${a.cases} เคส · ได้ค่าตอบแทน <b style="color:#0f8a52">+${(a.earned||0).toFixed(2)} ETH</b> · เครดิต ${a.rep||100}/100</div>
        <div class="stake-bar ${ok?'':'low'}"><i style="width:${Math.min(100,a.stake/Math.max(admin.minStake,0.01)*100)}%"></i></div>
      </div>
      <span class="addr-pill">${esc(a.addr)}</span>
      <span class="tag ${ok?'ok':'bad'}">${ok?'ACTIVE':'SUSPENDED'}</span>
      ${admin.exits.some(x=>x.addr===a.addr)?`<span class="tag pend">ขอถอนตัว</span>`:''}
      <button class="tbtn g" style="color:#c0392b;border-color:#ffd4d4;background:#fff4f4" onclick="openSlash(${i})">ริบประกัน</button>
      <button class="tbtn g" onclick="revokeArb(${i})">ถอดสิทธิ์</button>
    </div>`}).join('')||emptyBox('ยังไม่มีผู้พิพาทในระบบ','รอผู้ใช้สมัครเองจากหน้า Dispute Center');
}
function openCatManager(){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin จัดการหมวดหมู่ได้');return;}
  const rc=realCats();
  showModal(`<div class="modal-body" style="padding-top:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2>จัดการหมวดหมู่</h2><p class="m-sub">addCategory() / removeCategory() · หมวดที่เพิ่มจะใช้ได้ทันทีทั้งหน้าแรก หน้า Browse และตอนลงทะเบียนสิ่งของ</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div style="margin-top:18px">
      <div class="f2">
        <div class="field" style="margin-bottom:0"><label>ชื่อไทย <span style="color:#c0392b">*</span></label><input id="c-th" placeholder="เครื่องดนตรี" autocomplete="off"></div>
        <div class="field" style="margin-bottom:0"><label>ชื่ออังกฤษ <span style="color:#98a2bf;font-weight:600">(ไม่บังคับ)</span></label><input id="c-en" placeholder="Music" autocomplete="off"></div>
      </div>
      <div class="hint" style="margin-bottom:14px">กรอกภาษาไทยได้เลย · ชื่อทั้งสองภาษาถูกเก็บลงสัญญาบนเชน ถ้าไม่ใส่ชื่ออังกฤษระบบจะใช้ชื่อไทยแสดงทั้งสองที่</div>
      <button class="btn-lg btn-primary" style="width:100%" onclick="addCategory()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>เพิ่มหมวดหมู่</button>
      <div style="font-size:12.5px;font-weight:800;margin-top:20px;font-family:'Noto Sans Thai',sans-serif">หมวดหมู่ในระบบ · ${rc.length} หมวด</div>
      <div class="esc-tb" style="margin-top:10px">${rc.map(c=>{const n=catCount(c.id);return `
        <div class="esc-r">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;color:#7a86a8;flex:none">${c.ic}</svg>
          <div style="flex:1"><b>${esc(c.en)}</b> · ${esc(c.th)}<div style="font-size:11px;color:var(--muted);margin-top:2px">รหัส ${esc(c.id)} · มีสิ่งของ ${n} รายการ</div></div>
          <button class="tbtn g" style="flex:none;${n?'':'color:#c0392b;border-color:#ffd4d4;background:#fff4f4'}" ${n?'disabled':''} onclick="removeCategory('${c.id}')">${n?'มีของอยู่':'ลบ'}</button>
        </div>`}).join('')||'<div class="esc-r" style="color:var(--muted)">ยังไม่มีหมวดหมู่ในระบบ</div>'}</div>
      <div class="notice" style="margin-top:14px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>หมวดที่ยังมีสิ่งของอยู่จะลบไม่ได้ ต้องย้ายของออกก่อน เพื่อไม่ให้มีสิ่งของค้างอยู่ในหมวดที่ถูกลบ</div></div>
    </div></div>`);
  setTimeout(()=>$('#c-th')?.focus(),80);
}
function addCategory(){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin เพิ่มหมวดหมู่ได้');return;}
  const thRaw=($('#c-th').value||'').trim(), enRaw=($('#c-en').value||'').trim();
  if(!thRaw){toast('err','ยังไม่ได้ใส่ชื่อหมวด','กรอกชื่อไทยก่อน · ชื่ออังกฤษไม่บังคับ');$('#c-th').focus();return;}
  if(thRaw.includes('|')||enRaw.includes('|')){toast('err','ใช้เครื่องหมาย | ไม่ได้','เครื่องหมายนี้ถูกใช้แยกชื่อสองภาษาในสัญญา');return;}
  const th=thRaw, en=enRaw||thRaw;
  const id=catId(en,th);
  if(CATS.some(c=>c.id===id)||CHAIN_CATS.some(c=>c.id===id)){toast('err','มีหมวดนี้อยู่แล้ว','ชื่อนี้ซ้ำกับหมวดที่มีในระบบ');return;}
  if(onChain()){closeModal();sendTx('เพิ่มหมวดหมู่',c=>c.addCategory(packCat(en,th)));return;}
  /* แทรกก่อน More เสมอ เพื่อให้ More เป็นปุ่มกางท้ายแถวตลอด */
  CATS.splice(CATS.findIndex(c=>c.id==='more'),0,{id,en,th,ic:CAT_ICON});
  notify('all','🏷️','#eef3ff','มีหมวดหมู่ใหม่ในระบบ',en+' · '+th+' — เลือกหมวดนี้ได้แล้วตอนลงทะเบียนสิ่งของ');
  renderCats();renderPopular();if(state.page==='browse')renderBrowse();renderNotifs();openCatManager();
  toast('ok','เพิ่มหมวดหมู่แล้ว',en+' · '+th+' · รหัส '+id);
}
/* ยืนยันก่อนลบหมวดหมู่จากหน้าแรก — ลบจริงบนเชน เสียค่าแก๊ส ย้อนกลับไม่ได้ */
function askRemoveCategory(id){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin ลบหมวดหมู่ได้');return;}
  const c=CATS.find(x=>x.id===id); if(!c)return;
  const n=catCount(id);
  if(n){toast('err','ลบหมวดนี้ไม่ได้','ยังมีสิ่งของ '+n+' รายการอยู่ในหมวด '+c.th+' · ย้ายหรือถอนของออกก่อน');return;}
  showModal(`<div class="modal-body" style="padding-top:24px">
    <h2>ลบหมวดหมู่นี้?</h2>
    <p class="m-sub">removeCategory() · ธุรกรรมจริงบนสัญญา เสียค่าแก๊ส และย้อนกลับไม่ได้</p>
    <div class="esc-tb" style="margin-top:16px">
      <div class="esc-r"><span>หมวดหมู่</span><b>${esc(c.th)}${c.en!==c.th?' · '+esc(c.en):''}</b></div>
      <div class="esc-r"><span>สิ่งของในหมวดนี้</span><b>0 รายการ</b></div>
      <div class="esc-r"><span>รหัสบนสัญญา</span><b style="font-size:11px">${esc(String(catHash(id)||'—')).slice(0,20)}…</b></div>
    </div>
    <div class="notice" style="margin-top:14px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>ถ้าอยากใช้หมวดนี้อีกต้องเพิ่มใหม่และเสียค่าแก๊สอีกครั้ง · ของเก่าที่เคยอยู่ในหมวดนี้ไม่ได้รับผลกระทบ</div></div>
    <div class="m-actions" style="margin-top:20px">
      <button class="btn-lg btn-ghost" style="color:#c0392b;border-color:#ffd4d4" onclick="removeCategory('${id}')">ยืนยันลบ · ส่งธุรกรรม</button>
      <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
    </div></div>`);
}
function removeCategory(id){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin ลบหมวดหมู่ได้');return;}
  const c=CATS.find(x=>x.id===id); if(!c)return;
  const n=catCount(id);
  if(n){toast('err','ลบหมวดนี้ไม่ได้','ยังมีสิ่งของ '+n+' รายการอยู่ในหมวด '+c.th+' · ย้ายของออกก่อน');return;}
  if(onChain()){
    const h=catHash(id); closeModal();
    if(!h){toast('err','ไม่พบหมวดนี้บนสัญญา','อาจเป็นหมวดที่ยังไม่ซิงก์ · กด “อ่านค่าจากเชน” ในหน้า Admin แล้วลองใหม่');return;}
    sendTx('ลบหมวดหมู่',x=>x.removeCategory(h)); return;
  }
  CATS=CATS.filter(x=>x.id!==id);
  if(state.cat===id)state.cat='all';
  notify('all','🏷️','#fff3e2','หมวดหมู่ถูกยกเลิก',c.en+' · '+c.th+' — ถูกนำออกจากระบบแล้ว');
  renderCats();renderPopular();if(state.page==='browse')renderBrowse();renderNotifs();openCatManager();
  toast('ok','ลบหมวดหมู่แล้ว',c.en+' · '+c.th);
}
function togglePause(){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin เท่านั้น');return;}
  if(onChain()){sendTx(admin.paused?'เปิดสัญญาอีกครั้ง':'หยุดสัญญาฉุกเฉิน',c=>c.setPaused(!admin.paused));return;}
  admin.paused=!admin.paused;renderAdmin();
  admin.paused?toast('err','หยุดสัญญาแล้ว','ทุกคนยืมของและลงของไม่ได้ชั่วคราว'):toast('ok','เปิดสัญญาอีกครั้ง','ระบบกลับมาทำงานปกติ');
}
function syncApplyUI(){
  const q=$('#qaApply');
  if(q)q.style.display=(admin.openApply&&canApplyArb()&&chainRole()!=='arbitrator'&&!myArb()&&!myApp())?'':'none';
  /* ผู้พิพาทเปิดข้อพิพาทเองไม่ได้ — ไม่ได้เป็นผู้เช่าหรือผู้ปล่อยเช่าในสัญญาใด */
  const hide=!canOpenDispute();
  const b=$('#btnNewDispute'); if(b)b.style.display=hide?'none':'';
  const qd=$('#qaDispute'); if(qd)qd.style.display=hide?'none':'';
  const ql=$('#qaList'); if(ql)ql.style.display=isRenter()?'':'none';
  const qb=$('#qaBrowse'); if(qb)qb.style.display=isRenter()?'':'none';
}

/* ประกาศเป็น function declaration เพื่อให้ hoist ขึ้นไปก่อน syncApplyUI ถูกเรียกตอนโหลด */
/* เปิดข้อพิพาทได้เฉพาะคู่สัญญาเช่าจริง — ผู้พิพาทและ Admin ไม่ได้เป็นคู่สัญญา */
function canOpenDispute(){return state.role==='user';}
/* เป็นคู่สัญญาเช่าได้เฉพาะผู้ใช้ทั่วไป — Admin กำกับดูแล ผู้พิพาทตัดสิน ทั้งคู่ไม่ลงเล่นเอง */
function isRenter(){return state.role==='user';}
/* ป้องกันเจ้าของเช่าสิ่งของของตัวเอง: ตรวจทั้ง flag ของรายการและ wallet address เจ้าของ */
function isOwnItem(it){
  if(!it)return false;
  const owner=String(it.owner||'').toLowerCase();
  const me=String(ME||'').toLowerCase();
  return it.mine===true || (!!owner && owner===me);
}
/* แยกอำนาจ: Admin ตั้งกฎและอนุมัติใบสมัคร จึงสมัครเป็นผู้พิพาทเองไม่ได้ */
function canApplyArb(){return state.role!=='admin';}
function renderArbPanel(){
  syncApplyUI();
  const p=$('#arbPanel'); if(!p)return;
  const me=myArb(), ok=me&&okStake(me), pend=myApp();
  if(!me&&!canApplyArb()){p.innerHTML='';return;}
  if(!me&&pend){
    p.innerHTML=`<div class="apply-card" style="border-color:#ffe3b8;background:#fffaf2">
      <div class="apply-ico" style="background:linear-gradient(145deg,#ffe3b8,#f0a132);color:#7a4705">${esc(pend.name.trim().charAt(0))}</div>
      <div style="flex:1;min-width:260px">
        <h3>${esc(pend.name)} <span class="tag pend" style="margin-left:6px">รออนุมัติ</span></h3>
        <div class="ap-s">ใบสมัครของคุณยื่นเรียบร้อยแล้ว กำลังรอ Admin พิจารณา — ถ้าผ่านจะเริ่มตัดสินเคสได้ทันที ถ้าไม่ผ่านจะได้เงินประกันคืนเต็มจำนวน</div>
        <div class="req">
          <div>เงินประกันที่ล็อกไว้<b style="color:#0f8a52">${pend.stake.toFixed(2)} ETH</b></div>
          <div>ยื่นเมื่อ<b>${pend.date}</b></div>
          <div>ค่าตอบแทนต่อเคส<b style="color:#0f8a52">+${admin.reward.toFixed(2)} ETH</b></div>
        </div>
      </div>
    </div>`;
    return;
  }
  /* การ์ดสมัครมีไว้สำหรับ User เท่านั้น — เป็นผู้พิพาทแล้วไม่ต้องสมัครซ้ำ
     และ Admin สมัครไม่ได้อยู่แล้วเพราะต้องแยกอำนาจ */
  if(!canApplyArb()||chainRole()==='arbitrator'){p.innerHTML='';return;}
  if(!me&&!admin.openApply){p.innerHTML='';return;}
  if(!me){
    p.innerHTML=`<div class="apply-card">
      <div class="apply-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M6 7l-4 7h8zM18 7l-4 7h8z"/><path d="M4 7h16"/></svg></div>
      <div style="flex:1;min-width:260px">
        <h3>${admin.openApply?'เปิดรับสมัครผู้พิพาท — ใครก็สมัครได้':'ปิดรับสมัครผู้พิพาทชั่วคราว'} ${admin.openApply?'':'<span class="closed-note">ปิดรับอยู่</span>'}</h3>
        <div class="ap-s">${admin.openApply?'เปิดรับทุกกระเป๋า ไม่ต้องรอใครชวน — วางเงินประกันให้ครบเกณฑ์แล้วยื่นสมัคร Admin จะคัดเลือกจากผู้สมัครและอนุมัติให้เริ่มตัดสินเคส':'ขณะนี้ Admin ปิดรับใบสมัครใหม่ชั่วคราว ติดตามประกาศเปิดรับรอบถัดไปได้ที่กระดิ่งแจ้งเตือนมุมขวาบน'}</div>
        <div class="req">
          <div>เงินประกันขั้นต่ำ<b>${admin.minStake.toFixed(2)} ETH</b></div>
          <div>ค่าตอบแทนต่อเคส<b>+${admin.reward.toFixed(2)} ETH</b></div>
          <div>ยอดในกระเป๋าคุณ<b style="color:${state.bal>=admin.minStake?'#0f8a52':'#c0392b'}">${state.bal.toFixed(3)} ETH</b></div>
          <div>ผู้พิพาทในระบบ<b>${admin.arbs.length} คน</b></div>
        </div>
      </div>
      <button class="btn-lg btn-primary" style="flex:0 0 auto;padding:14px 26px${admin.openApply?'':';opacity:.45;cursor:not-allowed'}" ${admin.openApply?'onclick="openApply()"':'disabled'}>${admin.openApply?'สมัครเป็นผู้พิพาท':'ปิดรับสมัคร'}</button>
    </div>`;
  }else{
    p.innerHTML=`<div class="apply-card mine">
      <div class="apply-ico" style="${ok?'':'filter:grayscale(1)'}">${esc(me.name.trim().charAt(0))}</div>
      <div style="flex:1;min-width:260px">
        <h3>${esc(me.name)} <span class="tag ${ok?'ok':'bad'}" style="margin-left:6px">${ok?'ACTIVE':'SUSPENDED'}</span>${myExit()?'<span class="tag pend" style="margin-left:5px">รออนุมัติถอนตัว</span>':''}</h3>
        <div class="ap-s">${ok?'คุณมีสิทธิ์ตัดสินเคสที่เปิดอยู่ ทุกเคสที่ตัดสินจะได้ค่าตอบแทนเข้ากระเป๋าทันที':'เงินประกันต่ำกว่าเกณฑ์ ตัดสินไม่ได้จนกว่าจะเติมให้ครบ'}</div>
        <div class="req">
          <div>เงินประกันของคุณ<b style="color:${ok?'#0f8a52':'#c0392b'}">${me.stake.toFixed(2)} ETH</b></div>
          <div>ขั้นต่ำที่ต้องมี<b>${admin.minStake.toFixed(2)} ETH</b></div>
          <div>ตัดสินไปแล้ว<b>${me.cases} เคส</b></div>
          <div>ค่าตอบแทนสะสม<b style="color:#0f8a52">+${(me.earned||0).toFixed(2)} ETH</b></div>
          <div>คะแนนความน่าเชื่อถือ<b>${me.rep||100}/100</b></div>
        </div>
      </div>
      <div style="display:flex;gap:9px;flex-wrap:wrap">
        <button class="tbtn p" style="padding:12px 18px;font-size:13px" onclick="openTopUp()">เติมเงินประกัน</button>
        ${myExit()?`<button class="tbtn g" style="padding:12px 18px;font-size:13px" onclick="cancelExit()">ยกเลิกคำขอถอนตัว</button>`:`<button class="tbtn g" style="padding:12px 18px;font-size:13px" onclick="withdrawArb()">ขอถอนตัว</button>`}
      </div>
    </div>`;
  }
}
/* ผู้พิพาทต้องไม่มีส่วนได้เสียในระบบ — ของที่ปล่อยเช่าค้างอยู่ ของที่กำลังยืม
   หรือข้อพิพาทที่ตัวเองเป็นคู่กรณี ล้วนทำให้ตัดสินอย่างเป็นกลางไม่ได้ */
function arbBlockers(){
  const me=curAddr();
  const lent=items.filter(i=>i.mine&&i.st!=='closed');
  const bor=items.filter(i=>i.mineBorrow);
  const dis=disputes.filter(d=>d.st==='open'&&(d.by===me||d.against===me||d.renter===me||d.lender===me));
  return {lent,bor,dis,total:lent.length+bor.length+dis.length};
}
function showArbBlocked(b){
  const li=(t,arr,how)=>arr.length?`<div class="esc-r" style="align-items:flex-start">
      <div style="flex:1"><b>${t} · ${arr.length} รายการ</b>
        <div style="font-size:11.5px;color:var(--muted);margin-top:3px">${arr.map(x=>esc(x.name||x.item||'—')).join(' · ')}</div>
        <div style="font-size:11.5px;color:#2b53cf;margin-top:3px">${how}</div></div></div>`:'';
  showModal(`<div class="modal-body" style="padding-top:24px">
    <h2>ยังสมัครเป็นผู้พิพาทไม่ได้</h2>
    <p class="m-sub">ผู้ตัดสินต้องไม่มีส่วนได้เสียในระบบ · เคลียร์รายการคงค้างให้หมดก่อน</p>
    <div class="esc-tb" style="margin-top:16px">
      ${li('ของที่คุณปล่อยให้เช่า',b.lent,'ไปที่ My Items แล้วกด “ถอนของออก” (delistItem) เพื่อรับเงินประกันคืน · ของที่ติดสัญญาอยู่ต้องรอปิดสัญญาก่อน')}
      ${li('ของที่คุณกำลังยืม',b.bor,'ส่งคืนของแล้วรอคู่สัญญาตรวจรับให้ปิดสัญญา')}
      ${li('ข้อพิพาทที่คุณเป็นคู่กรณี',b.dis,'รอผู้พิพาทคนอื่นตัดสินเคสให้จบก่อน')}
    </div>
    <div class="notice" style="margin-top:14px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>ถ้าคุณยังเป็นผู้เช่าหรือผู้ปล่อยเช่าอยู่ คุณอาจถูกสุ่มให้ตัดสินเคสที่กระทบกับของตัวเอง ระบบจึงกันไว้ตั้งแต่ขั้นสมัคร เพื่อให้คำตัดสินเป็นกลางจริง</div></div>
    <div class="m-actions" style="margin-top:20px">
      <button class="btn-lg btn-primary" onclick="closeModal();go('myitems')">ไปเคลียร์รายการของฉัน</button>
      <button class="btn-lg btn-ghost" onclick="closeModal()">ปิด</button>
    </div></div>`);
}
function openApply(){
  if(!canApplyArb()){toast('err','Admin สมัครเป็นผู้พิพาทไม่ได้','ผู้ที่อนุมัติใบสมัครและริบเงินประกันได้ จะเป็นผู้ตัดสินเคสเองไม่ได้ เพื่อแยกอำนาจออกจากกัน');return;}
  if(!admin.openApply){toast('err','ปิดรับสมัครชั่วคราว','ขณะนี้ Admin ปิดรับใบสมัครผู้พิพาทอยู่ กรุณาติดตามประกาศอีกครั้ง');return;}
  if(myArb()){toast('info','คุณเป็นผู้พิพาทอยู่แล้ว','wallet นี้อยู่ในระบบแล้ว');return;}
  const _b=arbBlockers();
  if(_b.total){showArbBlocked(_b);return;}
  showModal(`<div class="modal-body" style="padding-top:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2>สมัครเป็นผู้พิพาท</h2><p class="m-sub">applyArbitrator() · เปิดรับทุกคน · วางเงินประกันแล้วรอ Admin พิจารณา</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div style="margin-top:18px">
      <div class="m-grid">
        <div class="m-box"><div class="l">เงินประกันขั้นต่ำ</div><div class="v">${admin.minStake.toFixed(2)} ETH</div></div>
        <div class="m-box"><div class="l">ค่าตอบแทน/เคส</div><div class="v" style="color:#0f8a52">+${admin.reward.toFixed(2)}</div></div>
        <div class="m-box"><div class="l">ยอดของคุณ</div><div class="v" style="color:${state.bal>=admin.minStake?'#0f8a52':'#c0392b'}">${state.bal.toFixed(2)}</div></div>
      </div>
      <div class="field"><label>ชื่อ-นามสกุล (แสดงในรายชื่อผู้พิพาท)</label><input id="p-name" placeholder="เช่น สมหญิง ใจดี" autocomplete="off"></div>
      <div class="field"><label>Wallet Address</label>
        <div class="fixed-field"><input value="${curAddr()}" readonly tabindex="-1">
          <svg class="lk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg></div>
        <div class="hint">ใช้ address ที่เชื่อมต่ออยู่เท่านั้น สมัครแทนคนอื่นไม่ได้</div></div>
      <div class="field"><label>จำนวนเงินประกันที่จะวาง (ETH)</label>
        <input id="p-stake" type="number" step="0.5" min="${admin.minStake}" value="${admin.minStake.toFixed(2)}">
        <div class="hint">วางมากกว่าขั้นต่ำได้ ยิ่งวางมาก ยิ่งมีพื้นที่รองรับการถูกริบโดยไม่ถูกพักสิทธิ์</div></div>
      <div class="field"><label>ประสบการณ์ / เหตุผลที่ควรได้รับเลือก</label>
        <textarea id="p-exp" placeholder="เล่าประสบการณ์ด้านการไกล่เกลี่ย กฎหมาย หรือการตัดสินข้อพิพาท..."></textarea>
        <div class="hint">Admin จะใช้ข้อมูลนี้ประกอบการพิจารณาอนุมัติ</div></div>
      <label class="chkrow"><input type="checkbox" id="p-agree"><span>ข้าพเจ้ายอมรับว่าหากตัดสินไม่เป็นธรรม ไม่ตอบสนอง หรือรับสินบน <b>เงินประกันจะถูกริบ</b> และถูกพักสิทธิ์ตัดสินทันที</span></label>
      ${state.bal<admin.minStake?`<div class="notice" style="margin-top:12px;background:#eef3ff;border-color:#cfdcff;color:#2b53cf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>โหมดออกแบบ — ยอดในกระเป๋ายังไม่ถึงเกณฑ์ แต่ระบบจะ<b>เติม ETH ทดสอบให้อัตโนมัติ</b>ตอนกดยื่นใบสมัคร ทดลองกดได้เลย</div></div>`:''}
      <div class="m-actions">
        <button class="btn-lg btn-primary" onclick="submitApply()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M6 7l-4 7h8zM18 7l-4 7h8z"/><path d="M4 7h16"/></svg>ยื่นใบสมัคร + วางเงินประกัน</button>
        <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
      </div>
    </div></div>`);
  setTimeout(()=>$('#p-name')?.focus(),80);
}
function submitApply(){
  if(!requireWallet())return;
  if(!canApplyArb()){toast('err','Admin สมัครเป็นผู้พิพาทไม่ได้','ผู้ที่อนุมัติใบสมัครและริบเงินประกันได้ จะเป็นผู้ตัดสินเคสเองไม่ได้ เพื่อแยกอำนาจออกจากกัน');return;}
  const name=$('#p-name').value.trim(), st=+$('#p-stake').value||0;
  if(!name){toast('err','กรุณากรอกชื่อ','ช่องชื่อ-นามสกุลห้ามว่าง');$('#p-name').focus();return;}
  if(st<admin.minStake){toast('err','เงินประกันไม่ถึงเกณฑ์','ต้องวางอย่างน้อย '+admin.minStake.toFixed(2)+' ETH');$('#p-stake').focus();return;}
  if(($('#p-exp')?.value||'').trim().length<10){toast('err','กรอกประสบการณ์เพิ่ม','อธิบายอย่างน้อย 10 ตัวอักษรเพื่อให้ Admin พิจารณาได้');$('#p-exp').focus();return;}
  if(!$('#p-agree').checked){toast('err','ยังไม่ยอมรับเงื่อนไข','ต้องติ๊กยอมรับเงื่อนไขการถูกริบเงินประกันก่อน');return;}
  if(myApp()){toast('err','คุณยื่นใบสมัครไปแล้ว','รอ Admin พิจารณาอยู่');return;}
  const bk=arbBlockers();
  if(bk.total){showArbBlocked(bk);return;}
  if(onChain()){
    closeModal();
    /* เก็บทั้งชื่อและประสบการณ์ลง profileURI เพื่อให้ Admin เปิดดูรายละเอียดจากเชนได้ */
    sendTx('ยื่นใบสมัครผู้พิพาท',c=>c.applyArbitrator(packMeta(name,($('#p-exp')?.value||'').trim()),{value:ethers.parseEther(String(st))}));
    return;
  }
  if(!ensureFunds(st))return;
  state.bal=+(state.bal-st).toFixed(3);
  admin.apps.push({addr:curAddr(),name,stake:st,exp:($('#p-exp')?.value||'').trim()||'ไม่ได้ระบุประสบการณ์เพิ่มเติม',date:new Date().toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'})});
  txs.unshift({h:randHash(),type:'ApplyArbitrator',item:'ยื่นสมัครผู้พิพาท: '+name,amt:'-'+st.toFixed(2)+' ETH',st:'pend',time:'เมื่อสักครู่'});
  notify('admin','📝','#e9f0ff','ใบสมัครผู้พิพาทใหม่',name+' ยื่นสมัครพร้อมวางเงินประกัน '+st.toFixed(2)+' ETH · รอการพิจารณา','admin');
  updateWallet();closeModal();renderDispute();renderAdmin();renderStats();
  toast('ok','ยื่นใบสมัครสำเร็จ','ล็อกเงินประกัน '+st.toFixed(2)+' ETH · ส่งแจ้งเตือนถึง Admin แล้ว');
}
function openTopUp(){
  const me=myArb(); if(!me)return;
  showModal(`<div class="modal-body" style="padding-top:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2>เติมเงินประกัน</h2><p class="m-sub">depositStake() · หักจากกระเป๋าของคุณเอง</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div style="margin-top:18px">
      <div class="m-grid">
        <div class="m-box"><div class="l">ประกันปัจจุบัน</div><div class="v">${me.stake.toFixed(2)}</div></div>
        <div class="m-box"><div class="l">ขั้นต่ำ</div><div class="v">${admin.minStake.toFixed(2)}</div></div>
        <div class="m-box"><div class="l">ยอดกระเป๋า</div><div class="v">${state.bal.toFixed(2)}</div></div>
      </div>
      <div class="field"><label>จำนวนที่จะเติม (ETH)</label>
        <input id="t-amt" type="number" step="0.5" min="0" value="${Math.max(0.5,admin.minStake-me.stake).toFixed(2)}"></div>
      ${state.bal<0.5?`<div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>ยอดไม่พอ — <b style="cursor:pointer;text-decoration:underline" onclick="faucet();openTopUp()">รับ ETH ทดสอบฟรี</b></div></div>`:''}
      <div class="m-actions">
        <button class="btn-lg btn-primary" onclick="topUpStake()">ยืนยันเติมเงินประกัน</button>
        <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
      </div>
    </div></div>`);
}
function topUpStake(){
  if(!requireWallet())return;
  const me=myArb(); if(!me)return;
  const amt=Math.max(0,+$('#t-amt').value||0);
  if(amt<=0){toast('err','จำนวนไม่ถูกต้อง','ต้องมากกว่า 0 ETH');return;}
  if(onChain()){closeModal();sendTx('เติมเงินประกัน',c=>c.topUpStake({value:ethers.parseEther(String(amt))}));return;}
  if(!ensureFunds(amt))return;
  const was=okStake(me);
  state.bal=+(state.bal-amt).toFixed(3); me.stake=+(me.stake+amt).toFixed(3);
  txs.unshift({h:randHash(),type:'Stake',item:'เติมเงินประกัน: '+me.name,amt:'-'+amt.toFixed(2)+' ETH',st:'ok',time:'เมื่อสักครู่'});
  updateWallet();closeModal();renderDispute();renderArb();renderAdmin();renderStats();
  toast('ok','เติมเงินประกันแล้ว','เหลือ '+me.stake.toFixed(2)+' ETH'+(!was&&okStake(me)?' · กลับมาตัดสินได้แล้ว':''));
}
function withdrawArb(){
  if(!requireWallet())return;
  const me=myArb(); if(!me)return;
  if(myExit()){toast('info','คุณยื่นคำขอถอนตัวไปแล้ว','อยู่ระหว่างรอ Admin อนุมัติ · ติดตามสถานะได้ที่การ์ดด้านบน');return;}
  /* ติดเฉพาะเคสที่ตัวเองรับไว้ ไม่ใช่เคสเปิดทั้งระบบ */
  const open=disputes.filter(d=>d.st==='open'&&eqAddr(d.arb,curAddr())).length;
  if(open){toast('err','ถอนตัวไม่ได้ตอนนี้','คุณยังถือเคสค้างอยู่ '+open+' เคส ต้องตัดสินให้เสร็จก่อนจึงถอนตัวได้');return;}
  showModal(`<div class="modal-body" style="padding-top:26px">
    <div style="display:flex;gap:13px;align-items:flex-start">
      <div class="cf-ico warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4.5M12 17h.01"/><path d="M10.3 3.9 2.4 17.1A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></div>
      <div><h2 style="font-size:19px">ยืนยันการขอถอนตัว</h2>
        <p class="m-sub">requestExit() · ยื่นคำขอแล้วต้องรอ Admin อนุมัติก่อน เงินประกันยังไม่ถูกปล่อยทันที</p></div>
    </div>
    <div class="slash-box" style="margin-top:16px;background:#f7f9ff;border-color:var(--line-2)">
      <div class="arb-ava">${esc(me.name.trim().charAt(0))}</div>
      <div style="flex:1"><div class="al">${esc(me.name)}<span class="pos-tag">⚖ ผู้พิพาท</span></div>
        <div class="as">${esc(me.addr)} · ตัดสินไปแล้ว ${me.cases} เคส · เครดิต ${me.rep||100}/100</div></div>
    </div>
    <div class="refund-box">
      <div class="ri"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg></div>
      <div style="flex:1"><div class="rl">เงินประกันที่จะได้คืนเมื่ออนุมัติ</div><div class="rv">+ ${me.stake.toFixed(2)} ETH</div></div>
      <span class="tag pend">รออนุมัติ</span>
    </div>
    <div class="cf-what" style="margin-top:14px">
      <b>ระหว่างรออนุมัติ</b> เงินประกันยังถูกล็อกไว้ และคุณจะลงรับเคสใหม่ไม่ได้ แต่ยังตัดสินเคสที่ถืออยู่ได้ตามปกติ<br>
      <b>ถ้า Admin ปฏิเสธ</b> คุณกลับมาเป็นผู้พิพาทเหมือนเดิม เงินประกันไม่ถูกแตะต้อง · ยกเลิกคำขอเองได้ทุกเมื่อ
    </div>
    <div class="field" style="margin-top:16px"><label>เหตุผลที่ขอถอนตัว</label>
      <select id="x-reason">
        <option>ไม่มีเวลาพิจารณาเคสแล้ว</option>
        <option>ต้องการถอนเงินประกันไปใช้</option>
        <option>ย้ายไปทำบทบาทอื่นในระบบ</option>
        <option>อื่น ๆ</option></select>
      <div class="hint">Admin จะเห็นเหตุผลนี้ประกอบการพิจารณา</div></div>
    <div class="m-actions">
      <button class="btn-lg btn-primary" onclick="requestExit()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 17l5-5-5-5M21 12H9M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7"/></svg>ยืนยัน · ส่งคำขอถึง Admin</button>
      <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
    </div>
  </div>`);
}
/* ขั้นที่ 2: ส่งคำขอเข้าคิวรออนุมัติ ยังไม่ปล่อยเงินประกัน */
function requestExit(){
  const me=myArb(); if(!me)return;
  if(myExit()){closeModal();return;}
  const sel=$('#x-reason');
  const reason=sel?.value||'ไม่ได้ระบุเหตุผล';
  if(onChain()){closeModal();sendTx('ยื่นคำขอถอนตัว',c=>c.requestExit(sel?sel.selectedIndex:3));return;}
  admin.exits.push({addr:me.addr,name:me.name,stake:me.stake,cases:me.cases,reason,
    date:new Date().toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'})});
  txs.unshift({h:randHash(),type:'RequestExit',item:'ขอถอนตัวจากผู้พิพาท: '+me.name,amt:'0.00 ETH',st:'pend',time:'เมื่อสักครู่'});
  notify('admin','🚪','#fff3e2','คำขอถอนตัวของผู้พิพาท',me.name+' ขอถอนตัว · เงินประกัน '+me.stake.toFixed(2)+' ETH รอการอนุมัติ · เหตุผล: '+reason,'admin');
  closeModal();renderDispute();renderArb();renderAdmin();renderNotifs();
  toast('ok','ส่งคำขอถอนตัวแล้ว','แจ้ง Admin เรียบร้อย · เงินประกัน '+me.stake.toFixed(2)+' ETH ยังล็อกอยู่จนกว่าจะอนุมัติ');
}
function cancelExit(){
  const e=myExit(); if(!e)return;
  if(onChain()){sendTx('ยกเลิกคำขอถอนตัว',c=>c.cancelExit());return;}
  admin.exits=admin.exits.filter(x=>!eqAddr(x.addr,curAddr()));
  notify('admin','↩️','#eef3ff','ยกเลิกคำขอถอนตัว',e.name+' ขอยกเลิกคำขอถอนตัว · กลับมาเป็นผู้พิพาทตามปกติ','admin');
  renderDispute();renderArb();renderAdmin();renderNotifs();
  toast('info','ยกเลิกคำขอถอนตัวแล้ว','คุณกลับมาเป็นผู้พิพาทเต็มสิทธิ์');
}
/* ขั้นที่ 3: Admin อนุมัติ จึงปล่อยเงินประกันและถอดออกจากระบบ */
function approveExit(i){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin อนุมัติคำขอถอนตัวได้');return;}
  const x=admin.exits[i]; if(!x)return;
  if(onChain()){sendTx('อนุมัติถอนตัว · คืนเงินประกัน',c=>c.approveExit(x.chainId));return;}
  const a=admin.arbs.find(v=>v.addr===x.addr);
  const open=disputes.filter(d=>d.st==='open'&&eqAddr(d.arb,x.addr)).length;
  if(open){toast('err','อนุมัติไม่ได้ตอนนี้',x.name+' ยังถือเคสค้างอยู่ '+open+' เคส ต้องตัดสินให้เสร็จก่อน');return;}
  admin.exits.splice(i,1);
  const back=a?a.stake:x.stake;
  admin.arbs=admin.arbs.filter(v=>v.addr!==x.addr);
  /* คืนเข้ากระเป๋าเจ้าตัว และบันทึกเป็น Unstake รายการเดียว ไม่ให้ซ้ำซ้อนกับ Refund */
  if(x.addr===curAddr()){state.bal=+(state.bal+back).toFixed(3);}
  txs.unshift({h:randHash(),type:'Unstake',item:'คืนเงินประกัน (อนุมัติถอนตัว): '+x.name,amt:'+'+back.toFixed(2)+' ETH',st:'ok',time:'เมื่อสักครู่'});
  notify(x.addr,'✅','#e6f7ef','อนุมัติคำขอถอนตัวแล้ว','Admin อนุมัติให้คุณถอนตัว · คืนเงินประกัน '+back.toFixed(2)+' ETH เข้ากระเป๋าเต็มจำนวน · สมัครกลับเข้ามาใหม่ได้ทุกเมื่อ','dispute');
  notify('all','📋','#eef3ff','รายชื่อผู้พิพาทเปลี่ยนแปลง',x.name+' ถอนตัวจากระบบ · เหลือผู้พิพาท '+admin.arbs.length+' คน');
  updateWallet();renderAdmin();renderDispute();renderArb();renderNotifs();renderStats();
  if(state.role==='arbitrator'&&eqAddr(x.addr,curAddr()))setRole('user');
  toast('ok','อนุมัติถอนตัวแล้ว',x.name+' · คืนเงินประกัน '+back.toFixed(2)+' ETH เรียบร้อย');
}
function rejectExit(i){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin พิจารณาคำขอถอนตัวได้');return;}
  if(onChain()){sendTx('ปฏิเสธคำขอถอนตัว',c=>c.rejectExit(admin.exits[i].chainId));return;}
  const x=admin.exits.splice(i,1)[0]; if(!x)return;
  notify(x.addr,'↩️','#fff3e2','คำขอถอนตัวไม่ผ่านการพิจารณา','Admin ยังไม่อนุมัติให้ถอนตัวในรอบนี้ · คุณยังเป็นผู้พิพาทและเงินประกันยังอยู่ครบ ยื่นใหม่ได้ภายหลัง','dispute');
  renderAdmin();renderDispute();renderArb();renderNotifs();
  toast('info','ปฏิเสธคำขอถอนตัวแล้ว',x.name+' ยังเป็นผู้พิพาทในระบบตามเดิม');
}
function refundTo(addr,amt,label){
  if(addr===curAddr()){state.bal=+(state.bal+amt).toFixed(3);updateWallet();}
  txs.unshift({h:randHash(),type:'Refund',item:label,amt:'+'+amt.toFixed(2)+' ETH',st:'ok',time:'เมื่อสักครู่'});
}
/* รายละเอียดใบสมัครผู้พิพาท — Admin อ่านก่อนตัดสินใจอนุมัติ */
function openAppDetail(i){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin ดูใบสมัครได้');return;}
  const p=admin.apps[i]; if(!p)return;
  const lent=items.filter(x=>(x.lender||x.owner)===p.addr).length;
  const bor=items.filter(x=>x.borrower===p.addr).length;
  const open=disputes.filter(d=>d.st==='open'&&(d.renter===p.addr||d.lender===p.addr)).length;
  const clean=lent+bor+open===0;
  showModal(`<div class="modal-body" style="padding-top:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2>ใบสมัครผู้พิพาท</h2><p class="m-sub">applications(${p.chainId!==undefined?p.chainId:i}) · ข้อมูลอ่านจากสัญญาบนเชน</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div class="m-grid" style="margin-top:18px">
      <div class="m-box"><div class="l">เงินประกันที่วาง</div><div class="v" style="color:#0f8a52">${p.stake.toFixed(3)} ETH</div></div>
      <div class="m-box"><div class="l">เกณฑ์ขั้นต่ำ</div><div class="v">${admin.minStake.toFixed(2)} ETH</div></div>
      <div class="m-box"><div class="l">ยื่นเมื่อ</div><div class="v" style="font-size:14px">${esc(p.date)}</div></div>
    </div>
    <div class="esc-tb" style="margin-top:14px">
      <div class="esc-r"><span>ชื่อผู้สมัคร</span><b>${esc(p.name)}</b></div>
      <div class="esc-r"><span>Wallet Address</span><b style="font-size:11.5px">${esc(p.addr)}</b></div>
      <div class="esc-r"><span>ของที่ปล่อยเช่าค้างอยู่</span><b style="color:${lent?'#c0392b':'#0f8a52'}">${lent} รายการ</b></div>
      <div class="esc-r"><span>ของที่กำลังยืม</span><b style="color:${bor?'#c0392b':'#0f8a52'}">${bor} รายการ</b></div>
      <div class="esc-r"><span>ข้อพิพาทที่เป็นคู่กรณี</span><b style="color:${open?'#c0392b':'#0f8a52'}">${open} เคส</b></div>
    </div>
    <div style="font-size:12.5px;font-weight:800;margin-top:18px;font-family:'Noto Sans Thai',sans-serif">ประสบการณ์ / เหตุผลที่ควรได้รับเลือก</div>
    <div class="cf-what" style="margin-top:8px">${esc(p.exp)}</div>
    <div class="notice" style="margin-top:14px;${clean?'':'background:#fff4f4;border-color:#ffd4d4;color:#c0392b'}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>
      <div>${clean
        ? 'ไม่พบรายการคงค้างของ address นี้ · ไม่มีส่วนได้เสียที่ขัดกับการตัดสิน'
        : 'address นี้ยังมีรายการคงค้างในระบบ อนุมัติแล้วอาจเกิดผลประโยชน์ทับซ้อนตอนตัดสินเคส'}</div></div>
    <div class="m-actions" style="margin-top:20px">
      <button class="btn-lg btn-primary" onclick="approveApp(${i})">อนุมัติให้เป็นผู้พิพาท</button>
      <button class="btn-lg btn-ghost" style="color:#c0392b;border-color:#ffd4d4" onclick="rejectApp(${i})">ปฏิเสธ · คืนเงินประกัน</button>
      <button class="btn-lg btn-ghost" onclick="closeModal()">ปิด</button>
    </div></div>`);
}
function approveApp(i){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin พิจารณาใบสมัครได้');return;}
  if(onChain()){sendTx('อนุมัติผู้พิพาท',c=>c.approveApplication(admin.apps[i].chainId));return;}
  const p=admin.apps.splice(i,1)[0];
  admin.arbs.push({addr:p.addr,name:p.name,cases:0,stake:p.stake,earned:0,rep:100});
  txs.unshift({h:randHash(),type:'GrantRole',item:'อนุมัติผู้พิพาท: '+p.name,amt:'0.00 ETH',st:'ok',time:'เมื่อสักครู่'});
  notify(p.addr,'✅','#e6f7ef','ใบสมัครของคุณผ่านการอนุมัติ','ยินดีด้วย! คุณเป็นผู้พิพาทแล้ว เริ่มตัดสินเคสและรับค่าตอบแทนได้ทันที','dispute');
  renderAdmin();renderDispute();renderStats();renderNotifs();
  toast('ok','อนุมัติแล้ว',p.name+' เป็นผู้พิพาทเรียบร้อย · grantRole(ARBITRATOR_ROLE)');
}
function rejectApp(i){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin พิจารณาใบสมัครได้');return;}
  if(onChain()){sendTx('ปฏิเสธใบสมัคร · คืนเงินประกัน',c=>c.rejectApplication(admin.apps[i].chainId));return;}
  const p=admin.apps.splice(i,1)[0];
  refundTo(p.addr,p.stake,'คืนประกันใบสมัคร: '+p.name);
  notify(p.addr,'↩️','#fff3e2','ใบสมัครไม่ผ่านการพิจารณา','คืนเงินประกัน '+p.stake.toFixed(2)+' ETH เข้ากระเป๋าของคุณเต็มจำนวนแล้ว สมัครใหม่ได้ทุกเมื่อ','dispute');
  updateWallet();renderAdmin();renderDispute();renderStats();renderNotifs();
  toast('info','ปฏิเสธใบสมัครแล้ว','คืนเงินประกัน '+p.stake.toFixed(2)+' ETH ให้ '+p.name+' เต็มจำนวน');
}
const SETTINGS={
 fee:{label:'ค่าธรรมเนียมแพลตฟอร์ม',fn:'setPlatformFee(uint256)',unit:'%',step:0.5,min:0,max:10,dec:2,
   up:'ผู้ยืมจะจ่ายแพงขึ้นทุกสัญญา แต่แพลตฟอร์มมีรายได้มาจ่ายค่าตอบแทนผู้พิพาทมากขึ้น',
   down:'ผู้ยืมจ่ายถูกลง แต่รายได้แพลตฟอร์มที่เอาไปจ่ายผู้พิพาทจะลดลง'},
 minStake:{label:'เงินประกันขั้นต่ำของผู้พิพาท',fn:'setMinStake(uint256)',unit:' ETH',step:0.5,min:0,max:100,dec:2,
   up:'คัดคนเข้มขึ้น แต่ผู้พิพาทที่เงินประกันไม่ถึงเกณฑ์ใหม่จะถูกพักสิทธิ์ทันที',
   down:'สมัครง่ายขึ้น ผู้พิพาทที่ถูกพักสิทธิ์อยู่อาจกลับมาตัดสินได้'},
 reward:{label:'ค่าตอบแทนผู้พิพาท (ต่อเคส)',fn:'setArbitratorReward(uint256)',unit:' ETH',step:0.005,min:0,max:10,dec:3,
   up:'จูงใจให้มีคนมาสมัครมากขึ้น แต่แพลตฟอร์มจ่ายต่อเคสแพงขึ้น',
   down:'ประหยัดค่าใช้จ่าย แต่อาจมีคนสนใจเป็นผู้พิพาทน้อยลง'}
};
const fmtSet=(k,v)=>v.toFixed(SETTINGS[k].dec)+SETTINGS[k].unit;
function openEditSetting(k,preset){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin แก้ไขค่าตั้งต้นของสัญญาได้');return;}
  const c=SETTINGS[k], cur=admin[k], start=(preset===undefined?cur:preset);
  showModal(`<div class="modal-body" style="padding-top:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2>แก้ไข${esc(c.label)}</h2><p class="m-sub">${c.fn} · ตั้งได้ระหว่าง ${c.min}${c.unit} ถึง ${c.max}${c.unit}</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div class="cmp">
      <div class="cmp-b"><div class="l">ค่าปัจจุบัน</div><div class="v">${fmtSet(k,cur)}</div></div>
      <svg class="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
      <div class="cmp-b now"><div class="l">ค่าใหม่</div><div class="v" id="e-new">${fmtSet(k,start)}</div></div>
    </div>
    <div class="field" style="margin-top:14px"><label>กำหนดค่าใหม่</label>
      <div class="stepper">
        <button type="button" onclick="stepSetting('${k}',-1)">−</button>
        <input id="e-val" type="number" step="${c.step}" min="${c.min}" max="${c.max}" value="${start}" oninput="previewSetting('${k}')">
        <button type="button" onclick="stepSetting('${k}',1)">+</button>
      </div>
    </div>
    <div id="e-diff"></div>
    <div class="m-actions">
      <button class="btn-lg btn-primary" id="e-ok" onclick="applySetting('${k}')">ยืนยันการแก้ไข</button>
      <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
    </div>
  </div>`);
  previewSetting(k);
}
function readSetting(k){
  const c=SETTINGS[k];
  let v=parseFloat($('#e-val').value);
  if(isNaN(v))v=admin[k];
  return Math.min(c.max,Math.max(c.min,v));
}
function stepSetting(k,dir){
  const c=SETTINGS[k];
  $('#e-val').value=+(readSetting(k)+dir*c.step).toFixed(c.dec);
  previewSetting(k);
}
function previewSetting(k){
  const c=SETTINGS[k], cur=admin[k], v=readSetting(k), d=+(v-cur).toFixed(c.dec);
  $('#e-new').textContent=fmtSet(k,v);
  const pct=cur>0?Math.round(Math.abs(d)/cur*100):100;
  let extra='';
  if(k==='minStake'){
    const hit=admin.arbs.filter(a=>a.stake>=cur&&a.stake<v).length;
    const back=admin.arbs.filter(a=>a.stake<cur&&a.stake>=v).length;
    if(d>0&&hit)extra=`<br>ผู้พิพาท <b>${hit} คน</b> จะถูกพักสิทธิ์ทันทีเพราะเงินประกันไม่ถึงเกณฑ์ใหม่`;
    if(d<0&&back)extra=`<br>ผู้พิพาท <b>${back} คน</b> ที่ถูกพักสิทธิ์อยู่จะกลับมาตัดสินได้ทันที`;
  }
  const ico='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">';
  let html;
  if(d===0){
    html=`<div class="diff same">${ico}<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg><div>ค่ายังเท่าเดิม — เปลี่ยนตัวเลขก่อนจึงจะยืนยันได้</div></div>`;
    $('#e-ok').disabled=true; $('#e-ok').textContent='ยืนยันการแก้ไข';
  }else{
    const upQ=d>0;
    html=`<div class="diff ${upQ?'up':'down'}">${ico}<path d="M12 ${upQ?'19V5M5 12l7-7 7 7':'5v14M5 12l7 7 7-7'}"/></svg>
      <div>คุณกำลัง<b>${upQ?'ปรับเพิ่มขึ้น':'ปรับลดลง'} ${Math.abs(d).toFixed(c.dec)}${c.unit}</b> (${upQ?'+':'−'}${pct}% จากเดิม)<br>${upQ?c.up:c.down}${extra}</div></div>`;
    $('#e-ok').disabled=false;
    $('#e-ok').textContent=(upQ?'ยืนยันปรับเพิ่มเป็น ':'ยืนยันปรับลดเป็น ')+fmtSet(k,v);
  }
  $('#e-diff').innerHTML=html;
}
function settingImpact(k,cur,v){
  if(k!=='minStake')return '';
  const up=v>cur;
  const hit=admin.arbs.filter(a=>a.stake>=cur&&a.stake<v).length;
  const back=admin.arbs.filter(a=>a.stake<cur&&a.stake>=v).length;
  if(up&&hit)return `ผู้พิพาท <b>${hit} คน</b> จะถูกพักสิทธิ์ตัดสินทันที`;
  if(!up&&back)return `ผู้พิพาท <b>${back} คน</b> ที่ถูกพักสิทธิ์จะกลับมาตัดสินได้ทันที`;
  return '';
}
let pendingEdit=null;
function applySetting(k){
  const c=SETTINGS[k], cur=admin[k], v=readSetting(k);
  if(v===cur){toast('info','ค่ายังเท่าเดิม','เปลี่ยนตัวเลขก่อนจึงจะบันทึกได้');return;}
  pendingEdit={k,v,cur};
  const upQ=v>cur, d=Math.abs(+(v-cur).toFixed(c.dec)), imp=settingImpact(k,cur,v);
  showModal(`<div class="modal-body" style="padding-top:26px">
    <div style="display:flex;gap:13px;align-items:flex-start">
      <div class="cf-ico ${upQ?'up':'down'}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4.5M12 17h.01"/><path d="M10.3 3.9 2.4 17.1A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
      </div>
      <div><h2 style="font-size:19px">ยืนยันการแก้ไขอีกครั้ง</h2>
        <p class="m-sub">เมื่อยืนยันแล้วค่าจะถูกบันทึกลงสัญญาทันที และระบบจะแจ้งเตือนผู้ใช้ทุกคน</p></div>
    </div>
    <div class="cf-what">กำลังแก้ไข: <b>${esc(c.label)}</b></div>
    <div class="cmp" style="margin-top:10px">
      <div class="cmp-b"><div class="l">จากเดิม</div><div class="v" style="color:#7a86a8">${fmtSet(k,cur)}</div></div>
      <svg class="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
      <div class="cmp-b now"><div class="l">เป็น</div><div class="v" style="color:${upQ?'#a9530b':'#155fa8'}">${fmtSet(k,v)}</div></div>
    </div>
    <div class="diff ${upQ?'up':'down'}" style="margin-top:14px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 ${upQ?'19V5M5 12l7-7 7 7':'5v14M5 12l7 7 7-7'}"/></svg>
      <div><b>${upQ?'ปรับเพิ่มขึ้น':'ปรับลดลง'} ${d.toFixed(c.dec)}${c.unit}</b>${imp?'<br>'+imp:''}</div>
    </div>
    <div class="m-actions">
      <button class="btn-lg btn-primary" style="${upQ?'background:linear-gradient(180deg,#f0922f,#d9760f);box-shadow:0 8px 20px rgba(217,118,15,.3)':''}" onclick="commitSetting()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>ยืนยันและบันทึก</button>
      <button class="btn-lg btn-ghost" onclick="openEditSetting('${k}',${v})">ย้อนกลับ</button>
    </div>
  </div>`);
}
function commitSetting(){
  if(!pendingEdit)return;
  const {k,v,cur}=pendingEdit; pendingEdit=null;
  const c=SETTINGS[k], upQ=v>cur;
  if(onChain()){
    closeModal();
    sendTx('บันทึก'+c.label, x=>
      k==='fee'      ? x.setFeeBps(Math.round(v*100))
    : k==='minStake' ? x.setMinStake(ethers.parseEther(String(v)))
    :                  x.setArbReward(ethers.parseEther(String(v))));
    return;
  }
  admin[k]=v;
  if(k==='minStake'){
    admin.arbs.forEach(a=>{
      if(upQ&&a.stake<v)notify(a.addr,'⚠️','#ffeceb','คุณถูกพักสิทธิ์ตัดสิน','เกณฑ์เงินประกันขั้นต่ำปรับขึ้นเป็น '+fmtSet(k,v)+' แต่คุณมี '+a.stake.toFixed(2)+' ETH','dispute');
      if(!upQ&&a.stake>=v&&a.stake<cur)notify(a.addr,'✅','#e6f7ef','คุณกลับมาตัดสินเคสได้แล้ว','เกณฑ์เงินประกันขั้นต่ำปรับลงเหลือ '+fmtSet(k,v),'dispute');
    });
  }
  notify('all',upQ?'📈':'📉','#eef3ff','อัปเดต'+c.label,'จาก '+fmtSet(k,cur)+' เป็น '+fmtSet(k,v)+' มีผลกับสัญญาที่ทำหลังจากนี้');
  closeModal();renderAdmin();renderDispute();renderNotifs();
  toast('ok','บันทึกการแก้ไขแล้ว',c.label+': '+fmtSet(k,cur)+' → '+fmtSet(k,v));
}

function toggleApply(){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin เท่านั้น');return;}
  if(onChain()){sendTx('ตั้งค่าการเปิดรับสมัคร',c=>c.setApplicationsOpen(!admin.openApply));return;}
  admin.openApply=!admin.openApply;renderAdmin();renderDispute();
  if(admin.openApply){
    notify('all','📣','#e6f7ef','เปิดรับสมัครผู้พิพาทแล้ว','วางเงินประกันขั้นต่ำ '+admin.minStake.toFixed(2)+' ETH แล้วยื่นสมัครได้เลย · ค่าตอบแทน '+admin.reward.toFixed(2)+' ETH ต่อเคส','dispute');
    toast('ok','เปิดรับสมัครแล้ว','แจ้งเตือนผู้ใช้ทุกคนแล้ว · ฟอร์มสมัครกลับมาแสดง');
  }else{
    if($('#p-name'))closeModal();
    notify('all','🚫','#ffeceb','ปิดรับสมัครผู้พิพาทแล้ว','ระบบปิดรับใบสมัครรอบนี้แล้ว ใบที่ยื่นไว้ก่อนหน้ายังอยู่ระหว่างพิจารณาตามปกติ');
    toast('info','ปิดรับสมัครแล้ว','แจ้งเตือนผู้ใช้ทุกคนแล้ว · ฟอร์มและการ์ดสมัครถูกซ่อนทั้งหมด');
  }
}
function openSlash(i){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin ริบเงินประกันได้');return;}
  const a=admin.arbs[i];
  showModal(`<div class="modal-body" style="padding-top:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2>ริบเงินประกันผู้พิพาท</h2><p class="m-sub">slashStake(address, amount) · เงินที่ริบจะเข้าคลังแพลตฟอร์ม</p></div>
      <button class="modal-close" style="position:static;flex:none" onclick="closeModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div style="margin-top:18px">
      <div class="slash-box">
        <div class="arb-ava">${esc(a.name.trim().charAt(0))}</div>
        <div style="flex:1"><div class="al">${esc(a.name)}<span class="pos-tag">⚖ ผู้พิพาท</span></div><div class="as">${esc(a.addr)} · ตัดสินไปแล้ว ${a.cases} เคส</div></div>
        <div style="text-align:right"><div class="as">เงินประกันคงเหลือ</div><div class="sv">${a.stake.toFixed(2)} ETH</div></div>
      </div>
      <div class="field"><label>เหตุผลที่ริบ</label><select id="s-reason">
        <option>ตัดสินไม่เป็นธรรม / เข้าข้างฝ่ายใดฝ่ายหนึ่ง</option>
        <option>ไม่ตอบสนองเกิน 72 ชั่วโมง</option>
        <option>มีหลักฐานการรับสินบน</option>
        <option>ตัดสินโดยไม่ตรวจหลักฐาน</option>
        <option>อื่น ๆ</option></select></div>
      <div class="field"><label>จำนวนที่ริบ (ETH)</label>
        <input id="s-amt" type="number" step="0.05" min="0" max="${a.stake}" value="${(a.stake*0.25).toFixed(2)}">
        <div class="arb-bar">
          <button class="tbtn g" onclick="setSlash(${i},0.25)">ริบ 25%</button>
          <button class="tbtn g" onclick="setSlash(${i},0.5)">ริบ 50%</button>
          <button class="tbtn g" onclick="setSlash(${i},1)">ริบทั้งหมด</button>
        </div></div>
      <div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div>ถ้าเงินประกันเหลือต่ำกว่าขั้นต่ำ ${admin.minStake.toFixed(2)} ETH ผู้พิพาทคนนี้จะ<b>ถูกพักสิทธิ์ตัดสินทันที</b> จนกว่าจะเติมเงินประกันกลับ</div></div>
      <div class="m-actions">
        <button class="btn-lg btn-primary" style="background:linear-gradient(180deg,#e05252,#c0392b);box-shadow:0 8px 20px rgba(192,57,43,.3)" onclick="slash(${i})">ยืนยันริบเงินประกัน</button>
        <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
      </div>
    </div></div>`);
}
function setSlash(i,p){$('#s-amt').value=(admin.arbs[i].stake*p).toFixed(2);}
function slash(i){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin เท่านั้น');return;}
  const a=admin.arbs[i];
  const amt=Math.min(a.stake,Math.max(0,+$('#s-amt').value||0));
  if(amt<=0){toast('err','จำนวนไม่ถูกต้อง','ต้องริบมากกว่า 0 ETH');$('#s-amt').focus();return;}
  const rsel=$('#s-reason'), reason=rsel.value;
  if(onChain()){closeModal();sendTx('ริบเงินประกัน',c=>c.slashStake(a.addr,ethers.parseEther(String(amt)),rsel.selectedIndex));return;}
  a.stake=+(a.stake-amt).toFixed(3);a.rep=Math.max(0,(a.rep||100)-15);
  admin.slashed=+(admin.slashed+amt).toFixed(3);
  txs.unshift({h:randHash(),type:'Slash',item:'ริบประกัน: '+a.name+' — '+reason,amt:'-'+amt.toFixed(2)+' ETH',st:'ok',time:'เมื่อสักครู่'});
  notify(a.addr,'⚠️','#ffeceb','คุณถูกริบเงินประกัน','ถูกริบ '+amt.toFixed(2)+' ETH · เหตุผล: '+reason+' · เงินประกันคงเหลือ '+a.stake.toFixed(2)+' ETH','dispute');
  closeModal();renderAdmin();renderDispute();renderStats();
  const sus=!okStake(a);
  toast(sus?'err':'ok','ริบเงินประกันแล้ว',a.name+' ถูกริบ '+amt.toFixed(2)+' ETH · '+(sus?'ถูกพักสิทธิ์ตัดสินทันที':'เหลือ '+a.stake.toFixed(2)+' ETH'));
}
let pendingRevoke=null;
function revokeArb(i){
  if(state.role!=='admin'){toast('err','ไม่มีสิทธิ์','เฉพาะ Admin ถอดสิทธิ์ผู้พิพาทได้');return;}
  const a=admin.arbs[i]; if(!a)return;
  pendingRevoke=i;
  const leftActive=admin.arbs.filter((x,ix)=>ix!==i&&okStake(x)).length;
  const openCases=disputes.filter(d=>d.st==='open').length;
  showModal(`<div class="modal-body" style="padding-top:26px">
    <div style="display:flex;gap:13px;align-items:flex-start">
      <div class="cf-ico warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4.5M12 17h.01"/><path d="M10.3 3.9 2.4 17.1A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></div>
      <div><h2 style="font-size:19px">ยืนยันถอดสิทธิ์ผู้พิพาท</h2>
        <p class="m-sub">revokeRole(ARBITRATOR_ROLE, address) · คนนี้จะตัดสินเคสไม่ได้อีกทันที</p></div>
    </div>
    <div class="slash-box" style="margin-top:16px;background:#f7f9ff;border-color:var(--line-2)">
      <div class="arb-ava">${esc(a.name.trim().charAt(0))}</div>
      <div style="flex:1"><div class="al">${esc(a.name)}<span class="pos-tag">⚖ ผู้พิพาท</span></div>
        <div class="as">${esc(a.addr)} · ตัดสินไปแล้ว ${a.cases} เคส · เครดิต ${a.rep||100}/100</div></div>
    </div>
    <div class="refund-box">
      <div class="ri"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg></div>
      <div style="flex:1"><div class="rl">คืนเงินประกันให้ผู้พิพาทเต็มจำนวน</div><div class="rv">+ ${a.stake.toFixed(2)} ETH</div></div>
      <span class="tag ok">อัตโนมัติ</span>
    </div>
    <div class="diff same" style="margin-top:12px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
      <div>เงินประกันจะถูกปลดล็อกจาก escrow คืนเข้ากระเป๋า <b>${esc(a.addr)}</b> ทันที · ค่าตอบแทนที่เคยได้รับ ${(a.earned||0).toFixed(2)} ETH ไม่ถูกเรียกคืน · สมัครกลับเข้ามาใหม่ได้ทุกเมื่อ${disputes.filter(d=>d.st==='open'&&eqAddr(d.arb,a.addr)).length?`<br><b>เคสที่ถืออยู่ ${disputes.filter(d=>d.st==='open'&&eqAddr(d.arb,a.addr)).length} เคส จะถูกส่งกลับเข้าคิว</b>ให้ผู้พิพาทคนอื่นลงรับแทน`:''}</div>
    </div>
    ${(!leftActive&&openCases)?`<div class="diff up" style="margin-top:10px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4.5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg><div><b>ระวัง:</b> ถอดคนนี้ออกแล้วจะไม่เหลือผู้พิพาทที่ใช้งานได้เลย แต่ยังมีข้อพิพาทค้างอยู่ <b>${openCases} เคส</b> ที่จะไม่มีใครตัดสิน</div></div>`:''}
    <div class="m-actions">
      <button class="btn-lg btn-primary" style="background:linear-gradient(180deg,#e05252,#c0392b);box-shadow:0 8px 20px rgba(192,57,43,.3)" onclick="commitRevoke()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>ยืนยันถอดสิทธิ์ + คืนเงินประกัน</button>
      <button class="btn-lg btn-ghost" onclick="closeModal()">ยกเลิก</button>
    </div>
  </div>`);
}
function commitRevoke(){
  if(pendingRevoke===null)return;
  const i=pendingRevoke; pendingRevoke=null;
  if(onChain()){const t=admin.arbs[i];closeModal();if(t)sendTx('ถอดสิทธิ์ผู้พิพาท',c=>c.revokeArbitrator(t.addr));return;}
  const a=admin.arbs.splice(i,1)[0]; if(!a){closeModal();return;}
  admin.exits=admin.exits.filter(x=>x.addr!==a.addr);
  /* เคสที่ถืออยู่ต้องกลับเข้าคิวให้คนอื่นรับ ไม่งั้นเคสจะค้างโดยไม่มีผู้รับผิดชอบ */
  const freed=disputes.filter(d=>d.st==='open'&&eqAddr(d.arb,a.addr));
  freed.forEach(d=>{d.arb=null;d.arbName=null;delete d.claimedAt;
    notify(d.by,'⚖️','#fff3e2','เคสของคุณกลับเข้าคิวใหม่',d.id+' · ผู้พิพาทเดิมถูกถอดสิทธิ์ ระบบส่งเคสกลับให้ผู้พิพาทคนอื่นลงรับแทน','dispute');});
  admin.arbs.filter(v=>okStake(v)).forEach(v=>freed.forEach(d=>notify(v.addr,'⚖️','#fff1e8','มีเคสกลับเข้าคิว',d.id+' · '+d.item+' — ผู้พิพาทเดิมถูกถอดสิทธิ์ กดลงรับเคสได้','dispute')));
  refundTo(a.addr,a.stake,'คืนเงินประกัน (ถอดสิทธิ์): '+a.name);
  notify(a.addr,'↩️','#fff3e2','คุณถูกถอดสิทธิ์ผู้พิพาท','Admin ถอดสิทธิ์แล้ว และคืนเงินประกัน '+a.stake.toFixed(2)+' ETH เข้ากระเป๋าของคุณเต็มจำนวน · สมัครกลับเข้ามาใหม่ได้ทุกเมื่อ','dispute');
  notify('all','📋','#eef3ff','รายชื่อผู้พิพาทเปลี่ยนแปลง',a.name+' ถูกถอดสิทธิ์ · เหลือผู้พิพาทในระบบ '+admin.arbs.length+' คน');
  closeModal();renderAdmin();renderDispute();renderArb();renderNotifs();renderStats();
  if(state.role==='arbitrator'&&a.addr===curAddr())setRole('user');
  toast('ok','ถอดสิทธิ์ '+a.name+' แล้ว','คืนเงินประกัน '+a.stake.toFixed(2)+' ETH'+(freed.length?' · ส่ง '+freed.length+' เคสกลับเข้าคิวแล้ว':''));
}

/* ---------- stats / search / init ---------- */
function renderStats(){
  $('#stTotal').textContent=items.length.toLocaleString();
  $('#stActive').textContent=items.filter(i=>i.st==='borrowed'||i.st==='returning'||i.st==='inspect').length.toLocaleString();
  $('#stTx').textContent=txs.length.toLocaleString();
}
let tmr;
$('#search').addEventListener('input',e=>{
  clearTimeout(tmr);
  tmr=setTimeout(()=>{
    state.q=e.target.value.trim().toLowerCase();
    renderPopular();if(state.page==='browse')renderBrowse();
    if(state.q.length>1&&state.page!=="browse"&&filtered().length)go("browse");
  },220);
});
loadFav();renderCats();renderPopular();updateWallet();renderStats();renderRoleMenu();setRole('user',true);renderNotifs();

/* ---------- เปิดแอปใหม่: ถ้า MetaMask อนุญาตไว้แล้ว เชื่อมต่อเงียบ ๆ และดึงทุกอย่างจากเชน ---------- */
async function bootChain(){
  if(!ethereum){
    toast('info','ยังไม่พบ MetaMask','ติดตั้งส่วนขยาย MetaMask ก่อน แล้วรีเฟรชหน้านี้ · ข้อมูลทั้งหมดอ่านจากสัญญาบนเชนเท่านั้น');
    return;
  }
  try{
    const accs=await ethereum.request({method:'eth_accounts'});
    if(!accs||!accs.length){
      toast('info','ยินดีต้อนรับสู่ DeFi Rent','กด Connect Wallet เพื่อดึงข้อมูลจากสัญญาบนเชน');
      return;
    }
    await connectWallet();
  }catch(e){
    toast('err','อ่านข้อมูลจากเชนไม่สำเร็จ',(e&&e.message)||'กด Connect Wallet เพื่อลองใหม่');
  }
}
setTimeout(bootChain,500);
