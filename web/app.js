// app.js - tiny client helpers for Coffee Shop Frontend
const API_BASE = 'http://localhost:8000';

function qs(sel, el=document){ return el.querySelector(sel); }
function qsa(sel, el=document){ return [...el.querySelectorAll(sel)]; }

// ---- auth helpers ----
function saveToken(token){ sessionStorage.setItem('auth_token', token); }
function getToken(){ return sessionStorage.getItem('auth_token'); }
function clearToken(){ sessionStorage.removeItem('auth_token'); }

function authHeaders(extra={}){
  const token = getToken();
  const headers = {'Content-Type': 'application/json', ...extra};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function escapeHTML(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function api(path, {method='GET', body=null, headers={}, expectJson=true}={}){
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: authHeaders(headers),
    body: body ? JSON.stringify(body) : null,
    credentials: 'omit',
    redirect: 'follow',
    mode: 'cors',
  });
  if (!res.ok){
    let msg = `${res.status} ${res.statusText}`;
    try { const j = await res.json(); if (j && j.detail) msg = j.detail; } catch{}
    throw new Error(msg);
  }
  return expectJson ? res.json() : res.text();
}

function setAuthUI(){
  const authed = !!getToken();
  qsa('[data-authed]').forEach(el => el.style.display = authed ? '' : 'none');
  qsa('[data-guest]').forEach(el => el.style.display = authed ? 'none' : '');
}

function logout(){
  clearToken(); setAuthUI(); location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', setAuthUI);
