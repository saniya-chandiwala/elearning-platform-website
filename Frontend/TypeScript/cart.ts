namespace Project {
    export namespace Academy {
        export class CartPage {
            init(): void {
                try {
                    let user: UserDetail | null = academySession.getLoggedInUser();
                    if (user === null) {
                        window.location.href = "login.html?returnUrl=cart.html";
                        return;
                    }
                    if (user.TypeID !== 3) {
                        window.location.href = "courses.html?categoryID=0";
                        return;
                    }
                    this.displayCart(user);
                } catch (error: unknown) {
                    academySession.reportError("Cart page initialization", error);
                    academySession.showMessage("cartMessage", "Your cart could not be opened.", true);
                }
            }

            displayCart(user: UserDetail): void {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Cart/" + user.UserID,
                        success: (cart: CartItem[]): void => {
                            try {
                                let htmlContent: string = "";
                                let total: number = 0;
                                if (cart.length === 0) {
                                    $("#cartHeader, #cartLayout").prop("hidden", true);
                                    $("#emptyCart").prop("hidden", false);
                                    return;
                                }

                                cart.forEach(function (item: CartItem): void {
                                    let courseName: string = item.Cours === undefined
                                        ? "Course #" + item.CourseID
                                        : item.Cours.CourseName;
                                    let courseImage: string = item.Cours === undefined || !item.Cours.CourseImage
                                        ? "../images/main.avif"
                                        : item.Cours.CourseImage;
                                    let courseDescription: string = item.Cours === undefined
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
                                $("#summarySubtotal, #summaryTotal").text(
                                    "₹ " + total.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                                );

                                $(".remove-cart-item").off("click").on("click", function (): void {
                                    let cartID: number = Number($(this).attr("data-cart-id"));
                                    cartPage.removeCartItem(cartID, user);
                                });
                            } catch (error: unknown) {
                                academySession.reportError("Rendering cart", error);
                                academySession.showMessage("cartMessage", "Your cart could not be displayed.", true);
                            }
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to load cart:", status, error, xhr.status);
                            academySession.showMessage(
                                "cartMessage",
                                "Your cart could not be loaded. Check that the API is running.",
                                true
                            );
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Loading cart", error);
                    academySession.showMessage("cartMessage", "Your cart could not be loaded.", true);
                }
            }

            removeCartItem(cartID: number, user: UserDetail): void {
                try {
                    $.ajax({
                        type: "DELETE",
                        url: "http://localhost:55157/api/Cart/" + cartID,
                        success: (): void => {
                            this.displayCart(user);
                            navigationPage.updateCartCounter();
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to remove course from cart:", status, error, xhr.status);
                            academySession.showMessage("cartMessage", "The course could not be removed.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Removing course from cart", error);
                    academySession.showMessage("cartMessage", "The course could not be removed.", true);
                }
            }
        }
    }
}

let cartPage: Project.Academy.CartPage = new Project.Academy.CartPage();
$((): void => {
    cartPage.init();
});
