"use strict";
var Project;
(function (Project) {
    let Academy;
    (function (Academy) {
        class InstructorPage {
            constructor() {
                this.instructorID = 0;
                this.instructorCourses = [];
            }
            init() {
                try {
                    let user = academySession.getLoggedInUser();
                    if (user === null || user.TypeID !== 2) {
                        window.location.href = "login.html?returnUrl=instructor.html";
                        return;
                    }
                    this.instructorID = user.UserID;
                    $("#courseInstructorID").val(this.instructorID);
                    this.loadCourseCategories();
                    this.loadInstructorCourses();
                    $("#selectCategory").on("change", function () {
                        let selectedCategoryID = String($("#selectCategory").val() || "");
                        let hasSelectedCategory = selectedCategoryID.length > 0;
                        instructorPage.clearCourseForm();
                        $("#selectCategory").val(selectedCategoryID);
                        $("#courseCategory").val(selectedCategoryID);
                        $("#courseSearch").val("").prop("disabled", false).attr("placeholder", "Select a course...");
                        if (!hasSelectedCategory) {
                            $("#courseSearch").prop("disabled", true).attr("placeholder", "Select a category first...");
                        }
                        instructorPage.filterInstructorCourses();
                    });
                    $("#courseSearch").on("focus input", function () {
                        instructorPage.filterInstructorCourses();
                    });
                    $(document).on("click", function (event) {
                        let target = event.target;
                        if (target instanceof Element && $(target).closest(".course-search").length === 0) {
                            $("#courseDropdown").prop("hidden", true);
                        }
                    });
                    $("#courseDropdown").on("click", ".course-dropdown-item", function () {
                        let courseID = Number($(this).attr("data-course-id"));
                        let course = instructorPage.instructorCourses.find(function (item) {
                            return item.CourseID === courseID;
                        });
                        if (course !== undefined) {
                            $("#courseSearch").val(course.CourseName);
                            $("#courseDropdown").prop("hidden", true);
                            instructorPage.showCourseDetails(course);
                        }
                    });
                    $("#addNewCourse").on("click", function () {
                        let selectedCategoryID = String($("#selectCategory").val() || "");
                        instructorPage.clearCourseForm();
                        $("#selectCategory").val(selectedCategoryID);
                        instructorPage.enableCourseForm(false);
                        $("#courseCategory").val(selectedCategoryID);
                        $("#courseSearch")
                            .prop("disabled", selectedCategoryID.length === 0)
                            .attr("placeholder", selectedCategoryID.length > 0 ? "Select a course..." : "Select a category first...");
                        $("#saveCourseButton").prop("disabled", false).text("Save course");
                        $("#deleteCourseButton").prop("disabled", true);
                    });
                    $("#courseForm").on("submit", function (event) {
                        event.preventDefault();
                        instructorPage.saveCourse();
                    });
                    $("#deleteCourseButton").on("click", function () {
                        let courseID = Number($("#courseID").val());
                        if (courseID > 0) {
                            instructorPage.deleteInstructorCourse(courseID);
                        }
                    });
                    $("#resetCourseForm").on("click", function () {
                        instructorPage.clearCourseForm();
                    });
                }
                catch (error) {
                    academySession.reportError("Instructor page initialization", error);
                    academySession.showMessage("instructorMessage", "The instructor page could not be initialized.", true);
                }
            }
            loadCourseCategories() {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Category",
                        success: function (categories) {
                            try {
                                categories.forEach(function (category) {
                                    $("#selectCategory").append($("<option>").val(category.CategoryID).text(category.CategoryName));
                                    $("#courseCategory").append($("<option>").val(category.CategoryID).text(category.CategoryName));
                                });
                            }
                            catch (error) {
                                academySession.reportError("Rendering course categories", error);
                                academySession.showMessage("instructorMessage", "Course categories could not be displayed.", true);
                            }
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load categories:", status, error, xhr.status);
                            academySession.showMessage("instructorMessage", "Course categories could not be loaded.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading course categories", error);
                    academySession.showMessage("instructorMessage", "Course categories could not be loaded.", true);
                }
            }
            loadInstructorCourses() {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Course",
                        success: (courses) => {
                            try {
                                this.instructorCourses = courses.filter((course) => {
                                    return course.InstructorID === this.instructorID;
                                });
                                if (String($("#selectCategory").val() || "").length > 0) {
                                    this.filterInstructorCourses();
                                }
                            }
                            catch (error) {
                                academySession.reportError("Filtering instructor courses", error);
                                academySession.showMessage("instructorMessage", "Your courses could not be displayed.", true);
                            }
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load instructor courses:", status, error, xhr.status);
                            academySession.showMessage("instructorMessage", "Your courses could not be loaded.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading instructor courses", error);
                    academySession.showMessage("instructorMessage", "Your courses could not be loaded.", true);
                }
            }
            filterInstructorCourses() {
                try {
                    let categoryID = String($("#selectCategory").val() || "");
                    let searchText = String($("#courseSearch").val() || "").trim().toLowerCase();
                    let filteredCourses = this.instructorCourses.filter(function (course) {
                        return String(course.CategoryID) === categoryID &&
                            course.CourseName.toLowerCase().includes(searchText);
                    });
                    let dropdown = $("#courseDropdown");
                    dropdown.empty();
                    if (filteredCourses.length === 0) {
                        dropdown.append($("<div>").addClass("course-dropdown-item no-results").text("No courses found"));
                    }
                    else {
                        filteredCourses.forEach(function (course) {
                            dropdown.append($("<button>")
                                .attr("type", "button")
                                .attr("data-course-id", course.CourseID)
                                .addClass("course-dropdown-item")
                                .text(course.CourseName));
                        });
                    }
                    dropdown.prop("hidden", false);
                }
                catch (error) {
                    academySession.reportError("Filtering instructor courses", error);
                    academySession.showMessage("instructorMessage", "Course search could not be completed.", true);
                }
            }
            showCourseDetails(course) {
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
                }
                catch (error) {
                    academySession.reportError("Showing course details", error);
                    academySession.showMessage("instructorMessage", "Course details could not be displayed.", true);
                }
            }
            saveCourse() {
                try {
                    let courseID = Number($("#courseID").val());
                    let courseName = String($("#courseName").val() || "").trim();
                    let categoryID = Number($("#courseCategory").val());
                    let coursePriceValue = String($("#coursePrice").val() || "").trim();
                    let coursePrice = Number(coursePriceValue);
                    let courseImage = String($("#courseImage").val() || "").trim();
                    let courseDescription = String($("#courseDescription").val() || "").trim();
                    if (courseName.length === 0 ||
                        !Number.isInteger(categoryID) ||
                        categoryID < 1 ||
                        coursePriceValue.length === 0 ||
                        !/^\d{1,8}(\.\d{1,2})?$/.test(coursePriceValue) ||
                        !Number.isFinite(coursePrice) ||
                        coursePrice < 0 ||
                        coursePrice > 99999999.99) {
                        academySession.showMessage("instructorMessage", "Enter a course name, category, and price from ₹0.00 to ₹99,999,999.99 (up to 2 decimal places).", true);
                        return;
                    }
                    let course = {
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
                        success: () => {
                            academySession.showMessage("instructorMessage", courseID > 0 ? "Course updated." : "Course created.", false);
                            this.clearCourseForm();
                            this.loadInstructorCourses();
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to save course:", status, error, xhr.status);
                            academySession.showMessage("instructorMessage", "The course could not be saved.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Saving instructor course", error);
                    academySession.showMessage("instructorMessage", "The course could not be saved.", true);
                }
            }
            deleteInstructorCourse(courseID) {
                try {
                    if (!window.confirm("Delete this course? Courses with enrollments cannot be deleted.")) {
                        return;
                    }
                    $.ajax({
                        type: "DELETE",
                        url: "http://localhost:55157/api/Course/" + courseID,
                        success: (response) => {
                            if (!response) {
                                academySession.showMessage("instructorMessage", "This course has enrollments and cannot be deleted.", true);
                                return;
                            }
                            academySession.showMessage("instructorMessage", "Course deleted.", false);
                            this.clearCourseForm();
                            this.loadInstructorCourses();
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to delete course:", status, error, xhr.status);
                            academySession.showMessage("instructorMessage", "The course could not be deleted.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Deleting instructor course", error);
                    academySession.showMessage("instructorMessage", "The course could not be deleted.", true);
                }
            }
            clearCourseForm() {
                try {
                    let form = document.getElementById("courseForm");
                    if (form !== null) {
                        form.reset();
                    }
                    let selectCat = document.getElementById("selectCategory");
                    if (selectCat !== null) {
                        selectCat.selectedIndex = 0;
                    }
                    $("#selectCategory").val("");
                    let formCat = document.getElementById("courseCategory");
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
                }
                catch (error) {
                    academySession.reportError("Clearing course form", error);
                    academySession.showMessage("instructorMessage", "The course form could not be cleared.", true);
                }
            }
            enableCourseForm(isDisabled) {
                try {
                    $("#courseName, #courseCategory, #coursePrice, #courseImage, #courseDescription")
                        .prop("disabled", isDisabled);
                }
                catch (error) {
                    academySession.reportError("Setting course form state", error);
                    throw error;
                }
            }
        }
        Academy.InstructorPage = InstructorPage;
    })(Academy = Project.Academy || (Project.Academy = {}));
})(Project || (Project = {}));
let instructorPage = new Project.Academy.InstructorPage();
$(() => {
    instructorPage.init();
});
