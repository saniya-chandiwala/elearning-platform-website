namespace Project {
    export namespace Academy {
        export class CoursesPage {
            private courses: Course[] = [];
            private categories: Category[] = [];
            private coursesLoaded: boolean = false;

            init(): void {
                try {
                    this.loadCategories();
                    this.loadCourses();

                    $("#courseCategoryFilter").on("change", function (): void {
                        try {
                            let categoryID: number = Number($("#courseCategoryFilter").val());
                            let selectedCategory: string = $("#courseCategoryFilter option:selected").text();
                            let title: string = categoryID === 0 ? "Explore courses" : selectedCategory;
                            $("#coursesTitle").text(title);
                            window.history.replaceState(null, "", "courses.html?categoryID=" + categoryID);
                            coursesPage.displayCourses();
                        } catch (error: unknown) {
                            academySession.reportError("Course filter change", error);
                            academySession.showMessage("coursesMessage", "The course filter could not be applied.", true);
                        }
                    });

                    $("#courseList").on("click", ".add-course-button", function (): void {
                        try {
                            let courseID: number = Number($(this).attr("data-course-id"));
                            coursesPage.addCourseToCart(courseID);
                        } catch (error: unknown) {
                            academySession.reportError("Add course click", error);
                            academySession.showMessage("coursesMessage", "The course could not be added.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Course catalog initialization", error);
                    academySession.showMessage("coursesMessage", "The course catalog could not be initialized.", true);
                }
            }

            loadCategories(): void {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Category",
                        success: (categories: Category[]): void => {
                            try {
                                this.categories = categories;
                                categories.slice(0, 4).forEach(function (category: Category): void {
                                    $("#courseCategoryFilter").append(
                                        $("<option>").val(category.CategoryID).text(category.CategoryName)
                                    );
                                });

                                let query: URLSearchParams = new URLSearchParams(window.location.search);
                                let categoryID: number = Number(query.get("categoryID") || "0");
                                let optionExists: boolean = false;
                                let categoryOptions: NodeListOf<HTMLOptionElement> =
                                    document.querySelectorAll("#courseCategoryFilter option");
                                for (let index: number = 0; index < categoryOptions.length; index += 1) {
                                    if (Number(categoryOptions[index].value) === categoryID) {
                                        optionExists = true;
                                    }
                                }
                                if (optionExists) {
                                    $("#courseCategoryFilter").val(categoryID);
                                }
                                $("#courseCategoryFilter").trigger("change");
                                this.displayCourses();
                            } catch (error: unknown) {
                                academySession.reportError("Course category rendering", error);
                                academySession.showMessage(
                                    "coursesMessage",
                                    "Course categories could not be displayed.",
                                    true
                                );
                            }
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to load course categories:", status, error, xhr.status);
                            academySession.showMessage("coursesMessage", "Course categories could not be loaded.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Loading course categories", error);
                    academySession.showMessage("coursesMessage", "Course categories could not be loaded.", true);
                }
            }

            loadCourses(): void {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Course",
                        success: (courses: Course[]): void => {
                            try {
                                this.courses = courses;
                                this.coursesLoaded = true;
                                this.displayCourses();
                            } catch (error: unknown) {
                                academySession.reportError("Course catalog rendering", error);
                                academySession.showMessage("coursesMessage", "Courses could not be displayed.", true);
                            }
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error(
                                "Unable to load course catalog:",
                                status,
                                error,
                                xhr.status,
                                xhr.responseText
                            );
                            let errorMessage: string = xhr.status > 0
                                ? "Course loading failed (HTTP " + xhr.status +
                                    "). Check the API error in the browser console."
                                : "Courses could not be loaded. Check that the API is running.";
                            academySession.showMessage("coursesMessage", errorMessage, true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Loading course catalog", error);
                    academySession.showMessage("coursesMessage", "Courses could not be loaded.", true);
                }
            }

            displayCourses(): void {
                try {
                    if (!this.coursesLoaded) {
                        return;
                    }

                    let categoryID: number = Number($("#courseCategoryFilter").val() || "0");
                    let visibleCourses: Course[] = this.courses;
                    if (categoryID > 0) {
                        visibleCourses = this.courses.filter(function (course: Course): boolean {
                            return course.CategoryID === categoryID;
                        });
                    }

                    if (visibleCourses.length === 0) {
                        $("#courseList").html("<p class='empty-state'>No courses are available in this category yet.</p>");
                        return;
                    }

                    let htmlContent: string = "";
                    visibleCourses.forEach((course: Course): void => {
                        let courseCategory: Category | undefined = this.categories.find(
                            function (category: Category): boolean {
                                return category.CategoryID === course.CategoryID;
                            }
                        );
                        let categoryName: string = courseCategory === undefined
                            ? "Course"
                            : courseCategory.CategoryName;
                        let instructorName: string = course.UserDetail === undefined
                            ? "Academy Instructor"
                            : course.UserDetail.UserName;
                        let courseImage: string = course.CourseImage !== null && course.CourseImage.length > 0
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
                } catch (error: unknown) {
                    academySession.reportError("Displaying course catalog", error);
                    academySession.showMessage("coursesMessage", "Courses could not be displayed.", true);
                }
            }

            addCourseToCart(courseID: number): void {
                try {
                    let user: UserDetail | null = academySession.getLoggedInUser();
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
                        success: function (response: boolean): void {
                            if (!response) {
                                window.alert("This course is already in your cart or you are enrolled.");
                                return;
                            }
                            navigationPage.updateCartCounter();
                            window.alert("Course added to cart.");
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to add course to cart:", status, error, xhr.status);
                            window.alert("The course could not be added to your cart.");
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Adding course to cart", error);
                    window.alert("The course could not be added.");
                }
            }
        }
    }
}

let coursesPage: Project.Academy.CoursesPage = new Project.Academy.CoursesPage();
$((): void => {
    coursesPage.init();
});
