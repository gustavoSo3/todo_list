document.addEventListener("DOMContentLoaded", function () {
  let loginCard = document.getElementById("login-register");
  let logoutButton = document.getElementById("logout-button");
  let usernameTag = document.getElementById("username-tag");
  let changeusernameInput = document.getElementById("change-username-tag");

  let addTaskBtn = document.getElementById("btn-addTask");

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

      let dbRef = firebase
        .database()
        .ref()
        .child("users/" + user.uid + "/");
      dbRef.on("child_added", (snap) => {
        //console.log(snap.val());
        //console.log(Object.keys(snap.val()));
        let dbTasks = snap.val();
        addTaskToPage(dbTasks);
      });
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
  function getDate(date) {
    let dd = date.slice(8, 10);
    let mm = date.slice(5, 7);
    let yy = date.slice(0, 4);

    return mm + "/" + dd + "/" + yy;
  }

  function addTaskToPage(task) {
    let date = getDate(task.date);

    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "container");
    cardBody.id = task.date;

    let titleDiv = document.createElement("div");
    titleDiv.classList.add("row");

    let cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title", "col-sm-8");
    cardTitle.innerText = task.title;

    let cardDate = document.createElement("h6");
    cardDate.classList.add("card-text", "col-sm-4", "text-muted");
    cardDate.innerText = date;

    titleDiv.appendChild(cardTitle);
    titleDiv.appendChild(cardDate);

    let descriptionTag = document.createElement("p");
    descriptionTag.classList.add("card-subtitle", "text-muted");
    descriptionTag.innerText = "Description";

    let cardDescription = document.createElement("p");
    cardDescription.classList.add("card-subtitle");
    cardDescription.innerText =
      task.description !== ""
        ? task.description
        : "No description for this task.";

    let insert = document.getElementById("insert-tasks");

    let doneBtn = document.createElement("button");
    doneBtn.classList.add("btn", "btn-success");
    doneBtn.innerText = "Done";
    doneBtn.onclick = () => {
      firebase
        .database()
        .ref()
        .child("users/" + globalUser.uid + "/" + task.date)
        .set(null, function (error) {
          if (error) {
            // The write failed...
          } else {
            // Data saved successfully!
            insert.removeChild(cardBody);
          }
        });
    };
    //@TODO ADD DESTRUCTION OF TASK

    cardBody.appendChild(titleDiv);
    cardBody.appendChild(descriptionTag);
    cardBody.appendChild(cardDescription);
    cardBody.appendChild(doneBtn);

    insert.appendChild(cardBody);
  }
  function createTask(title, description) {
    let currentDate = new Date().toJSON().replace(/:/g, "-").replace(".", "-");
    return (task = {
      date: currentDate,
      title: title,
      description: description,
    });
  }

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

  addTaskBtn.onclick = () => {
    let newTaskTitle = document.getElementById("text-taskTitle").value;
    let newTaskDescription = document.getElementById("text-taskDescription")
      .value;

    document.getElementById("text-taskTitle").value = "";
    document.getElementById("text-taskDescription").value = "";
    let newTask;
    if (newTaskTitle !== "") {
      newTask = createTask(newTaskTitle, newTaskDescription);
    } else return null;

    firebase
      .database()
      .ref("users/" + globalUser.uid + "/" + newTask.date + "/")
      .set(newTask);
  };
});
