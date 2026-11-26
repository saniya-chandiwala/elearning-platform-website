namespace Project {
    export namespace Academy {
        export class Session {
            init(): void {
                try {
                    $.ajaxSetup({
                        timeout: 300000
                    });
                } catch (error: unknown) {
                    this.reportError("Session initialization", error);
                }
            }

            getLoggedInUser(): UserDetail | null {
                try {
                    let savedUser: string | null = localStorage.getItem("loggedInUser");
                    if (savedUser === null) {
                        return null;
                    }
                    return JSON.parse(savedUser) as UserDetail;
                } catch (error: unknown) {
                    this.reportError("Reading the signed-in user", error);
                    throw error;
                }
            }

            saveLoggedInUser(user: UserDetail): void {
                try {
                    let safeUser: UserDetail = {
                        UserID: user.UserID,
                        TypeID: user.TypeID,
                        UserName: user.UserName,
                        UserEmail: user.UserEmail
                    };
                    localStorage.setItem("loggedInUser", JSON.stringify(safeUser));
                } catch (error: unknown) {
                    this.reportError("Saving the signed-in user", error);
                    throw error;
                }
            }

            getRoleName(typeID: number): string {
                try {
                    if (typeID === 1) {
                        return "Admin";
                    }
                    if (typeID === 2) {
                        return "Instructor";
                    }
                    return "Student";
                } catch (error: unknown) {
                    this.reportError("Getting the user role", error);
                    throw error;
                }
            }

            showMessage(elementID: string, message: string, isError: boolean): void {
                try {
                    let messageElement: JQuery<HTMLElement> = $("#" + elementID);
                    messageElement.text(message);
                    messageElement.toggleClass("error-message", isError);
                    messageElement.prop("hidden", false);
                } catch (error: unknown) {
                    this.reportError("Displaying a page message", error);
                    throw error;
                }
            }

            escapeHtml(value: string): string {
                try {
                    let textElement: HTMLDivElement = document.createElement("div");
                    textElement.textContent = value;
                    return textElement.innerHTML;
                } catch (error: unknown) {
                    this.reportError("Escaping text for display", error);
                    throw error;
                }
            }

            reportError(functionName: string, error: unknown): void {
                try {
                    console.error(functionName + " failed:", error);
                } catch (reportingError: unknown) {
                    console.error("Unable to report an error:", reportingError);
                }
            }
        }
    }
}

let academySession: Project.Academy.Session = new Project.Academy.Session();
$((): void => {
    academySession.init();
});
