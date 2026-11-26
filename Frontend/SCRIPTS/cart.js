"use strict";
var Project;
(function (Project) {
    let Academy;
    (function (Academy) {
        class CartPage {
            init() {
                try {
                    let user = academySession.getLoggedInUser();
                    if (user === null) {
                        window.location.href = "login.html?returnUrl=cart.html";
                        return;
                    }
                    if (user.TypeID !== 3) {
                        window.location.href = "courses.html?categoryID=0";
                        return;
                    }
                    this.displayCart(user);
                }
                catch (error) {
                    academySession.reportError("Cart page initialization", error);
                    academySession.showMessage("cartMessage", "Your cart could not be opened.", true);
                }
            }
            displayCart(user) {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Cart/" + user.UserID,
                        success: (cart) => {
                            try {
                                let htmlContent = "";
                                let total = 0;
                                if (cart.length === 0) {
                                    $("#cartHeader, #cartLayout").prop("hidden", true);
                                    $("#emptyCart").prop("hidden", false);
                                    return;
                                }
                                cart.forEach(function (item) {
                                    let courseName = item.Cours === undefined
                                        ? "Course #" + item.CourseID
                                        : item.Cours.CourseName;
                                    let courseImage = item.Cours === undefined || !item.Cours.CourseImage
                                        ? "../images/main.avif"
                                        : item.Cours.CourseImage;
                                    let courseDescription = item.Cours === undefined
                                        ? ""
                                        : item.Cours.CourseDescription || "";
                                    total += Number(item.Price);
                                    htmlContent +=
                                        '<article class="cart-card"><img src="' +
                                            academySession.escapeHtml(courseImage) + '" alt="' +
                                            academySession.escapeHtml(courseName) +
                                            '"><div class="cart-info"><h3 class="cart-title">' +
                                            academySession.escapeHtml(courseName) +
                                            '</h3><p class="cart-desc">' +
                                            academySession.escapeHtml(courseDescription) +
                                            '</p><div class="cart-actions"><button type="button" class="remove-btn remove-cart-item" title="Remove course" data-cart-id="' +
                                            item.CartID +
                                            '"><i class="fa-solid fa-xmark"></i></button><span class="cart-price">₹ ' +
                                            Number(item.Price).toLocaleString("en-IN", { minimumFractionDigits: 2 }) +
                                            "</span></div></div></article>";
                                });
                                $("#cartHeader, #cartLayout").prop("hidden", false);
                                $("#emptyCart").prop("hidden", true);
                                $("#cartItemsContainer").html(htmlContent);
                                $("#summaryCount").text(cart.length);
                                $("#summarySubtotal, #summaryTotal").text("₹ " + total.toLocaleString("en-IN", { minimumFractionDigits: 2 }));
                                $(".remove-cart-item").off("click").on("click", function () {
                                    let cartID = Number($(this).attr("data-cart-id"));
                                    cartPage.removeCartItem(cartID, user);
                                });
                            }
                            catch (error) {
                                academySession.reportError("Rendering cart", error);
                                academySession.showMessage("cartMessage", "Your cart could not be displayed.", true);
                            }
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load cart:", status, error, xhr.status);
                            academySession.showMessage("cartMessage", "Your cart could not be loaded. Check that the API is running.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading cart", error);
                    academySession.showMessage("cartMessage", "Your cart could not be loaded.", true);
                }
            }
            removeCartItem(cartID, user) {
                try {
                    $.ajax({
                        type: "DELETE",
                        url: "http://localhost:55157/api/Cart/" + cartID,
                        success: () => {
                            this.displayCart(user);
                            navigationPage.updateCartCounter();
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to remove course from cart:", status, error, xhr.status);
                            academySession.showMessage("cartMessage", "The course could not be removed.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Removing course from cart", error);
                    academySession.showMessage("cartMessage", "The course could not be removed.", true);
                }
            }
        }
        Academy.CartPage = CartPage;
    })(Academy = Project.Academy || (Project.Academy = {}));
})(Project || (Project = {}));
let cartPage = new Project.Academy.CartPage();
$(() => {
    cartPage.init();
});
