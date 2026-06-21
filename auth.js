/* =========================================================================
   FitTrack Pro — shared authentication helper
   Include this file (after the two Firebase <script> tags) on every page
   that should know whether someone is logged in: index.html, login.html,
   bmi.html, calories.html, workout.html, diet.html, weight.html, water.html

   SETUP — replace the six placeholder values below with your own project's
   config. Get them from: Firebase Console → Project settings → General →
   "Your apps" → the </> (Web) app → SDK setup and configuration.
   ========================================================================= */



/* ---------- persistence ----------
   LOCAL = stays signed in permanently, across browser restarts, until the
           person explicitly logs out (this is the default "remember me" state).
   SESSION = signed out automatically once the browser tab/window is closed.
   login.html switches to SESSION if someone unchecks "Remember me". */
function setAuthPersistence(remember){
  const mode = remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
  return auth.setPersistence(mode);
}
// Default to permanent persistence so links followed in/out of the site
// (and brand-new tabs) keep someone logged in without extra steps.
setAuthPersistence(true);

/* ---------- auth actions ---------- */
function signInWithGoogle(){
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
}

function signUpWithEmail(name, email, password){
  return auth.createUserWithEmailAndPassword(email, password).then(function(cred){
    return cred.user.updateProfile({ displayName: name }).then(function(){ return cred; });
  });
}

function signInWithEmail(email, password){
  return auth.signInWithEmailAndPassword(email, password);
}

function resetPassword(email){
  return auth.sendPasswordResetEmail(email);
}

function signOutUser(){
  return auth.signOut();
}

/* ---------- friendly error messages ----------
   Firebase error codes are technical; this maps the common ones to plain
   language so the UI never shows something like "auth/invalid-credential". */
function friendlyAuthError(error){
  const map = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Try again or reset it.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "An account already exists with that email — try logging in instead.",
    "auth/weak-password": "Choose a stronger password (at least 6 characters).",
    "auth/popup-closed-by-user": "Sign-in window was closed before finishing.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    "auth/network-request-failed": "Network error — check your connection and try again.",
    "auth/unauthorized-domain": "This domain isn't authorized yet — add it under Firebase Console → Authentication → Settings → Authorized domains."
  };
  return map[error.code] || error.message || "Something went wrong. Please try again.";
}

/* ---------- shared navbar state ----------
   Any page that wants the navbar to reflect login state just needs an
   empty <span id="auth-nav-slot"></span> in its navbar markup, plus the
   .user-chip CSS block (see FIREBASE-SETUP.md). This swaps it between a
   "Log in" link and an account chip with name + log out automatically. */
function renderAuthNav(){
  const slot = document.getElementById('auth-nav-slot');
  if(!slot) return;

  auth.onAuthStateChanged(function(user){
    if(user){
      const name = user.displayName || (user.email ? user.email.split('@')[0] : 'Account');
      const initial = name.charAt(0).toUpperCase();
      const photo = user.photoURL;

      slot.innerHTML =
        '<div class="user-chip">' +
          (photo
            ? '<img src="' + photo + '" alt="" class="user-avatar" referrerpolicy="no-referrer">'
            : '<span class="user-avatar user-avatar-fallback">' + initial + '</span>') +
          '<span class="user-name">' + name + '</span>' +
          '<button type="button" class="user-logout" id="auth-logout-btn">Log out</button>' +
        '</div>';

      const logoutBtn = document.getElementById('auth-logout-btn');
      if(logoutBtn){
        logoutBtn.addEventListener('click', function(){
          signOutUser().then(function(){ window.location.href = 'index.html'; });
        });
      }
    } else {
      slot.innerHTML = '<a class="nav-cta" href="login.html">Log in</a>';
    }
  });
}

document.addEventListener('DOMContentLoaded', renderAuthNav);