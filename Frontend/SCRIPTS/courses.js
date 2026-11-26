"use strict";
var Project;
(function (Project) {
    let Academy;
    (function (Academy) {
        class CoursesPage {
            constructor() {
                this.courses = [];
                this.categories = [];
                this.coursesLoaded = false;
            }
            init() {
                try {
                    this.loadCategories();
                    this.loadCourses();
                    $("#courseCategoryFilter").on("change", function () {
                        try {
                            let categoryID = Number($("#courseCategoryFilter").val());
                            let selectedCategory = $("#courseCategoryFilter option:selected").text();
                            let title = categoryID === 0 ? "Explore courses" : selectedCategory;
                            $("#coursesTitle").text(title);
                            window.history.replaceState(null, "", "courses.html?categoryID=" + categoryID);
                            coursesPage.displayCourses();
                        }
                        catch (error) {
                            academySession.reportError("Course filter change", error);
                            academySession.showMessage("coursesMessage", "The course filter could not be applied.", true);
                        }
                    });
                    $("#courseList").on("click", ".add-course-button", function () {
                        try {
                            let courseID = Number($(this).attr("data-course-id"));
                            coursesPage.addCourseToCart(courseID);
                        }
                        catch (error) {
                            academySession.reportError("Add course click", error);
                            academySession.showMessage("coursesMessage", "The course could not be added.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Course catalog initialization", error);
                    academySession.showMessage("coursesMessage", "The course catalog could not be initialized.", true);
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
                                categories.slice(0, 4).forEach(function (category) {
                                    $("#courseCategoryFilter").append($("<option>").val(category.CategoryID).text(category.CategoryName));
                                });
                                let query = new URLSearchParams(window.location.search);
                                let categoryID = Number(query.get("categoryID") || "0");
                                let optionExists = false;
                                let categoryOptions = document.querySelectorAll("#courseCategoryFilter option");
                                for (let index = 0; index < categoryOptions.length; index += 1) {
                                    if (Number(categoryOptions[index].value) === categoryID) {
                                        optionExists = true;
                                    }
                                }
                                if (optionExists) {
                                    $("#courseCategoryFilter").val(categoryID);
                                }
                                $("#courseCategoryFilter").trigger("change");
                                this.displayCourses();
                            }
                            catch (error) {
                                academySession.reportError("Course category rendering", error);
                                academySession.showMessage("coursesMessage", "Course categories could not be displayed.", true);
                            }
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load course categories:", status, error, xhr.status);
                            academySession.showMessage("coursesMessage", "Course categories could not be loaded.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading course categories", error);
                    academySession.showMessage("coursesMessage", "Course categories could not be loaded.", true);
                }
            }
            loadCourses() {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Course",
                        success: (courses) => {
                            try {
                                this.courses = courses;
                                this.coursesLoaded = true;
                                this.displayCourses();
                            }
                            catch (error) {
                                academySession.reportError("Course catalog rendering", error);
                                academySession.showMessage("coursesMessage", "Courses could not be displayed.", true);
                            }
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load course catalog:", status, error, xhr.status, xhr.responseText);
                            let errorMessage = xhr.status > 0
                                ? "Course loading failed (HTTP " + xhr.status +
                                    "). Check the API error in the browser console."
                                : "Courses could not be loaded. Check that the API is running.";
                            academySession.showMessage("coursesMessage", errorMessage, true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading course catalog", error);
                    academySession.showMessage("coursesMessage", "Courses could not be loaded.", true);
                }
            }
            displayCourses() {
                try {
                    if (!this.coursesLoaded) {
                        return;
                    }
                    let categoryID = Number($("#courseCategoryFilter").val() || "0");
                    let visibleCourses = this.courses;
                    if (categoryID > 0) {
                        visibleCourses = this.courses.filter(function (course) {
                            return course.CategoryID === categoryID;
                        });
                    }
                    if (visibleCourses.length === 0) {
                        $("#courseList").html("<p class='empty-state'>No courses are available in this category yet.</p>");
                        return;
                    }
                    let htmlContent = "";
                    visibleCourses.forEach((course) => {
                        let courseCategory = this.categories.find(function (category) {
                            return category.CategoryID === course.CategoryID;
                        });
                        let categoryName = courseCategory === undefined
                            ? "Course"
                            : courseCategory.CategoryName;
                        let instructorName = course.UserDetail === undefined
                            ? "Academy Instructor"
                            : course.UserDetail.UserName;
                        let courseImage = course.CourseImage !== null && course.CourseImage.length > 0
                            ? course.CourseImage
                            : "../images/main.avif";
                        htmlContent +=
                            '<article class="course-card"><div class="course-img-wrap"><img src="' +
                                academySession.escapeHtml(courseImage) + '" alt="' +
                                academySession.escapeHtml(course.CourseName) + '">' +
                                '<span class="course-tag">' + academySession.escapeHtml(categoryName) +
                                '</span></div><div class="card-details"><h3>' +
                                academySession.escapeHtml(course.CourseName) + '</h3><p class="description">' +
                                academySession.escapeHtml(course.CourseDescription || "") +
                                '</p><p class="instructor">Instructor: ' +
                                academySession.escapeHtml(instructorName) +
                                '</p><div class="price-row"><span class="price">₹ ' +
                                Number(course.CoursePrice).toLocaleString("en-IN", { minimumFractionDigits: 2 }) +
                                '</span><button type="button" class="btn-enroll add-course-button" data-course-id="' +
                                course.CourseID + '">Add to Cart</button></div></div></article>';
                    });
                    $("#courseList").html(htmlContent);
                }
                catch (error) {
                    academySession.reportError("Displaying course catalog", error);
                    academySession.showMessage("coursesMessage", "Courses could not be displayed.", true);
                }
            }
            addCourseToCart(courseID) {
                try {
                    let user = academySession.getLoggedInUser();
                    if (user === null) {
                        sessionStorage.setItem("pendingCourseID", String(courseID));
                        window.location.href = "login.html?returnUrl=courses.html";
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
                                window.alert("This course is already in your cart or you are enrolled.");
                                return;
                            }
                            navigationPage.updateCartCounter();
                            window.alert("Course added to cart.");
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to add course to cart:", status, error, xhr.status);
                            window.alert("The course could not be added to your cart.");
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Adding course to cart", error);
                    window.alert("The course could not be added.");
                }
            }
        }
        Academy.CoursesPage = CoursesPage;
    })(Academy = Project.Academy || (Project.Academy = {}));
})(Project || (Project = {}));
let coursesPage = new Project.Academy.CoursesPage();
$(() => {
    coursesPage.init();
});
