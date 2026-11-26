"use strict";
var Project;
(function (Project) {
    let Academy;
    (function (Academy) {
        class HomePage {
            constructor() {
                this.categories = [];
            }
            init() {
                try {
                    this.loadCategories();
                }
                catch (error) {
                    academySession.reportError("Home page initialization", error);
                    $("#courseList").html("<p class='page-message error-message'>Courses could not be loaded.</p>");
                }
            }
            loadCategories() {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Category",
                        success: (categories) => {
                            try {
                                this.categories = categories;
                                let htmlContent = "";
                                let categoryDescriptions = [
                                    "Full-Stack, APIs & Frameworks",
                                    "Machine Learning & Neural Nets",
                                    "Network Defense & Security",
                                    "DevOps, Systems & Pipelines"
                                ];
                                let iconClasses = ["cat-web", "cat-data", "cat-security", "cat-cloud"];
                                categories.slice(0, 4).forEach(function (category, index) {
                                    htmlContent +=
                                        '<a class="category-card" href="courses.html?categoryID=' +
                                            category.CategoryID + '">' +
                                            '<span class="cat-icon ' + iconClasses[index] +
                                            '"></span><span class="cat-info"><strong>' +
                                            academySession.escapeHtml(category.CategoryName) + '</strong><small>' +
                                            categoryDescriptions[index] + "</small></span></a>";
                                });
                                $("#categoryGrid").html(htmlContent);
                            }
                            catch (error) {
                                academySession.reportError("Home category rendering", error);
                                $("#categoryGrid").html("<p class='page-message error-message'>Categories could not be displayed.</p>");
                            }
                            this.loadCourses();
                        },
                        error: (xhr, status, error) => {
                            console.error("Unable to load course categories:", status, error, xhr.status);
                            $("#categoryGrid").html("<p class='page-message error-message'>Categories could not be loaded.</p>");
                            this.loadCourses();
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading home categories", error);
                    $("#categoryGrid").html("<p class='page-message error-message'>Categories could not be loaded.</p>");
                    this.loadCourses();
                }
            }
            loadCourses() {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Course",
                        success: (courses) => {
                            try {
                                this.displayCourses(courses.slice(0, 3));
                            }
                            catch (error) {
                                academySession.reportError("Home course rendering", error);
                                $("#courseList").html("<p class='page-message error-message'>Courses could not be displayed.</p>");
                            }
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load courses:", status, error, xhr.status, xhr.responseText);
                            let errorMessage = xhr.status > 0
                                ? "Course loading failed (HTTP " + xhr.status +
                                    "). Check the API error in the browser console."
                                : "Courses could not be loaded. Check that the API is running.";
                            $("#courseList").html("<p class='page-message error-message'>" + errorMessage + "</p>");
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading home courses", error);
                    $("#courseList").html("<p class='page-message error-message'>Courses could not be loaded.</p>");
                }
            }
            displayCourses(courses) {
                try {
                    if (courses.length === 0) {
                        $("#courseList").html("<p class='empty-state'>No courses are available in this category yet.</p>");
                        return;
                    }
                    let htmlContent = "";
                    courses.forEach((course) => {
                        let courseCategory = this.categories.find(function (category) {
                            return category.CategoryID === course.CategoryID;
                        });
                        let categoryName = courseCategory === undefined
                            ? "Course"
                            : courseCategory.CategoryName;
                        let instructorName = course.UserDetail === undefined
                            ? "Academy Instructor"
                            : course.UserDetail.UserName;
                        let image = course.CourseImage && course.CourseImage.length > 0
                            ? course.CourseImage
                            : "../images/main.avif";
                        htmlContent +=
                            '<article class="course-card"><div class="course-img-wrap"><img src="' +
                                academySession.escapeHtml(image) + '" alt="' +
                                academySession.escapeHtml(course.CourseName) + '">' +
                                '<span class="course-tag">' + academySession.escapeHtml(categoryName) +
                                "</span></div><div class='card-details'><h3>" +
                                academySession.escapeHtml(course.CourseName) + "</h3><p class='description'>" +
                                academySession.escapeHtml(course.CourseDescription || "") +
                                "</p><p class='instructor'>Instructor: " +
                                academySession.escapeHtml(instructorName) +
                                "</p><div class='price-row'><span class='price'>₹ " +
                                Number(course.CoursePrice).toLocaleString("en-IN", { minimumFractionDigits: 2 }) +
                                '</span><button type="button" class="btn-enroll add-course-button" data-course-id="' +
                                course.CourseID + '">Add to Cart</button></div></div></article>';
                    });
                    $("#courseList").html(htmlContent);
                    $(".add-course-button").off("click").on("click", function () {
                        let courseID = Number($(this).attr("data-course-id"));
                        homePage.addCourseToCart(courseID);
                    });
                }
                catch (error) {
                    academySession.reportError("Displaying home courses", error);
                    $("#courseList").html("<p class='page-message error-message'>Courses could not be displayed.</p>");
                }
            }
            addCourseToCart(courseID) {
                try {
                    let user = academySession.getLoggedInUser();
                    if (user === null) {
                        sessionStorage.setItem("pendingCourseID", String(courseID));
                        window.location.href = "login.html?returnUrl=index.html";
                        return;
                    }
                    if (user.TypeID !== 3) {
                        alert("Only student accounts can add courses to a cart.");
                        return;
                    }
                    $.ajax({
                        type: "POST",
                        url: "http://localhost:55157/api/Cart",
                        data: {
                            UserID: user.UserID,
                            CourseID: courseID,
                            Price: 0
                        },
                        success: function (response) {
                            if (!response) {
                                alert("This course is already in your cart or you are enrolled.");
                                return;
                            }
                            navigationPage.updateCartCounter();
                            alert("Course added to cart.");
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to add course to cart:", status, error, xhr.status);
                            alert("The course could not be added to your cart.");
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Adding home course to cart", error);
                    alert("The course could not be added to your cart.");
                }
            }
        }
        Academy.HomePage = HomePage;
    })(Academy = Project.Academy || (Project.Academy = {}));
})(Project || (Project = {}));
let homePage = new Project.Academy.HomePage();
$(() => {
    homePage.init();
});
