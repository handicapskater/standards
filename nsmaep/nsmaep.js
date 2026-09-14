/* Local demo UI. Identity tokens stay in memory; case authority is the API. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let token = null, refreshToken = null, config, forms, source, current, sectionId;
  const message = (text) => { $("message").textContent = text; };
  const run = (fn) => async () => { try { await fn(); } catch (error) { message(error.message || "Request failed"); } };
  const api = async (path, method = "GET", body) => {
    const requestToken=token;
    const response = await fetch(path, {method, credentials:"omit", headers:{...(token ? {Authorization:`Bearer ${token}`} : {}), ...(body ? {"Content-Type":"application/json"} : {})}, body:body ? JSON.stringify(body) : undefined});
    const result = await response.json();
    if(requestToken!==token) throw new Error("Session changed; request discarded.");
    if (!response.ok) throw new Error(result.detail || "Request unavailable");
    return result;
  };
  const authRequest = async (method, body) => {
    if (!config || config.mode !== "SYNTHETIC_DEMO_DATA") throw new Error("Local demo is unavailable");
    const response = await fetch(`${config.auth_emulator}/identitytoolkit.googleapis.com/v1/accounts:${method}?key=demo-key`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)});
    const result = await response.json();
    if (!response.ok) throw new Error("Authentication request failed. Check your synthetic account and password.");
    return result;
  };
  const login = async (signup) => {
    if (!$("auth-form").reportValidity()) return;
    if (!$("email").value.endsWith("@example.test")) throw new Error("Use a synthetic @example.test email");
    const result = await authRequest(signup ? "signUp" : "signInWithPassword", {email:$("email").value, password:$("password").value, returnSecureToken:true});
    token = result.idToken; refreshToken = result.refreshToken;
    $("password").value = "";
    await api("/api/register", "POST", {consent:true});
    const me = await api("/api/me");
    $("identity").textContent = `Signed in · ${$("email").value} · NSMAEP only`;
    $("review-cases").hidden = !me.memberships.some((m) => m.program_id === "NSMAEP" && m.status === "ACTIVE" && ["ADMIN","NSMAEP_REVIEWER"].includes(m.role_id));
    $("auth").hidden = true; $("workspace").hidden = false;
    await listCases(false); $("workspace-title").focus(); message("Signed in. Your saved cases are private to this local demo.");
  };
  const listCases = async (review) => {
    const cases = await api(review ? "/api/review/cases" : "/api/cases/me");
    $("workspace-title").textContent = review ? "Assigned / permitted cases" : "My cases";
    $("case-list").replaceChildren();
    if (!cases.length) $("case-list").textContent = "No cases yet.";
    cases.forEach((item) => {
      const button = document.createElement("button");
      button.textContent = `${item.status} · ${item.completion}/${item.applicant_section_count} sections reviewed · ${item.case_id.slice(0,8)}`;
      button.onclick = run(() => openCase(item.case_id)); $("case-list").append(button);
    });
  };
  const openCase = async (id, selected) => {
    current = await api(`/api/cases/${id}`);
    sectionId = selected || current.current_section;
    $("case").hidden = false; $("submission").hidden = true;
    $("case-title").textContent = `Synthetic case · ${id.slice(0,8)}`;
    $("case-status").textContent = `${current.status} · ${current.completion}/${current.applicant_section_count} applicant sections reviewed · version ${current.submission_version}`;
    $("review-actions").hidden = !current.can_review;
    $("demo-document").hidden = !config.documents_enabled || !current.is_owner;
    $("submit-case").hidden = !current.is_owner;
    $("sections").replaceChildren();
    forms.sections.forEach((s) => {
      const button = document.createElement("button");
      const done = current.sections.find((x) => x.section_id === s.section_id)?.completed;
      button.textContent = `${done ? "✓ " : ""}${s.title}${s.reviewer_only ? " · reviewer" : ""}`;
      button.setAttribute("aria-current", String(sectionId === s.section_id));
      button.onclick = run(() => { sectionId=s.section_id; renderForm(); document.querySelectorAll("#sections button").forEach((b) => b.setAttribute("aria-current",String(b===button))); });
      $("sections").append(button);
    });
    $("timeline").replaceChildren();
    current.events.forEach((event) => { const li=document.createElement("li"); li.textContent=`${event.action} · ${event.created_at}`; $("timeline").append(li); });
    renderForm(); $("case-title").focus();
  };
  const renderForm = () => {
    const authored = source.getElementById(sectionId);
    const node = authored.cloneNode(true);
    node.querySelectorAll("script, [data-print], [data-clear-form]").forEach((n)=>n.remove());
    const schema = forms.sections.find((s)=>s.section_id===sectionId);
    const answers = current.answers.filter((a)=>a.section_id===sectionId);
    const repeatTemplate = node.querySelector("template");
    if (repeatTemplate) {
      const container=node.querySelector("[data-hazard-list], [data-mitigation-list]");
      const add = (rowId) => {
        const fragment=repeatTemplate.content.cloneNode(true);
        const card=fragment.firstElementChild; card.dataset.rowId=rowId;
        card.querySelectorAll("[name]").forEach((control)=> { control.dataset.questionId=control.name; control.name=`${control.name}--${rowId}`; });
        card.querySelector("[data-remove-row]").onclick=()=>card.remove(); container.append(fragment);
      };
      const rows=[...new Set(answers.map((a)=>a.row_id))];
      (rows.length ? rows : [crypto.randomUUID()]).forEach(add);
      node.querySelector("[data-add-hazard], [data-add-mitigation]").onclick=()=>add(crypto.randomUUID());
    }
    node.querySelectorAll("input,select,textarea").forEach((control)=> {
      const key=control.dataset.questionId || control.name;
      const row=control.closest("[data-row-id]")?.dataset.rowId || "single";
      const answer=answers.find((a)=>a.question_id===key && a.row_id===row);
      if (!answer) return;
      if (control.type==="checkbox") control.checked=answer.value===true;
      else if(control.type==="radio") control.checked=control.value===answer.value;
      else control.value=answer.value;
    });
    node.querySelector("form").onsubmit=(event)=>event.preventDefault();
    const editable=(!schema.reviewer_only || current.can_review) && !["COMPLETED","WITHDRAWN"].includes(current.status) && (current.can_review || ["DRAFT","IN_PROGRESS","READY_FOR_REVIEW","NEEDS_INFORMATION"].includes(current.status));
    node.querySelectorAll("input,select,textarea,button").forEach((n)=>n.disabled=!editable);
    $("save-actions").hidden=!editable;
    $("form-container").replaceChildren(node);
  };
  const save = async (complete) => {
    const answers=[];
    $("form-container").querySelectorAll("input[name],select[name],textarea[name]").forEach((control)=> {
      if(control.type==="radio" && !control.checked) return;
      answers.push({question_id:control.dataset.questionId || control.name, row_id:control.closest("[data-row-id]")?.dataset.rowId || "single", value:control.type==="checkbox" ? control.checked : control.value});
    });
    await api(`/api/cases/${current.case_id}/sections/${sectionId}`,"PUT",{revision:current.revision,complete,answers});
    await openCase(current.case_id,sectionId); message(complete ? "Section marked reviewed. This is not an acceptance decision." : "Draft saved to the local database.");
  };
  $("auth-form").onsubmit=(e)=>{e.preventDefault();run(()=>login(false))();};
  $("signup").onclick=run(()=>login(true));
  $("reset").onclick=run(async()=>{await authRequest("sendOobCode",{requestType:"PASSWORD_RESET",email:$("email").value});message("If the synthetic account exists, the emulator provides a reset link in its local console. No email sent.");});
  $("verify-email").onclick=run(async()=>{await authRequest("sendOobCode",{requestType:"VERIFY_EMAIL",idToken:token});message("Verification link is in the local emulator console. No real email sent.");});
  $("signout").onclick=()=>{token=null;refreshToken=null;current=null;$("auth").hidden=false;$("workspace").hidden=true;$("case").hidden=true;$("form-container").replaceChildren();$("preview-content").replaceChildren();$("case-list").replaceChildren();$("guidance-text").textContent="";$("identity").textContent="";$("timeline").replaceChildren();$("email").focus();message("Signed out. Your saved synthetic case remains in the local database.");};
  $("new-case").onclick=run(async()=>{const item=await api("/api/cases","POST",{synthetic_demo_consent:true});await listCases(false);await openCase(item.case_id);});
  $("my-cases").onclick=run(()=>listCases(false));
  $("review-cases").onclick=run(()=>listCases(true));
  $("save").onclick=run(()=>save(false)); $("complete").onclick=run(()=>save(true));
  $("guidance").onclick=run(async()=>{const ctx=await api(`/api/cases/${current.case_id}/cx-context`);$("guidance-text").textContent=`Local deterministic CX tool preview—not a live GCP session. ${ctx.completed_sections.length} sections reviewed. Next: ${ctx.next_sections.join(", ") || "preview your submission"}. No answers or documents are sent to CX. Ask Evidence is not used.`;});
  $("preview").onclick=()=>{$("submission").hidden=false;$("preview-content").textContent=current.answers.map((a)=>`${a.section_id} / ${a.question_id}: ${a.value}`).join("\n") || "No saved answers yet. Save before previewing.";};
  $("submit-case").onclick=run(async()=>{await api(`/api/cases/${current.case_id}/submit`,"POST",{revision:current.revision});await openCase(current.case_id);message("Synthetic case submitted for demo review.");});
  $("demo-document").onclick=run(async()=>{await api(`/api/cases/${current.case_id}/documents/demo-fixture`,"POST",{synthetic_demo_consent:true});await openCase(current.case_id);message("Private synthetic document fixture added. Real uploads are disabled.");});
  document.querySelectorAll("[data-status]").forEach((button)=>button.onclick=run(async()=>{await api(`/api/cases/${current.case_id}`,"PATCH",{status:button.dataset.status,revision:current.revision});await openCase(current.case_id);}));
  setInterval(async()=>{
    if(!refreshToken) return;
    const expectedRefreshToken=refreshToken;
    try {
      const response=await fetch(`${config.auth_emulator}/securetoken.googleapis.com/v1/token?key=demo-key`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"refresh_token",refresh_token:refreshToken})});
      if(!response.ok) throw new Error(); const data=await response.json();
      if(refreshToken===expectedRefreshToken) {token=data.id_token;refreshToken=data.refresh_token;}
    } catch {if(refreshToken===expectedRefreshToken){$("signout").click();message("Session expired. Sign in again.");}}
  }, 45*60*1000);
  run(async()=>{
    config=await api("/api/config"); forms=await api("/api/forms");
    const response=await fetch("/review-tools/index.html");
    const bytes=await response.arrayBuffer();
    const hash=[...new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))].map((b)=>b.toString(16).padStart(2,"0")).join("");
    if(hash!==forms.source_sha256) throw new Error("Authored forms changed. Restart the local service before continuing.");
    source=new DOMParser().parseFromString(new TextDecoder().decode(bytes),"text/html");
    message("Local synthetic demo ready. No cloud services are called.");
  })();
})();
