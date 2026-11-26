"use strict";
var Project;
(function (Project) {
    let Academy;
    (function (Academy) {
        class Session {
            init() {
                try {
                    $.ajaxSetup({
                        timeout: 300000
                    });
                }
                catch (error) {
                    this.reportError("Session initialization", error);
                }
            }
            getLoggedInUser() {
                try {
                    let savedUser = localStorage.getItem("loggedInUser");
                    if (savedUser === null) {
                        return null;
                    }
                    return JSON.parse(savedUser);
                }
                catch (error) {
                    this.reportError("Reading the signed-in user", error);
                    throw error;
                }
            }
            saveLoggedInUser(user) {
                try {
                    let safeUser = {
                        UserID: user.UserID,
                        TypeID: user.TypeID,
                        UserName: user.UserName,
                        UserEmail: user.UserEmail
                    };
                    localStorage.setItem("loggedInUser", JSON.stringify(safeUser));
                }
                catch (error) {
                    this.reportError("Saving the signed-in user", error);
                    throw error;
                }
            }
            getRoleName(typeID) {
                try {
                    if (typeID === 1) {
                        return "Admin";
                    }
                    if (typeID === 2) {
                        return "Instructor";
                    }
                    return "Student";
                }
                catch (error) {
                    this.reportError("Getting the user role", error);
                    throw error;
                }
            }
            showMessage(elementID, message, isError) {
                try {
                    let messageElement = $("#" + elementID);
                    messageElement.text(message);
                    messageElement.toggleClass("error-message", isError);
                    messageElement.prop("hidden", false);
                }
                catch (error) {
                    this.reportError("Displaying a page message", error);
                    throw error;
                }
            }
            escapeHtml(value) {
                try {
                    let textElement = document.createElement("div");
                    textElement.textContent = value;
                    return textElement.innerHTML;
                }
                catch (error) {
                    this.reportError("Escaping text for display", error);
                    throw error;
                }
            }
            reportError(functionName, error) {
                try {
                    console.error(functionName + " failed:", error);
                }
                catch (reportingError) {
                    console.error("Unable to report an error:", reportingError);
                }
            }
        }
        Academy.Session = Session;
    })(Academy = Project.Academy || (Project.Academy = {}));
})(Project || (Project = {}));
let academySession = new Project.Academy.Session();
$(() => {
    academySession.init();
});
