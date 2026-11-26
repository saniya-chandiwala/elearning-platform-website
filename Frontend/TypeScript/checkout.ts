namespace Project {
    export namespace Academy {
        export class CheckoutPage {
            private checkoutHasItems: boolean = false;

            init(): void {
                try {
                    let user: UserDetail | null = academySession.getLoggedInUser();
                    if (user === null || user.TypeID !== 3) {
                        window.location.href = "login.html?returnUrl=checkout.html";
                        return;
                    }

                    this.loadCheckout(user);
                    $("#checkoutForm").on("submit", (event: JQuery.SubmitEvent): void => {
                        event.preventDefault();
                        this.payForCart(user);
                    });
                } catch (error: unknown) {
                    academySession.reportError("Checkout page initialization", error);
                    academySession.showMessage("checkoutMessage", "Checkout could not be opened.", true);
                }
            }

            loadCheckout(user: UserDetail): void {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Cart/" + user.UserID,
                        success: (cart: CartItem[]): void => {
                            try {
                                let htmlContent: string = "";
                                let total: number = 0;
                                if (cart.length === 0) {
                                    $("#checkoutForm").prop("hidden", true);
                                    academySession.showMessage(
                                        "checkoutMessage",
                                        "Your cart is empty. Add a course before checkout.",
                                        true
                                    );
                                    return;
                                }

                                this.checkoutHasItems = true;
                                cart.forEach(function (item: CartItem): void {
                                    let courseName: string = item.Cours === undefined
                                        ? "Course #" + item.CourseID
                                        : item.Cours.CourseName;
                                    total += Number(item.Price);
                                    htmlContent +=
                                        "<p>" + academySession.escapeHtml(courseName) + " — ₹ " +
                                        Number(item.Price).toLocaleString("en-IN", { minimumFractionDigits: 2 }) +
                                        "</p>";
                                });

                                $("#checkoutItems").html(htmlContent);
                                $("#checkoutTotal").text(
                                    "₹ " + total.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                                );
                                $("#payButton").text(
                                    "Pay ₹ " + total.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                                );
                            } catch (error: unknown) {
                                academySession.reportError("Rendering checkout", error);
                                academySession.showMessage("checkoutMessage", "Checkout could not be displayed.", true);
                            }
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to load checkout cart:", status, error, xhr.status);
                            academySession.showMessage(
                                "checkoutMessage",
                                "Checkout could not be loaded. Check that the API is running.",
                                true
                            );
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Loading checkout", error);
                    academySession.showMessage("checkoutMessage", "Checkout could not be loaded.", true);
                }
            }

            payForCart(user: UserDetail | null): void {
                try {
                    let paymentModeID: number = Number($("input[name='paymentMode']:checked").val());
                    if (
                        user === null ||
                        !this.checkoutHasItems ||
                        (paymentModeID !== 1 && paymentModeID !== 2)
                    ) {
                        academySession.showMessage(
                            "checkoutMessage",
                            "Choose a payment method and make sure your cart contains a course.",
                            true
                        );
                        return;
                    }

                    let cardName: string = String($("#cardName").val() || "").trim();
                    let cardNumber: string = String($("#cardNumber").val() || "").replace(/\s/g, "");
                    let expiry: string = String($("#cardExpiry").val() || "").trim();
                    let cvv: string = String($("#cardCvv").val() || "").trim();
                    let expiryParts: RegExpMatchArray | null = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
                    let expiryValid: boolean = false;

                    if (expiryParts !== null) {
                        let expiryMonth: number = Number(expiryParts[1]);
                        let expiryYear: number = 2000 + Number(expiryParts[2]);
                        let currentDate: Date = new Date();
                        let currentMonth: number = currentDate.getMonth() + 1;
                        let currentYear: number = currentDate.getFullYear();
                        expiryValid = expiryYear > currentYear ||
                            (expiryYear === currentYear && expiryMonth >= currentMonth);
                    }

                    if (
                        cardName.length === 0 ||
                        !/^\d{12,19}$/.test(cardNumber) ||
                        !expiryValid ||
                        !/^\d{3,4}$/.test(cvv)
                    ) {
                        academySession.showMessage(
                            "checkoutMessage",
                            "Enter a valid card number (12–19 digits), a future expiry (MM/YY), and a 3–4 digit CVV.",
                            true
                        );
                        return;
                    }

                    $("#payButton").prop("disabled", true);
                    $.ajax({
                        type: "POST",
                        url: "http://localhost:55157/api/Invoice",
                        data: {
                            UserID: user.UserID,
                            PaymentModeID: paymentModeID,
                            TotalAmount: 0
                        },
                        success: (response: boolean): void => {
                            if (!response) {
                                academySession.showMessage(
                                    "checkoutMessage",
                                    "The invoice could not be generated. Your cart may be empty.",
                                    true
                                );
                                $("#payButton").prop("disabled", false);
                                return;
                            }
                            window.location.href = "profile.html?purchase=complete";
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Checkout request failed:", status, error, xhr.status);
                            academySession.showMessage(
                                "checkoutMessage",
                                "Payment could not be completed. Please try again.",
                                true
                            );
                            $("#payButton").prop("disabled", false);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Completing checkout", error);
                    academySession.showMessage("checkoutMessage", "Payment could not be completed.", true);
                }
            }
        }
    }
}

let checkoutPage: Project.Academy.CheckoutPage = new Project.Academy.CheckoutPage();
$((): void => {
    checkoutPage.init();
});
