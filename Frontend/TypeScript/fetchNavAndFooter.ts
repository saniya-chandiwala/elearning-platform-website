namespace Project {
    export namespace Academy {
        export class NavigationPage {
            init(): void {
                try {
                    this.enforceRolePageAccess();
                    $("#headerPlaceholder").load("navbar.html", (): void => {
                        try {
                            this.updateAuthIcon();
                            this.updateRoleNavigation();
                            this.updateCartCounter();
                        } catch (error: unknown) {
                            academySession.reportError("Navigation initialization", error);
                        }
                    });

                    $("#footerPlaceholder").load(
                        "footer.html",
                        (_response: string, status: string, xhr: JQuery.jqXHR): void => {
                            try {
                                if (status === "error") {
                                    console.error("Unable to load footer:", xhr.status, xhr.statusText);
                                }
                            } catch (error: unknown) {
                                academySession.reportError("Footer loading", error);
                            }
                        }
                    );
                } catch (error: unknown) {
                    academySession.reportError("Shared layout initialization", error);
                }
            }

            enforceRolePageAccess(): void {
                let user: UserDetail | null = academySession.getLoggedInUser();
                if (user === null || (user.TypeID !== 1 && user.TypeID !== 2)) {
                    return;
                }

                let rolePage: string = user.TypeID === 1 ? "admin.html" : "instructor.html";
                let currentPage: string = window.location.pathname.split("/").pop() || "";
                if (currentPage !== rolePage) {
                    window.location.replace(rolePage);
                }
            }

            updateAuthIcon(): void {
                let user: UserDetail | null = academySession.getLoggedInUser();
                if (user === null) {
                    $("#authIcon").prop("hidden", false);
                    $("#logoutButton").prop("hidden", true);
                    return;
                }

                $("#authIcon").prop("hidden", true);
                $("#logoutButton").prop("hidden", false);
                $("#logoutButton").on("click", function (): void {
                    localStorage.removeItem("loggedInUser");
                    window.location.href = "index.html";
                });
            }

            updateRoleNavigation(): void {
                let user: UserDetail | null = academySession.getLoggedInUser();
                if (user === null) {
                    return;
                }

                if (user.TypeID === 1 || user.TypeID === 2) {
                    let rolePage: string = user.TypeID === 1 ? "admin.html" : "instructor.html";
                    $("#roleNavItem").prop("hidden", true);
                    $("#navLinks .dropdown, #myCoursesLink, #cartNav").prop("hidden", true);
                    $(".brand-logo").attr("href", rolePage);
                    return;
                }

                if (user.TypeID === 3) {
                    $("#myCoursesLink").prop("hidden", false);
                }
            }

            updateCartCounter(): void {
                let user: UserDetail | null = academySession.getLoggedInUser();
                if (user === null || user.TypeID !== 3) {
                    $("#cartNav").prop("hidden", true);
                    return;
                }

                $("#cartNav").prop("hidden", false);
                $.ajax({
                    type: "GET",
                    url: "http://localhost:55157/api/Cart/" + user.UserID,
                    success: function (cart: CartItem[]): void {
                        $("#cartCount").text(cart.length);
                    },
                    error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                        console.error("Unable to load cart count:", status, error, xhr.status);
                    }
                });
            }
        }
    }
}

let navigationPage: Project.Academy.NavigationPage = new Project.Academy.NavigationPage();
$((): void => {
    navigationPage.init();
});
