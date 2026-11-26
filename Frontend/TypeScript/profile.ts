namespace Project {
    export namespace Academy {
        export class ProfilePage {
            init(): void {
                try {
                    let user: UserDetail | null = academySession.getLoggedInUser();
                    if (user === null) {
                        window.location.href = "login.html?returnUrl=profile.html";
                        return;
                    }

                    $("#profileName").text(user.UserName);
                    if (new URLSearchParams(window.location.search).get("purchase") === "complete") {
                        academySession.showMessage(
                            "purchaseMessage",
                            "Payment successful. Your courses are available below.",
                            false
                        );
                    }

                    if (user.TypeID === 3) {
                        this.loadEnrolledCourses(user.UserID);
                    } else if (user.TypeID === 2) {
                        $("#learningHeading").text("Courses you teach");
                        this.loadProfileInstructorCourses(user.UserID);
                    } else {
                        $("#learningHeading").text("Administrator account");
                        $("#enrolledCourses").html(
                            "<p class='empty-state'>Manage courses and users from the Admin Panel.</p>"
                        );
                    }
                } catch (error: unknown) {
                    academySession.reportError("Profile page initialization", error);
                    academySession.showMessage("profileError", "Your learning profile could not be opened.", true);
                }
            }

            loadEnrolledCourses(userID: number): void {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Enrollment/" + userID,
                        success: (courses: Course[]): void => {
                            this.renderLearningCourses(courses);
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to load enrolled courses:", status, error, xhr.status);
                            academySession.showMessage("profileError", "Your courses could not be loaded.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Loading enrolled courses", error);
                    academySession.showMessage("profileError", "Your courses could not be loaded.", true);
                }
            }

            loadProfileInstructorCourses(userID: number): void {
                try {
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:55157/api/Course",
                        success: (courses: Course[]): void => {
                            let ownedCourses: Course[] = courses.filter(function (course: Course): boolean {
                                return course.InstructorID === userID;
                            });
                            this.renderLearningCourses(ownedCourses);
                        },
                        error: function (xhr: JQuery.jqXHR, status: string, error: string): void {
                            console.error("Unable to load instructor courses:", status, error, xhr.status);
                            academySession.showMessage("profileError", "Your courses could not be loaded.", true);
                        }
                    });
                } catch (error: unknown) {
                    academySession.reportError("Loading instructor profile courses", error);
                    academySession.showMessage("profileError", "Your courses could not be loaded.", true);
                }
            }

            renderLearningCourses(courses: Course[]): void {
                try {
                    let htmlContent: string = "";
                    if (courses.length === 0) {
                        $("#enrolledCourses").html("<p class='empty-state'>No courses to show yet.</p>");
                        return;
                    }

                    courses.forEach(function (course: Course): void {
                        let categoryName: string = course.Category === undefined
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
                } catch (error: unknown) {
                    academySession.reportError("Rendering learning courses", error);
                    academySession.showMessage("profileError", "Your courses could not be displayed.", true);
                }
            }
        }
    }
}

let profilePage: Project.Academy.ProfilePage = new Project.Academy.ProfilePage();
$((): void => {
    profilePage.init();
});
