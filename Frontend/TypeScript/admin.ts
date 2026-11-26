namespace Project {
    export namespace Academy {
        export class AdminPage {
            private allUsers: UserDetail[] = [];
            private selectedUser: UserDetail | null = null;

            init(): void {
                try {
                    let loggedInUser: UserDetail | null = academySession.getLoggedInUser();
                    if (loggedInUser === null || loggedInUser.TypeID !== 1) {
                        window.location.href = "login.html?returnUrl=admin.html";
                        return;
                    }

                    this.loadUsers();
                    $("#selectUserRole").on("change", function (): void {
                        $("#userSearchInput").val("").prop("disabled", false).attr("placeholder", "Select a user...");
                        $("#selectedUserDetails").html("Choose a user from the search results.");
                        $("#deleteUserButton").prop("disabled", true);
                        adminPage.filterUsers();
                    });

                    $("#userSearchInput").on("focus input", function (): void {
                        adminPage.filterUsers();
                    });

                    $(document).on("click", function (event: JQuery.ClickEvent): void {
                        let target: EventTarget | null = event.target;
                        if (target instanceof Element && $(target).closest(".user-search").length === 0) {
                            $("#userDropdown").prop("hidden", true);
                        }
                    });

                    $("#userDropdown").on("click", ".user-dropdown-item", function (): void {
                        let userID: number = Number($(this).attr("data-user-id"));
                        let user: UserDetail | undefined = adminPage.allUsers.find(function (item: UserDetail): boolean {
                            return item.UserID === userID;
                        });
                        if (user !== undefined) {
                            adminPage.selectedUser = user;
                            $("#userSearchInput").val(user.UserEmail);
                            $("#userDropdown").prop("hidden", true);
                            adminPage.showSelectedUser(user);
                        }
                    });

                    $("#deleteUserButton").on("click", function (): void {
                        if (adminPage.selectedUser !== null) {
                            adminPage.deleteSelectedUser(adminPage.selectedUser.UserID, loggedInUser.UserID);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Admin page initialization", error);
                    academySession.showMessage("adminMessage", "The admin page could not be initialized.", true);
                }
            }

            loadUsers(): void {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/User",
                        success: (users: UserDetail[]): void => {
                            this.allUsers = users;
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to load users:", status, error, xhr.status);
                            academySession.showMessage(
                                "adminMessage",
                                "Users could not be loaded. Check that the API is running.",
                                true
                            );
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Loading users", error);
                    academySession.showMessage("adminMessage", "Users could not be loaded.", true);
                }
            }

            filterUsers(): void {
                try {
                    let selectedRole: string = String($("#selectUserRole").val() || "");
                    let searchText: string = String($("#userSearchInput").val() || "").trim().toLowerCase();
                    let filteredUsers: UserDetail[] = this.allUsers.filter(function (user: UserDetail): boolean {
                        let roleMatches: boolean = selectedRole === "All" || String(user.TypeID) === selectedRole;
                        let emailMatches: boolean = user.UserEmail.toLowerCase().startsWith(searchText);
                        return roleMatches && emailMatches;
                    });

                    let dropdown: JQuery<HTMLElement> = $("#userDropdown");
                    dropdown.empty();
                    if (filteredUsers.length === 0) {
                        dropdown.append($("<div>").addClass("user-dropdown-item no-results").text("No users found"));
                    } else {
                        filteredUsers.forEach(function (user: UserDetail): void {
                            dropdown.append(
                                $("<button>")
                                    .attr("type", "button")
                                    .attr("data-user-id", user.UserID)
                                    .addClass("user-dropdown-item")
                                    .text(user.UserEmail + " — " + user.UserName)
                            );
                        });
                    }
                    dropdown.prop("hidden", false);
                } catch (error: unknown) {
                    academySession.reportError("Filtering users", error);
                    academySession.showMessage("adminMessage", "Users could not be filtered.", true);
                }
            }

            showSelectedUser(user: UserDetail): void {
                try {
                    let htmlContent: string =
                        '<dl class="user-details-list">' +
                        "<dt>User ID</dt><dd>#" + user.UserID + "</dd>" +
                        "<dt>Name</dt><dd>" + academySession.escapeHtml(user.UserName) + "</dd>" +
                        "<dt>Email</dt><dd>" + academySession.escapeHtml(user.UserEmail) + "</dd>" +
                        "<dt>Role</dt><dd>" + academySession.getRoleName(user.TypeID) + "</dd></dl>";

                    $("#selectedUserDetails").html(htmlContent);
                    let loggedInUser: UserDetail | null = academySession.getLoggedInUser();
                    let isSelf: boolean = loggedInUser !== null && loggedInUser.UserID === user.UserID;
                    $("#deleteUserButton").prop("disabled", isSelf);
                } catch (error: unknown) {
                    academySession.reportError("Showing selected user", error);
                    academySession.showMessage("adminMessage", "User details could not be displayed.", true);
                }
            }

            deleteSelectedUser(userID: number, adminID: number): void {
                try {
                    if (this.selectedUser === null || userID === adminID) {
                        return;
                    }
                    if (!window.confirm("Are you sure you want to delete this user?")) {
                        return;
                    }
                    if (
                        this.selectedUser.TypeID === 2 &&
                        !window.confirm(
                            "This instructor may be attached to courses. Deleting this instructor will also delete all of their published courses. Are you sure you want to proceed?"
                        )
                    ) {
                        return;
                    }

                    $.ajax({
                        type: "DELETE",
                        url: "http://localhost:55157/api/User/" + userID,
                        success: (response: boolean): void => {
                            if (!response) {
                                academySession.showMessage("adminMessage", "This user could not be deleted.", true);
                                return;
                            }
                            academySession.showMessage(
                                "adminMessage",
                                "User and associated courses deleted successfully.",
                                false
                            );
                            this.selectedUser = null;
                            $("#userSearchInput").val("");
                            $("#selectedUserDetails").html("Choose a user from the search results.");
                            $("#deleteUserButton").prop("disabled", true);
                            this.loadUsers();
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to delete user:", status, error, xhr.status);
                            academySession.showMessage("adminMessage", "The user could not be deleted.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Deleting user", error);
                    academySession.showMessage("adminMessage", "The user could not be deleted.", true);
                }
            }
        }
    }
}

let adminPage: Project.Academy.AdminPage = new Project.Academy.AdminPage();
$((): void => {
    adminPage.init();
});
