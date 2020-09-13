document.addEventListener("DOMContentLoaded", function () {
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

  let loginCard = document.getElementById("login-register");
  let logoutButton = document.getElementById("logout-button");
  let usernameTag = document.getElementById("username-tag");
  let changeusernameInput = document.getElementById("change-username-tag");

  let loginBtn = document.getElementById("btn-login");
  let registerBtn = document.getElementById("btn-register");

  let globalUser = null;

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      globalUser = user;
      //Toggle visibility
      if (user.displayName === null) {
        usernameTag.innerHTML = user.email;
      } else {
        usernameTag.innerHTML = user.displayName;
      }
      logoutButton.classList.remove("d-none");
      loginCard.classList.add("d-none");

      //Show task section
      let content = document.getElementById("content");
      content.classList.remove("d-none");
      //Recuest and show tasks

      let dbRef = firebase.database().ref().child(user.email);
      console.log(dbRef);
      dbRef.on("value", (snap) => console.log(snap.val()));
    } else {
      //Toggle visibility
      usernameTag.innerHTML = "";
      logoutButton.classList.add("d-none");
      loginCard.classList.remove("d-none");
    }
  });

  changeusernameInput.onblur = () => {
    changeusernameInput.classList.add("d-none");
    usernameTag.classList.remove("d-none");
    let newUser = changeusernameInput.value;

    if (newUser !== globalUser.displayName) {
      globalUser
        .updateProfile({
          displayName: newUser,
        })
        .then(function () {
          usernameTag.innerHTML = newUser;
        })
        .catch(function (error) {
          usernameTag.innerHTML = globalUser.email;
        });
    }
  };

  usernameTag.onclick = () => {
    if (globalUser !== null) {
      changeusernameInput.classList.remove("d-none");
      changeusernameInput.value = usernameTag.innerHTML;
      changeusernameInput.focus();
      changeusernameInput.select();
      usernameTag.classList.add("d-none");
    }
  };

  loginBtn.onclick = () => {
    let loginEmail = document.getElementById("text-loginEmail").value;
    let loginPassword = document.getElementById("text-loginPassword").value;

    if (loginEmail !== "" && loginPassword !== "") {
      firebase
        .auth()
        .signInWithEmailAndPassword(loginEmail, loginPassword)
        .catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
          console.log("Error: " + errorCode + " Message: " + errorMessage);
        });
    }
  };

  registerBtn.onclick = () => {
    let registerEmail = document.getElementById("text-registerEmail").value;
    let registerPassword = document.getElementById("text-registerPassword")
      .value;
    let registerRepeatPassword = document.getElementById(
      "text-registerRepeatPassword"
    ).value;

    if (registerEmail !== "") {
      if (registerPassword === registerRepeatPassword) {
        firebase
          .auth()
          .createUserWithEmailAndPassword(registerEmail, registerPassword)
          .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...

            console.log("Error: " + errorCode + " Message: " + errorMessage);
          });
      } else {
        alert("The passwords don't match");
      }
    }
  };

  logoutButton.onclick = () => {
    firebase
      .auth()
      .signOut()
      .then(
        () => {
          window.location.reload();
        },
        (error) => {
          console.error("Sign Out Error", error);
        }
      );
  };
});
