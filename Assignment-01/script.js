const SUBJECTS = ["English","Mathematics","Science","Social Studies","Computer"];
const PASS_MARK = 35;           // minimum marks needed in each subject
const KEY = "students";

// ---- storage (falls back to memory if localStorage is blocked) ----
let memory = [];
function load(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch(e){ return memory; }
}
function save(list){
  memory = list;
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch(e){}
}

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// build mark inputs
$("marks").innerHTML = SUBJECTS.map((s,i)=>
  `<div><label for="m${i}">${s}</label><input id="m${i}" type="number" min="0" max="100" step="1" inputmode="numeric"><div class="err" id="e-m${i}"></div></div>`
).join("");

// ---- validation ----
function setErr(id, msg){
  $("e-"+id).textContent = msg || "";
  const el = $(id); if(el) el.classList.toggle("bad", !!msg);
  return !msg;
}
function validate(list){
  let ok = true;
  const name = $("name").value.trim(), roll = $("roll").value.trim(),
        email = $("email").value.trim(), phone = $("phone").value.trim();
  ok &= setErr("name", !name ? "Enter the student's name." :
        !/^[A-Za-z][A-Za-z .'-]{1,49}$/.test(name) ? "Use letters only, 2 to 50 characters." : "");
  ok &= setErr("roll", !roll ? "Enter a roll number." :
        !/^[A-Za-z0-9-]{1,12}$/.test(roll) ? "Use letters, digits or hyphens, up to 12." :
        list.some(s => s.rollNo.toLowerCase() === roll.toLowerCase()) ? "This roll number is already registered." : "");
  ok &= setErr("cls", $("cls").value ? "" : "Select a class.");
  ok &= setErr("email", !email ? "Enter an email address." :
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "Enter a valid email, like name@example.com." : "");
  ok &= setErr("phone", !/^[6-9]\d{9}$/.test(phone) ? "Enter 10 digits starting with 6, 7, 8 or 9." : "");
  SUBJECTS.forEach((s,i)=>{
    const v = $("m"+i).value.trim(), n = Number(v);
    ok &= setErr("m"+i, v==="" ? "Required." :
          !Number.isInteger(n) ? "Whole numbers only." :
          (n<0||n>100) ? "Must be 0 to 100." : "");
  });
  return !!ok;
}

// ---- result calculation ----
function gradeOf(p){
  return p>=90?"A+":p>=80?"A":p>=70?"B":p>=60?"C":p>=50?"D":p>=40?"E":"F";
}
function buildStudent(){
  const marks = {};
  SUBJECTS.forEach((s,i)=> marks[s] = Number($("m"+i).value));
  const total = Object.values(marks).reduce((a,b)=>a+b,0);
  const max = SUBJECTS.length*100;
  const percentage = +(total/max*100).toFixed(2);
  const failed = SUBJECTS.filter(s => marks[s] < PASS_MARK);
  const status = failed.length ? "Fail" : "Pass";
  return {
    id: Date.now(),
    name: $("name").value.trim().replace(/\s+/g," "),
    rollNo: $("roll").value.trim(),
    class: $("cls").value,
    email: $("email").value.trim(),
    phone: $("phone").value.trim(),
    marks, total, maxMarks: max, percentage,
    grade: status==="Fail" ? "F" : gradeOf(percentage),
    status, failedSubjects: failed,
    registeredOn: new Date().toISOString()
  };
}

// ---- rendering ----
function showResult(s){
  const cls = s.status.toLowerCase();
  $("result").innerHTML = `
  <div class="sheet">
    <div class="top">
      <div><h3>${esc(s.name)}</h3>
        <div class="meta">Roll ${esc(s.rollNo)} &middot; Class ${esc(s.class)}</div>
        <div class="meta">${esc(s.email)}</div></div>
      <div class="stamp ${cls}">${s.status.toUpperCase()}</div>
    </div>
    <div class="tw"><table>
      <thead><tr><th>Subject</th><th class="num">Marks</th><th class="num">Out of</th></tr></thead>
      <tbody>${SUBJECTS.map(k=>`<tr><td>${k}</td><td class="num ${s.marks[k]<PASS_MARK?"low":""}">${s.marks[k]}</td><td class="num">100</td></tr>`).join("")}
      <tr><th>Total</th><th class="num">${s.total}</th><th class="num">${s.maxMarks}</th></tr></tbody>
    </table></div>
    <div class="stats">
      <div class="stat"><span class="meta">Percentage</span><b>${s.percentage}%</b></div>
      <div class="stat"><span class="meta">Grade</span><b>${s.grade}</b></div>
    </div>
    <div class="bar ${cls}" role="img" aria-label="${s.percentage} percent"><i style="width:${s.percentage}%"></i></div>
    <p class="note">${s.status==="Pass"
      ? `Passed: scored at least ${PASS_MARK} in every subject.`
      : `Failed: below ${PASS_MARK} in ${esc(s.failedSubjects.join(", "))}.`}</p>
  </div>`;
}

function renderList(){
  const list = load();
  $("json").textContent = JSON.stringify(list, null, 2);
  const passed = list.filter(s=>s.status==="Pass").length;
  const avg = list.length ? (list.reduce((a,s)=>a+s.percentage,0)/list.length).toFixed(1) : "0";
  $("stats").innerHTML = `
    <div class="stat"><span class="meta">Students</span><b>${list.length}</b></div>
    <div class="stat"><span class="meta">Passed</span><b>${passed}</b></div>
    <div class="stat"><span class="meta">Failed</span><b>${list.length-passed}</b></div>
    <div class="stat"><span class="meta">Average</span><b>${avg}%</b></div>`;
  $("tbl").innerHTML = list.length ? `
    <thead><tr><th>Roll</th><th>Name</th><th>Class</th><th class="num">Total</th><th class="num">%</th><th>Grade</th><th>Result</th><th></th></tr></thead>
    <tbody>${list.map(s=>`<tr>
      <td>${esc(s.rollNo)}</td><td>${esc(s.name)}</td><td>${esc(s.class)}</td>
      <td class="num">${s.total}/${s.maxMarks}</td><td class="num">${s.percentage}</td><td>${s.grade}</td>
      <td><span class="badge ${s.status.toLowerCase()}">${s.status}</span></td>
      <td><button class="ghost small" data-view="${s.id}">View</button> <button class="danger small" data-del="${s.id}">Delete</button></td>
    </tr>`).join("")}</tbody>`
    : `<tbody><tr><td><div class="empty">No students saved yet. Register one using the form.</div></td></tr></tbody>`;
}

// ---- events ----
$("form").addEventListener("submit", e=>{
  e.preventDefault();
  const list = load();
  if(!validate(list)){
    const first = document.querySelector("input.bad, select.bad"); if(first) first.focus();
    return;
  }
  const student = buildStudent();          // JS object
  list.push(student);
  save(list);                              // JSON.stringify -> localStorage
  showResult(student);
  renderList();
  $("form").reset();
  document.querySelectorAll(".bad").forEach(x=>x.classList.remove("bad"));
});
$("reset").addEventListener("click", ()=>{
  document.querySelectorAll(".err").forEach(x=>x.textContent="");
  document.querySelectorAll(".bad").forEach(x=>x.classList.remove("bad"));
});
$("tbl").addEventListener("click", e=>{
  const v = e.target.dataset.view, d = e.target.dataset.del;
  const list = load();
  if(v){ const s = list.find(x=>String(x.id)===v); if(s){ showResult(s); $("rh").scrollIntoView({behavior:"smooth"}); } }
  if(d){ save(list.filter(x=>String(x.id)!==d)); renderList(); }
});
$("clearAll").addEventListener("click", ()=>{
  if(load().length && confirm("Delete all saved students?")){ save([]); renderList();
    $("result").innerHTML = '<div class="empty">Submit the form to see the marksheet here.</div>'; }
});
// clear a field's error as the user fixes it
document.addEventListener("input", e=>{
  if(e.target.classList && e.target.classList.contains("bad")) setErr(e.target.id, "");
});

renderList();
