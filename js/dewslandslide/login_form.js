$(document).ready(() => {
    initializeSubmitOnClick();
    initializeSubmitOnKeyPressEnter();
});

function initializeSubmitOnClick () {
    $("#login-btn").click(() => {
        attemptLogin();
    });
}

function initializeSubmitOnKeyPressEnter () {
    $("#login-form").keypress((key) => {
        if (key.which === 13) {
            attemptLogin();
        }
    });
}

function attemptLogin () {
    const data = {
        username: $("#username").val(),
        password: $("#password").val()
    };
    validateLogin(data);
}

function validateLogin (data) {
    console.log(data);
    $.post(
        "../account_controller/validateCredentials",
        data
    )
    .done((result) => {
        if (result === "1") {
            // $.notify("Logged in successfully.", "success");
            window.location = "/home";
            console.log("Login Success");
        } else {
            // $.notify("Invalid credentials.", "error");
            alert("Login failed. Username or password does not exist.");
            console.log("Login Failed");
        }
    })
    .catch((error) => {
        console.error(error);
    });
}
