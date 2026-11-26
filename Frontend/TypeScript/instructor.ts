namespace Project {
    export namespace Academy {
        export class InstructorPage {
            private instructorID: number = 0;
            private instructorCourses: Course[] = [];

            init(): void {
                try {
                    let user: UserDetail | null = academySession.getLoggedInUser();
                    if (user === null || user.TypeID !== 2) {
                        window.location.href = "login.html?returnUrl=instructor.html";
                        return;
                    }

                    this.instructorID = user.UserID;
                    $("#courseInstructorID").val(this.instructorID);
                    this.loadCourseCategories();
                    this.loadInstructorCourses();

                    $("#selectCategory").on("change", function (): void {
                        let selectedCategoryID: string = String($("#selectCategory").val() || "");
                        let hasSelectedCategory: boolean = selectedCategoryID.length > 0;
                        instructorPage.clearCourseForm();
                        $("#selectCategory").val(selectedCategoryID);
                        $("#courseCategory").val(selectedCategoryID);
                        $("#courseSearch").val("").prop("disabled", false).attr("placeholder", "Select a course...");
                        if (!hasSelectedCategory) {
                            $("#courseSearch").prop("disabled", true).attr("placeholder", "Select a category first...");
                        }
                        instructorPage.filterInstructorCourses();
                    });

                    $("#courseSearch").on("focus input", function (): void {
                        instructorPage.filterInstructorCourses();
                    });

                    $(document).on("click", function (event: JQuery.ClickEvent): void {
                        let target: EventTarget | null = event.target;
                        if (target instanceof Element && $(target).closest(".course-search").length === 0) {
                            $("#courseDropdown").prop("hidden", true);
                        }
                    });

                    $("#courseDropdown").on("click", ".course-dropdown-item", function (): void {
                        let courseID: number = Number($(this).attr("data-course-id"));
                        let course: Course | undefined = instructorPage.instructorCourses.find(
                            function (item: Course): boolean {
                                return item.CourseID === courseID;
                            }
                        );

                        if (course !== undefined) {
                            $("#courseSearch").val(course.CourseName);
                            $("#courseDropdown").prop("hidden", true);
                            instructorPage.showCourseDetails(course);
                        }
                    });

                    $("#addNewCourse").on("click", function (): void {
                        let selectedCategoryID: string = String($("#selectCategory").val() || "");
                        instructorPage.clearCourseForm();
                        $("#selectCategory").val(selectedCategoryID);
                        instructorPage.enableCourseForm(false);
                        $("#courseCategory").val(selectedCategoryID);
                        $("#courseSearch")
                            .prop("disabled", selectedCategoryID.length === 0)
                            .attr(
                                "placeholder",
                                selectedCategoryID.length > 0 ? "Select a course..." : "Select a category first..."
                            );
                        $("#saveCourseButton").prop("disabled", false).text("Save course");
                        $("#deleteCourseButton").prop("disabled", true);
                    });

                    $("#courseForm").on("submit", function (event: JQuery.SubmitEvent): void {
                        event.preventDefault();
                        instructorPage.saveCourse();
                    });

                    $("#deleteCourseButton").on("click", function (): void {
                        let courseID: number = Number($("#courseID").val());
                        if (courseID > 0) {
                            instructorPage.deleteInstructorCourse(courseID);
                        }
                    });

                    $("#resetCourseForm").on("click", function (): void {
                        instructorPage.clearCourseForm();
                    });
                } catch (error: unknown) {
                    academySession.reportError("Instructor page initialization", error);
                    academySession.showMessage("instructorMessage", "The instructor page could not be initialized.", true);
                }
            }

            loadCourseCategories(): void {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Category",
                        success: function (categories: Category[]): void {
                            try {
                                categories.forEach(function (category: Category): void {
                                    $("#selectCategory").append(
                                        $("<option>").val(category.CategoryID).text(category.CategoryName)
                                    );
                                    $("#courseCategory").append(
                                        $("<option>").val(category.CategoryID).text(category.CategoryName)
                                    );
                                });
                            } catch (error: unknown) {
                                academySession.reportError("Rendering course categories", error);
                                academySession.showMessage("instructorMessage", "Course categories could not be displayed.", true);
                            }
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to load categories:", status, error, xhr.status);
                            academySession.showMessage("instructorMessage", "Course categories could not be loaded.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Loading course categories", error);
                    academySession.showMessage("instructorMessage", "Course categories could not be loaded.", true);
                }
            }

            loadInstructorCourses(): void {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Course",
                        success: (courses: Course[]): void => {
                            try {
                                this.instructorCourses = courses.filter((course: Course): boolean => {
                                    return course.InstructorID === this.instructorID;
                                });
                                if (String($("#selectCategory").val() || "").length > 0) {
                                    this.filterInstructorCourses();
                                }
                            } catch (error: unknown) {
                                academySession.reportError("Filtering instructor courses", error);
                                academySession.showMessage("instructorMessage", "Your courses could not be displayed.", true);
                            }
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to load instructor courses:", status, error, xhr.status);
                            academySession.showMessage("instructorMessage", "Your courses could not be loaded.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Loading instructor courses", error);
                    academySession.showMessage("instructorMessage", "Your courses could not be loaded.", true);
                }
            }

            filterInstructorCourses(): void {
                try {
                    let categoryID: string = String($("#selectCategory").val() || "");
                    let searchText: string = String($("#courseSearch").val() || "").trim().toLowerCase();
                    let filteredCourses: Course[] = this.instructorCourses.filter(function (course: Course): boolean {
                        return String(course.CategoryID) === categoryID &&
                            course.CourseName.toLowerCase().includes(searchText);
                    });

                    let dropdown: JQuery<HTMLElement> = $("#courseDropdown");
                    dropdown.empty();
                    if (filteredCourses.length === 0) {
                        dropdown.append(
                            $("<div>").addClass("course-dropdown-item no-results").text("No courses found")
                        );
                    } else {
                        filteredCourses.forEach(function (course: Course): void {
                            dropdown.append(
                                $("<button>")
                                    .attr("type", "button")
                                    .attr("data-course-id", course.CourseID)
                                    .addClass("course-dropdown-item")
                                    .text(course.CourseName)
                            );
                        });
                    }
                    dropdown.prop("hidden", false);
                } catch (error: unknown) {
                    academySession.reportError("Filtering instructor courses", error);
                    academySession.showMessage("instructorMessage", "Course search could not be completed.", true);
                }
            }

            showCourseDetails(course: Course): void {
                try {
                    $("#courseID").val(course.CourseID);
                    $("#courseName").val(course.CourseName);
                    $("#courseCategory").val(course.CategoryID);
                    $("#coursePrice").val(course.CoursePrice);
                    $("#courseImage").val(course.CourseImage || "");
                    $("#courseDescription").val(course.CourseDescription || "");
                    this.enableCourseForm(false);
                    $("#saveCourseButton").prop("disabled", false).text("Update course");
                    $("#deleteCourseButton").prop("disabled", false);
                } catch (error: unknown) {
                    academySession.reportError("Showing course details", error);
                    academySession.showMessage("instructorMessage", "Course details could not be displayed.", true);
                }
            }

            saveCourse(): void {
                try {
                    let courseID: number = Number($("#courseID").val());
                    let courseName: string = String($("#courseName").val() || "").trim();
                    let categoryID: number = Number($("#courseCategory").val());
                    let coursePriceValue: string = String($("#coursePrice").val() || "").trim();
                    let coursePrice: number = Number(coursePriceValue);
                    let courseImage: string = String($("#courseImage").val() || "").trim();
                    let courseDescription: string = String($("#courseDescription").val() || "").trim();

                    if (
                        courseName.length === 0 ||
                        !Number.isInteger(categoryID) ||
                        categoryID < 1 ||
                        coursePriceValue.length === 0 ||
                        !/^\d{1,8}(\.\d{1,2})?$/.test(coursePriceValue) ||
                        !Number.isFinite(coursePrice) ||
                        coursePrice < 0 ||
                        coursePrice > 99999999.99
                    ) {
                        academySession.showMessage(
                            "instructorMessage",
                            "Enter a course name, category, and price from ₹0.00 to ₹99,999,999.99 (up to 2 decimal places).",
                            true
                        );
                        return;
                    }

                    let course: Course = {
                        CourseID: courseID,
                        CategoryID: categoryID,
                        InstructorID: this.instructorID,
                        CourseName: courseName,
                        CoursePrice: coursePrice,
                        CourseDescription: courseDescription,
                        CourseImage: courseImage.length > 0 ? courseImage : null
                    };

                    $.ajax({
                        type: courseID > 0 ? "PUT" : "POST",
                        url: "http://localhost:55157/api/Course",
                        data: course,
                        success: (): void => {
                            academySession.showMessage(
                                "instructorMessage",
                                courseID > 0 ? "Course updated." : "Course created.",
                                false
                            );
                            this.clearCourseForm();
                            this.loadInstructorCourses();
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to save course:", status, error, xhr.status);
                            academySession.showMessage("instructorMessage", "The course could not be saved.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Saving instructor course", error);
                    academySession.showMessage("instructorMessage", "The course could not be saved.", true);
                }
            }

            deleteInstructorCourse(courseID: number): void {
                try {
                    if (!window.confirm("Delete this course? Courses with enrollments cannot be deleted.")) {
                        return;
                    }

                    $.ajax({
                        type: "DELETE",
                        url: "http://localhost:55157/api/Course/" + courseID,
                        success: (response: boolean): void => {
                            if (!response) {
                                academySession.showMessage(
                                    "instructorMessage",
                                    "This course has enrollments and cannot be deleted.",
                                    true
                                );
                                return;
                            }
                            academySession.showMessage("instructorMessage", "Course deleted.", false);
                            this.clearCourseForm();
                            this.loadInstructorCourses();
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to delete course:", status, error, xhr.status);
                            academySession.showMessage("instructorMessage", "The course could not be deleted.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Deleting instructor course", error);
                    academySession.showMessage("instructorMessage", "The course could not be deleted.", true);
                }
            }

            clearCourseForm(): void {
                try {
                    let form: HTMLFormElement | null = document.getElementById("courseForm") as HTMLFormElement | null;
                    if (form !== null) {
                        form.reset();
                    }

                    let selectCat: HTMLSelectElement | null =
                        document.getElementById("selectCategory") as HTMLSelectElement | null;
                    if (selectCat !== null) {
                        selectCat.selectedIndex = 0;
                    }
                    $("#selectCategory").val("");

                    let formCat: HTMLSelectElement | null =
                        document.getElementById("courseCategory") as HTMLSelectElement | null;
                    if (formCat !== null) {
                        formCat.selectedIndex = 0;
                    }
                    $("#courseCategory").val("");
                    $("#courseSearch")
                        .val("")
                        .prop("disabled", true)
                        .attr("placeholder", "Select a category first...");
                    $("#courseDropdown").empty().prop("hidden", true);
                    $("#courseID").val("");
                    $("#courseInstructorID").val(this.instructorID);
                    $("#courseName, #courseCategory, #coursePrice, #courseImage, #courseDescription")
                        .prop("disabled", true);
                    $("#saveCourseButton").prop("disabled", true).text("Create course");
                    $("#deleteCourseButton").prop("disabled", true);
                } catch (error: unknown) {
                    academySession.reportError("Clearing course form", error);
                    academySession.showMessage("instructorMessage", "The course form could not be cleared.", true);
                }
            }

            enableCourseForm(isDisabled: boolean): void {
                try {
                    $("#courseName, #courseCategory, #coursePrice, #courseImage, #courseDescription")
                        .prop("disabled", isDisabled);
                } catch (error: unknown) {
                    academySession.reportError("Setting course form state", error);
                    throw error;
                }
            }
        }
    }
}

let instructorPage: Project.Academy.InstructorPage = new Project.Academy.InstructorPage();
$((): void => {
    instructorPage.init();
});
