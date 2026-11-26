"use strict";
var Project;
(function (Project) {
    let Academy;
    (function (Academy) {
        class AdminPage {
            constructor() {
                this.allUsers = [];
                this.selectedUser = null;
            }
            init() {
                try {
                    let loggedInUser = academySession.getLoggedInUser();
                    if (loggedInUser === null || loggedInUser.TypeID !== 1) {
                        window.location.href = "login.html?returnUrl=admin.html";
                        return;
                    }
                    this.loadUsers();
                    $("#selectUserRole").on("change", function () {
                        $("#userSearchInput").val("").prop("disabled", false).attr("placeholder", "Select a user...");
                        $("#selectedUserDetails").html("Choose a user from the search results.");
                        $("#deleteUserButton").prop("disabled", true);
                        adminPage.filterUsers();
                    });
                    $("#userSearchInput").on("focus input", function () {
                        adminPage.filterUsers();
                    });
                    $(document).on("click", function (event) {
                        let target = event.target;
                        if (target instanceof Element && $(target).closest(".user-search").length === 0) {
                            $("#userDropdown").prop("hidden", true);
                        }
                    });
                    $("#userDropdown").on("click", ".user-dropdown-item", function () {
                        let userID = Number($(this).attr("data-user-id"));
                        let user = adminPage.allUsers.find(function (item) {
                            return item.UserID === userID;
                        });
                        if (user !== undefined) {
                            adminPage.selectedUser = user;
                            $("#userSearchInput").val(user.UserEmail);
                            $("#userDropdown").prop("hidden", true);
                            adminPage.showSelectedUser(user);
                        }
                    });
                    $("#deleteUserButton").on("click", function () {
                        if (adminPage.selectedUser !== null) {
                            adminPage.deleteSelectedUser(adminPage.selectedUser.UserID, loggedInUser.UserID);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Admin page initialization", error);
                    academySession.showMessage("adminMessage", "The admin page could not be initialized.", true);
                }
            }
            loadUsers() {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/User",
                        success: (users) => {
                            this.allUsers = users;
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load users:", status, error, xhr.status);
                            academySession.showMessage("adminMessage", "Users could not be loaded. Check that the API is running.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading users", error);
                    academySession.showMessage("adminMessage", "Users could not be loaded.", true);
                }
            }
            filterUsers() {
                try {
                    let selectedRole = String($("#selectUserRole").val() || "");
                    let searchText = String($("#userSearchInput").val() || "").trim().toLowerCase();
                    let filteredUsers = this.allUsers.filter(function (user) {
                        let roleMatches = selectedRole === "All" || String(user.TypeID) === selectedRole;
                        let emailMatches = user.UserEmail.toLowerCase().startsWith(searchText);
                        return roleMatches && emailMatches;
                    });
                    let dropdown = $("#userDropdown");
                    dropdown.empty();
                    if (filteredUsers.length === 0) {
                        dropdown.append($("<div>").addClass("user-dropdown-item no-results").text("No users found"));
                    }
                    else {
                        filteredUsers.forEach(function (user) {
                            dropdown.append($("<button>")
                                .attr("type", "button")
                                .attr("data-user-id", user.UserID)
                                .addClass("user-dropdown-item")
                                .text(user.UserEmail + " — " + user.UserName));
                        });
                    }
                    dropdown.prop("hidden", false);
                }
                catch (error) {
                    academySession.reportError("Filtering users", error);
                    academySession.showMessage("adminMessage", "Users could not be filtered.", true);
                }
            }
            showSelectedUser(user) {
                try {
                    let htmlContent = '<dl class="user-details-list">' +
                        "<dt>User ID</dt><dd>#" + user.UserID + "</dd>" +
                        "<dt>Name</dt><dd>" + academySession.escapeHtml(user.UserName) + "</dd>" +
                        "<dt>Email</dt><dd>" + academySession.escapeHtml(user.UserEmail) + "</dd>" +
                        "<dt>Role</dt><dd>" + academySession.getRoleName(user.TypeID) + "</dd></dl>";
                    $("#selectedUserDetails").html(htmlContent);
                    let loggedInUser = academySession.getLoggedInUser();
                    let isSelf = loggedInUser !== null && loggedInUser.UserID === user.UserID;
                    $("#deleteUserButton").prop("disabled", isSelf);
                }
                catch (error) {
                    academySession.reportError("Showing selected user", error);
                    academySession.showMessage("adminMessage", "User details could not be displayed.", true);
                }
            }
            deleteSelectedUser(userID, adminID) {
                try {
                    if (this.selectedUser === null || userID === adminID) {
                        return;
                    }
                    if (!window.confirm("Are you sure you want to delete this user?")) {
                        return;
                    }
                    if (this.selectedUser.TypeID === 2 &&
                        !window.confirm("This instructor may be attached to courses. Deleting this instructor will also delete all of their published courses. Are you sure you want to proceed?")) {
                        return;
                    }
                    $.ajax({
                        type: "DELETE",
                        url: "http://localhost:55157/api/User/" + userID,
                        success: (response) => {
                            if (!response) {
                                academySession.showMessage("adminMessage", "This user could not be deleted.", true);
                                return;
                            }
                            academySession.showMessage("adminMessage", "User and associated courses deleted successfully.", false);
                            this.selectedUser = null;
                            $("#userSearchInput").val("");
                            $("#selectedUserDetails").html("Choose a user from the search results.");
                            $("#deleteUserButton").prop("disabled", true);
                            this.loadUsers();
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to delete user:", status, error, xhr.status);
                            academySession.showMessage("adminMessage", "The user could not be deleted.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Deleting user", error);
                    academySession.showMessage("adminMessage", "The user could not be deleted.", true);
                }
            }
        }
        Academy.AdminPage = AdminPage;
    })(Academy = Project.Academy || (Project.Academy = {}));
})(Project || (Project = {}));
let adminPage = new Project.Academy.AdminPage();
$(() => {
    adminPage.init();
});
