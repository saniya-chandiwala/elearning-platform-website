namespace Project {
    export namespace Academy {
        export interface UserDetail {
            UserID: number;
            TypeID: number;
            UserName: string;
            UserEmail: string;
            UserPassword?: string;
        }

        export interface Category {
            CategoryID: number;
            CategoryName: string;
        }

        export interface Course {
            CourseID: number;
            CategoryID: number;
            InstructorID: number;
            CourseName: string;
            CoursePrice: number;
            CourseDescription: string;
            CourseImage: string | null;
            Category?: Category;
            UserDetail?: UserDetail;
        }

        export interface CartItem {
            CartID: number;
            UserID: number;
            CourseID: number;
            Price: number;
            Cours?: Course;
        }

        export interface Invoice {
            InvoiceID: number;
            UserID: number;
            PaymentModeID: number;
            TotalAmount: number;
            InvoiceDate: string;
            InvoiceDetails?: InvoiceDetail[];
        }

        export interface InvoiceDetail {
            InvoiceDetailsID: number;
            InvoiceID: number;
            CourseID: number;
            CoursePrice: number;
            Cours?: Course;
        }

        export class ModelTypes {
            private constructor() {}
        }
    }
}
