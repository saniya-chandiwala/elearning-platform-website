"use strict";
var Project;
(function (Project) {
    let Academy;
    (function (Academy) {
        class ProfilePage {
            init() {
                try {
                    let user = academySession.getLoggedInUser();
                    if (user === null) {
                        window.location.href = "login.html?returnUrl=profile.html";
                        return;
                    }
                    $("#profileName").text(user.UserName);
                    if (new URLSearchParams(window.location.search).get("purchase") === "complete") {
                        academySession.showMessage("purchaseMessage", "Payment successful. Your courses are available below.", false);
                    }
                    if (user.TypeID === 3) {
                        this.loadEnrolledCourses(user.UserID);
                    }
                    else if (user.TypeID === 2) {
                        $("#learningHeading").text("Courses you teach");
                        this.loadProfileInstructorCourses(user.UserID);
                    }
                    else {
                        $("#learningHeading").text("Administrator account");
                        $("#enrolledCourses").html("<p class='empty-state'>Manage courses and users from the Admin Panel.</p>");
                    }
                }
                catch (error) {
                    academySession.reportError("Profile page initialization", error);
                    academySession.showMessage("profileError", "Your learning profile could not be opened.", true);
                }
            }
            loadEnrolledCourses(userID) {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Enrollment/" + userID,
                        success: (courses) => {
                            this.renderLearningCourses(courses);
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load enrolled courses:", status, error, xhr.status);
                            academySession.showMessage("profileError", "Your courses could not be loaded.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading enrolled courses", error);
                    academySession.showMessage("profileError", "Your courses could not be loaded.", true);
                }
            }
            loadProfileInstructorCourses(userID) {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Course",
                        success: (courses) => {
                            let ownedCourses = courses.filter(function (course) {
                                return course.InstructorID === userID;
                            });
                            this.renderLearningCourses(ownedCourses);
                        },
                        error: function (xhr, status, error) {
                            console.error("Unable to load instructor courses:", status, error, xhr.status);
                            academySession.showMessage("profileError", "Your courses could not be loaded.", true);
                        }
                    });
                }
                catch (error) {
                    academySession.reportError("Loading instructor profile courses", error);
                    academySession.showMessage("profileError", "Your courses could not be loaded.", true);
                }
            }
            renderLearningCourses(courses) {
                try {
                    let htmlContent = "";
                    if (courses.length === 0) {
                        $("#enrolledCourses").html("<p class='empty-state'>No courses to show yet.</p>");
                        return;
                    }
                    courses.forEach(function (course) {
                        let categoryName = course.Category === undefined
                            ? "Course"
                            : course.Category.CategoryName;
                        htmlContent +=
                            '<article class="course-card"><div class="card-details"><h3>' +
                                academySession.escapeHtml(course.CourseName) + "</h3><p>" +
                                academySession.escapeHtml(categoryName) +
                                '</p><p class="description">' +
                                academySession.escapeHtml(course.CourseDescription || "") +
                                "</p></div></article>";
                    });
                    $("#enrolledCourses").html(htmlContent);
                }
                catch (error) {
                    academySession.reportError("Rendering learning courses", error);
                    academySession.showMessage("profileError", "Your courses could not be displayed.", true);
                }
            }
        }
        Academy.ProfilePage = ProfilePage;
    })(Academy = Project.Academy || (Project.Academy = {}));
})(Project || (Project = {}));
let profilePage = new Project.Academy.ProfilePage();
$(() => {
    profilePage.init();
});
