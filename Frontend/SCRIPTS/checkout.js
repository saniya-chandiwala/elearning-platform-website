"use strict";
var Project;
(function (Project) {
    let Academy;
    (function (Academy) {
        class CheckoutPage {
            constructor() {
                this.checkoutHasItems = false;
            }
            init() {
                try {
                    let user = academySession.getLoggedInUser();
                    if (user === null || user.TypeID !== 3) {
                        window.location.href = "login.html?returnUrl=checkout.html";
                        return;
                    }
                    this.loadCheckout(user);
                    $("#checkoutForm").on("submit", (event) => {
                        event.preventDefault();
                        this.payForCart(user);
                    });
                }
                catch (error) {
                    academySession.reportError("Checkout page initialization", error);
                    academySession.showMessage("checkoutMessage", "Checkout could not be opened.", true);
                }
            }
            loadCheckout(user) {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Cart/" + user.UserID,
                        success: (cart) => {
                            try {
                                let htmlContent = "";
                                let total = 0;
                                if (cart.length === 0) {
                                    $("#checkoutForm").prop("hidden", true);
                                    academySession.showMessage("checkoutMessage", "Your cart is empty. Add a course before checkout.", true);
                                    return;
                                }
                                this.checkoutHasItems = true;
                                cart.forEach(function (item) {
                                    let courseName = item.Cours === undefined
                                        ? "Course #" + item.CourseID
                                        : item.Cours.CourseName;
                                    total += Number(item.Price);
                                    htmlContent +=
                                        "<p>" + academySession.escapeHtml(courseName) + " — ₹ " +
                                            Number(item.Price).toLocaleString("en-IN", { minimumFractionDigits: 2 }) +
                                            "</p>";
                                });
                                $("#checkoutItems").html(htmlContent);
                                $("#checkoutTotal").text("₹ " + total.toLocaleString("en-IN", { minimumFractionDigits: 2 }));
                                $("#payButton").text("Pay ₹ " + total.toLocaleString("en-IN", { minimumFractionDigits: 2 }));
                            }
                            catch (error) {
                                academySession.reportError("Rendering checkout", error);
                                academySession.showMessage("checkoutMessage", "Checkout could not be displayed.", true);
                            }
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load checkout cart:", status, error, xhr.status);
                            academySession.showMessage("checkoutMessage", "Checkout could not be loaded. Check that the API is running.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading checkout", error);
                    academySession.showMessage("checkoutMessage", "Checkout could not be loaded.", true);
                }
            }
            payForCart(user) {
                try {
                    let paymentModeID = Number($("input[name='paymentMode']:checked").val());
                    if (user === null ||
                        !this.checkoutHasItems ||
                        (paymentModeID !== 1 && paymentModeID !== 2)) {
                        academySession.showMessage("checkoutMessage", "Choose a payment method and make sure your cart contains a course.", true);
                        return;
                    }
                    let cardName = String($("#cardName").val() || "").trim();
                    let cardNumber = String($("#cardNumber").val() || "").replace(/\s/g, "");
                    let expiry = String($("#cardExpiry").val() || "").trim();
                    let cvv = String($("#cardCvv").val() || "").trim();
                    let expiryParts = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
                    let expiryValid = false;
                    if (expiryParts !== null) {
                        let expiryMonth = Number(expiryParts[1]);
                        let expiryYear = 2000 + Number(expiryParts[2]);
                        let currentDate = new Date();
                        let currentMonth = currentDate.getMonth() + 1;
                        let currentYear = currentDate.getFullYear();
                        expiryValid = expiryYear > currentYear ||
                            (expiryYear === currentYear && expiryMonth >= currentMonth);
                    }
                    if (cardName.length === 0 ||
                        !/^\d{12,19}$/.test(cardNumber) ||
                        !expiryValid ||
                        !/^\d{3,4}$/.test(cvv)) {
                        academySession.showMessage("checkoutMessage", "Enter a valid card number (12–19 digits), a future expiry (MM/YY), and a 3–4 digit CVV.", true);
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
                        success: (response) => {
                            if (!response) {
                                academySession.showMessage("checkoutMessage", "The invoice could not be generated. Your cart may be empty.", true);
                                $("#payButton").prop("disabled", false);
                                return;
                            }
                            window.location.href = "profile.html?purchase=complete";
                        },
                        error: function (xhr, status, error) {
                            console.error("Checkout request failed:", status, error, xhr.status);
                            academySession.showMessage("checkoutMessage", "Payment could not be completed. Please try again.", true);
                            $("#payButton").prop("disabled", false);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Completing checkout", error);
                    academySession.showMessage("checkoutMessage", "Payment could not be completed.", true);
                }
            }
        }
        Academy.CheckoutPage = CheckoutPage;
    })(Academy = Project.Academy || (Project.Academy = {}));
})(Project || (Project = {}));
let checkoutPage = new Project.Academy.CheckoutPage();
$(() => {
    checkoutPage.init();
});
