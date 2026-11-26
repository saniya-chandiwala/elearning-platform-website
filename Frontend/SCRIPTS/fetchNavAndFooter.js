"use strict";
var Project;
(function (Project) {
    let Academy;
    (function (Academy) {
        class NavigationPage {
            init() {
                try {
                    this.enforceRolePageAccess();
                    $("#headerPlaceholder").load("navbar.html", () => {
                        try {
                            this.updateAuthIcon();
                            this.updateRoleNavigation();
                            this.updateCartCounter();
                        }
                        catch (error) {
                            academySession.reportError("Navigation initialization", error);
                        }
                    });
                    $("#footerPlaceholder").load("footer.html", (_response, status, xhr) => {
                        try {
                            if (status === "error") {
                                console.error("Unable to load footer:", xhr.status, xhr.statusText);
                            }
                        }
                        catch (error) {
                            academySession.reportError("Footer loading", error);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Shared layout initialization", error);
                }
            }
            enforceRolePageAccess() {
                let user = academySession.getLoggedInUser();
                if (user === null || (user.TypeID !== 1 && user.TypeID !== 2)) {
                    return;
                }
                let rolePage = user.TypeID === 1 ? "admin.html" : "instructor.html";
                let currentPage = window.location.pathname.split("/").pop() || "";
                if (currentPage !== rolePage) {
                    window.location.replace(rolePage);
                }
            }
            updateAuthIcon() {
                let user = academySession.getLoggedInUser();
                if (user === null) {
                    $("#authIcon").prop("hidden", false);
                    $("#logoutButton").prop("hidden", true);
                    return;
                }
                $("#authIcon").prop("hidden", true);
                $("#logoutButton").prop("hidden", false);
                $("#logoutButton").on("click", function () {
                    localStorage.removeItem("loggedInUser");
                    window.location.href = "index.html";
                });
            }
            updateRoleNavigation() {
                let user = academySession.getLoggedInUser();
                if (user === null) {
                    return;
                }
                if (user.TypeID === 1 || user.TypeID === 2) {
                    let rolePage = user.TypeID === 1 ? "admin.html" : "instructor.html";
                    $("#roleNavItem").prop("hidden", true);
                    $("#navLinks .dropdown, #myCoursesLink, #cartNav").prop("hidden", true);
                    $(".brand-logo").attr("href", rolePage);
                    return;
                }
                if (user.TypeID === 3) {
                    $("#myCoursesLink").prop("hidden", false);
                }
            }
            updateCartCounter() {
                let user = academySession.getLoggedInUser();
                if (user === null || user.TypeID !== 3) {
                    $("#cartNav").prop("hidden", true);
                    return;
                }
                $("#cartNav").prop("hidden", false);
                $.ajax({
                    type: "GET",
                    url: "http://localhost:55157/api/Cart/" + user.UserID,
                    success: function (cart) {
                        $("#cartCount").text(cart.length);
                    },
                    error: function (xhr, status, error) {
                        console.error("Unable to load cart count:", status, error, xhr.status);
                    }
                });
            }
        }
        Academy.NavigationPage = NavigationPage;
    })(Academy = Project.Academy || (Project.Academy = {}));
})(Project || (Project = {}));
let navigationPage = new Project.Academy.NavigationPage();
$(() => {
    navigationPage.init();
});
