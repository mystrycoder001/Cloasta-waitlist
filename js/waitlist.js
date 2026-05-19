import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient(
  'https://ibsngqwkaasswscqnlhl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlic25ncXdrYWFzc3dzY3FubGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTMwMTAsImV4cCI6MjA5NDMyOTAxMH0.Obb19o0RfcPfyh_R1ygowBLiUtUDr7dz38978tb9nG0'
)

async function getWaitlistCount() {
  try {
    const { count, error } = await supabase
    .from('cloasta_waitlist')
    .select('*', { 
      count: 'exact', 
      head: true 
    })
    
    if (error) {
      console.error('Count error from Supabase:', error)
      return
    }
    
    const el = document.getElementById('waitlist-count')
    if (el) el.textContent = count !== null ? count : 0
  } catch (e) {
    console.error('Count error:', e)
  }
}

async function joinWaitlist(e) {
  if (e) e.preventDefault();
  
  const emailEl = document.getElementById('waitlist-email')
  const roleEl = document.getElementById('waitlist-role')
  const btn = document.getElementById('waitlist-btn') || document.getElementById('waitlist-submit-btn') || document.querySelector('button[type="submit"]') || document.querySelector('.waitlist-btn')
  
  if (!emailEl) {
    console.error('Email input not found')
    return false
  }
  
  const email = emailEl.value.trim().toLowerCase()
  const role = roleEl?.value || 'general'
  
  if (!email || !email.includes('@')) {
    showError('Please enter valid email')
    return false
  }
  
  if (btn) {
    btn.disabled = true
    btn.innerHTML = '<span>Joining...</span>'
  }
  
  try {
    console.log('Attempting insert:', { email, role })
    
    const { data, error } = await supabase
    .from('cloasta_waitlist')
    .insert({ 
      email: email,
      role: role,
      source: document.referrer || 'direct'
    })
    
    console.log('Result:', { data, error })
    
    if (error) {
      if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
        showSuccess(null, true)
        return false
      }
      throw new Error(error.message)
    }
    
    const { count } = await supabase
    .from('cloasta_waitlist')
    .select('*', { 
      count: 'exact', 
      head: true 
    })
    
    showSuccess(count, false)
    
  } catch (err) {
    console.error('Full error:', err)
    if (btn) {
      btn.disabled = false
      btn.innerHTML = '<span>Get Early Access</span>'
    }
    showError(err.message)
  }
  return false;
}

function showError(msg) {
  let toast = document.getElementById('error-toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'error-toast'
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a1a;
      border: 1px solid #333;
      color: white;
      padding: 12px 24px;
      border-radius: 100px;
      font-size: 14px;
      z-index: 9999;
    `
    document.body.appendChild(toast)
  }
  toast.textContent = '❌ ' + msg
  setTimeout(() => toast.remove(), 4000)
}

function showSuccess(count, existing) {
  const formSection = document.getElementById('waitlist-form') || document.querySelector('form') || document.querySelector('.waitlist-form-container')
  const formContainer = document.getElementById('form-container')
  
  if (formSection) {
    formSection.style.display = 'none'
  }
  if (formContainer) {
    formContainer.style.display = 'none'
  }
  
  let successDiv = document.getElementById('success-state')
  
  if (!successDiv) {
    successDiv = document.createElement('div')
    successDiv.id = 'success-state'
    successDiv.style.cssText = `
      text-align: center;
      padding: 40px 20px;
      max-width: 500px;
      margin: 0 auto;
    `
    formSection?.parentNode.insertBefore(successDiv, formSection.nextSibling)
  }
  
  successDiv.innerHTML = existing ? `
    <div style="font-size:48px">🎉</div>
    <h2 style="color:white;margin:16px 0">You're already on the list!</h2>
    <p style="color:#888">We'll see you on May 20. Stay tuned!</p>
  ` : `
    <div style="font-size:48px">🎉</div>
    <h2 style="color:white;margin:16px 0">You're on the list!</h2>
    ${count !== null && count !== undefined ? `<p style="color:#888">You are one of <strong style="color:white">${count}</strong> people waiting.</p>` : ''}
    <p style="color:#888;margin:8px 0">Cloasta launches May 20.</p>
    
    <div style="
      display:flex;
      gap:12px;
      justify-content:center;
      margin-top:24px;
    ">
      <button onclick="shareTwitter()" 
      style="
        background:black;
        border:1px solid #333;
        color:white;
        padding:10px 20px;
        border-radius:100px;
        cursor:pointer;
        font-size:14px;
      ">
        Share on Twitter 𝕏
      </button>
      <button onclick="shareWhatsApp()"
      style="
        background:black;
        border:1px solid #333;
        color:white;
        padding:10px 20px;
        border-radius:100px;
        cursor:pointer;
        font-size:14px;
      ">
        Share on WhatsApp
      </button>
    </div>
  `
  
  successDiv.style.display = 'block'
}

window.shareTwitter = function() {
  const text = encodeURIComponent(
    "I just joined @CloastaAI waitlist 🌊\n\nYour AI. Closest to you.\n\nLaunching May 20 👇\ncloasta-waitlist.vercel.app\n\n#Cloasta #AI #buildinpublic"
  )
  window.open('https://twitter.com/intent/tweet?text=' + text, '_blank')
}

window.shareWhatsApp = function() {
  const text = encodeURIComponent(
    "I just joined Cloasta waitlist! 🌊\nYour AI closest to you.\nLaunching May 20!\ncloasta-waitlist.vercel.app"
  )
  window.open('https://wa.me/?text=' + text, '_blank')
}

// Make sure joinWaitlist is accessible globally for the onsubmit handler
window.joinWaitlist = joinWaitlist;

function init() {
  getWaitlistCount()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

export { joinWaitlist, shareTwitter, shareWhatsApp }
