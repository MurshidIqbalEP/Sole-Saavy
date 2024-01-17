function validateForm() {
  let FirstName = document.getElementById("name").value;
  let LastName = document.getElementById("lname").value;
  let Email = document.getElementById("email").value;
  let Password = document.getElementById("pass").value;
  let confirmPass = document.getElementById("re_pass").value;

  //////////////////////////////////////////////name validation
  const namereg = /^[a-zA-Z]{1,10}$/;
  if (!namereg.test(FirstName.trim())) {
    FirstNameError.textContent = "Invalid name";
    return false;
  } else {
    FirstNameError.textContent = "";
  }

  if (!namereg.test(LastName.trim())) {
    LastNameError.textContent = "Invalid name";
    return false;
  } else {
    LastNameError.textContent = "";
  }

  ///////////////////////////////////////////////////////////email validation

  const emailRegex =
    /^([a-z0-9\-]+)@([a-z0-9-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/;

  if (!emailRegex.test(Email.trim())) {
    EmailError.textContent = "Invalid Email";
    return false;
  } else {
    EmailError.textContent = "";
  }

  //////////////////////////////////////////////////////////////////////////////////////////////password  validation
  const passwordRegex = /^[a-zA-Z0-9]{5,10}$/;
  if (!passwordRegex.test(Password.trim())) {
    passError.textContent = "Invalid password or password should 5 char";
    return false;
  } else if (Password.trim() !== confirmPass.trim()) {
    re_passError.textContent = "password is not correct";
    return false;
  } else {
    re_passError.textContent = "";
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function  loginValidateForm(){


  let Email = document.getElementById("email").value;
  let Password = document.getElementById("pass").value;
  const emailRegex =
  /^([a-z0-9\-]+)@([a-z0-9-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/;
  if (!emailRegex.test(Email.trim())) {
    EmailError.textContent = "Invalid Email";
    return false;
  } else {
    EmailError.textContent = "";
  }
  const passwordRegex = /^[a-zA-Z0-9]{5,10}$/;
  if (!passwordRegex.test(Password.trim())) {
    passError.textContent = "Invalid password or password should 5 char";
    return false;
  } else if (Password.trim() !== confirmPass.trim()) {
    re_passError.textContent = "password is not correct";
    return false;
  } else {
    re_passError.textContent = "";
  }

}

////////////////////////////////////////////////////////////////////////////////////////

