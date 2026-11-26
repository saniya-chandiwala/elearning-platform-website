namespace Project {
    export namespace Academy {
        export class AuthPage {
            init(): void {
                try {
                    $("#toggleLoginPassword").on("click", function (): void {
                        authPage.togglePassword("loginPassword", "toggleLoginPassword");
                    });
                    $("#toggleRegisterPassword").on("click", function (): void {
                        authPage.togglePassword("registerPassword", "toggleRegisterPassword");
                    });
                    $("#toggleRegisterConfirmPassword").on("click", function (): void {
                        authPage.togglePassword("registerConfirmPassword", "toggleRegisterConfirmPassword");
                    });
                    $("#loginForm").on("submit", function (event: JQuery.SubmitEvent): void {
                        event.preventDefault();
                        authPage.loginUser();
                    });
                    $("#registerForm").on("submit", function (event: JQuery.SubmitEvent): void {
                        event.preventDefault();
                        authPage.registerUser();
                    });
                } catch (error: unknown) {
                    academySession.reportError("Authentication page initialization", error);
                }
            }

            togglePassword(inputID: string, buttonID: string): void {
                try {
                    let input: JQuery<HTMLInputElement> = $("#" + inputID);
                    let button: JQuery<HTMLElement> = $("#" + buttonID);
                    if (input.attr("type") === "password") {
                        input.attr("type", "text");
                        button.find("i").removeClass("fa-eye").addClass("fa-eye-slash");
                    } else {
                        input.attr("type", "password");
                        button.find("i").removeClass("fa-eye-slash").addClass("fa-eye");
                    }
                } catch (error: unknown) {
                    academySession.reportError("Toggling password visibility", error);
                }
            }

            loginUser(): void {
                try {
                    let email: string = String($("#loginEmail").val() || "").trim();
                    let password: string = String($("#loginPassword").val() || "");
                    if (email.length === 0 || password.length === 0) {
                        academySession.showMessage("loginError", "Email and password cannot be empty.", true);
                        return;
                    }

                    $("#loginSubmitBtn").prop("disabled", true);
                    $.ajax({
                        type: "POST",
                        url: "http://localhost:55157/api/Auth/Login",
                        data: {
                            UserEmail: email,
                            UserPassword: password
                        },
                        success: (user: UserDetail | null): void => {
                            if (user === null) {
                                academySession.showMessage("loginError", "Invalid email or password.", true);
                                $("#loginSubmitBtn").prop("disabled", false);
                                return;
                            }

                            academySession.saveLoggedInUser(user);
                            if (user.TypeID === 1) {
                                sessionStorage.removeItem("pendingCourseID");
                                window.location.href = "admin.html";
                                return;
                            }
                            if (user.TypeID === 2) {
                                sessionStorage.removeItem("pendingCourseID");
                                window.location.href = "instructor.html";
                                return;
                            }

                            let returnUrl: string | null =
                                new URLSearchParams(window.location.search).get("returnUrl");
                            this.addPendingCourse(user, function (): void {
                                if (returnUrl !== null && /^[a-zA-Z0-9_-]+\.html$/.test(returnUrl)) {
                                    window.location.href = returnUrl;
                                } else {
                                    window.location.href = "index.html";
                                }
                            });
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Login request failed:", status, error, xhr.status);
                            academySession.showMessage(
                                "loginError",
                                "Login failed. Check that the API is running and try again.",
                                true
                            );
                            $("#loginSubmitBtn").prop("disabled", false);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Signing in", error);
                    academySession.showMessage("loginError", "Login could not be completed.", true);
                }
            }

            addPendingCourse(user: UserDetail, callback: () => void): void {
                try {
                    let pendingCourseID: string | null = sessionStorage.getItem("pendingCourseID");
                    if (pendingCourseID === null) {
                        callback();
                        return;
                    }
                    if (user.TypeID !== 3) {
                        sessionStorage.removeItem("pendingCourseID");
                        callback();
                        return;
                    }

                    $.ajax({
                        type: "POST",
                        url: "http://localhost:55157/api/Cart",
                        data: {
                            UserID: user.UserID,
                            CourseID: Number(pendingCourseID),
                            Price: 0
                        },
                        success: function (response: boolean): void {
                            sessionStorage.removeItem("pendingCourseID");
                            if (!response) {
                                console.log("Course was already in the cart or the user is enrolled.");
                            }
                            callback();
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to add pending course to cart:", status, error, xhr.status);
                            alert("You are signed in, but the selected course could not be added to your cart.");
                            callback();
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Adding pending course to cart", error);
                    throw error;
                }
            }

            registerUser(): void {
                try {
                    let name: string = String($("#registerName").val() || "").trim();
                    let email: string = String($("#registerEmail").val() || "").trim();
                    let roleID: number = Number($("#registerRole").val());
                    let password: string = String($("#registerPassword").val() || "");
                    if (name.length === 0 || email.length === 0) {
                        academySession.showMessage("registerError", "Enter your name and email.", true);
                        return;
                    }

                    $.ajax({
                        type: "POST",
                        url: "http://localhost:55157/api/Auth/Register",
                        data: {
                            UserName: name,
                            UserEmail: email,
                            UserPassword: password,
                            TypeID: roleID
                        },
                        success: function (response: boolean): void {
                            if (!response) {
                                academySession.showMessage(
                                    "registerError",
                                    "An account with this email already exists.",
                                    true
                                );
                                return;
                            }
                            academySession.showMessage(
                                "registerSuccess",
                                "Account created. Redirecting to sign in...",
                                false
                            );
                            window.setTimeout(function (): void {
                                window.location.href = "login.html";
                            }, 900);
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Registration request failed:", status, error, xhr.status);
                            academySession.showMessage(
                                "registerError",
                                "Registration failed. Check that the API is running and try again.",
                                true
                            );
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Registering account", error);
                    academySession.showMessage("registerError", "Registration could not be completed.", true);
                }
            }
        }
    }
}

let authPage: Project.Academy.AuthPage = new Project.Academy.AuthPage();
$((): void => {
    authPage.init();
});
