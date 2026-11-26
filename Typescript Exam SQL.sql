USE TypescriptExamDB;

-- 1. USER ROLE TABLE (Admin, Instructor, Student)
CREATE TABLE UserType
(
    TypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName VARCHAR(50) NOT NULL UNIQUE
);

-- 2. USER DETAILS TABLE
CREATE TABLE UserDetails
(
    UserID INT PRIMARY KEY IDENTITY(1,1),
    TypeID INT NOT NULL,
    UserName VARCHAR(100) NOT NULL,
    UserEmail VARCHAR(100) NOT NULL UNIQUE,
    UserPassword VARCHAR(100) NOT NULL,

    FOREIGN KEY (TypeID) REFERENCES UserType(TypeID)
);

-- 3. COURSE CATEGORY TABLE
CREATE TABLE Categories
(
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO Categories (CategoryName)
VALUES
    ('Web Development'),
    ('Data Science & AI'),
    ('Cyber Security'),
    ('Cloud & Infrastructure');

-- 4. COURSE TABLE
CREATE TABLE Courses
(
    CourseID INT PRIMARY KEY IDENTITY(1,1),
    CategoryID INT NOT NULL,
    InstructorID INT NOT NULL,
    CourseName VARCHAR(150) NOT NULL,
    CoursePrice DECIMAL(10,2) NOT NULL CHECK (CoursePrice >= 0),
    CourseDescription VARCHAR(500),
    CourseImage VARCHAR(255),

    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (InstructorID) REFERENCES UserDetails(UserID)
);

-- 5. CART TABLE (Students adding courses before buying)
CREATE TABLE Cart
(
    CartID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0),

    UNIQUE (UserID, CourseID),
    FOREIGN KEY (UserID) REFERENCES UserDetails(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE
);

-- 6. PAYMENT MODE LOOKUP TABLE
CREATE TABLE PaymentMode
(
    PaymentModeID INT PRIMARY KEY IDENTITY(1,1),
    ModeName VARCHAR(50) NOT NULL UNIQUE
);

-- 7. INVOICE / BILL TABLE
CREATE TABLE Invoice
(
    InvoiceID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    PaymentModeID INT NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL CHECK (TotalAmount >= 0),
    InvoiceDate DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES UserDetails(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PaymentModeID) REFERENCES PaymentMode(PaymentModeID)
);

-- 8. INVOICE DETAILS TABLE
CREATE TABLE InvoiceDetails
(
    InvoiceDetailsID INT PRIMARY KEY IDENTITY(1,1),
    InvoiceID INT NOT NULL,
    CourseID INT NOT NULL,
    CoursePrice DECIMAL(10,2) NOT NULL CHECK (CoursePrice >= 0),

	UNIQUE (InvoiceID, CourseID),
    FOREIGN KEY (InvoiceID) REFERENCES Invoice(InvoiceID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

-- 9. ENROLLMENTS TABLE
CREATE TABLE Enrollments
(
    EnrollmentID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    CourseID INT NOT NULL,
    EnrollmentDate DATETIME NOT NULL DEFAULT GETDATE(),

    UNIQUE (UserID, CourseID),
    FOREIGN KEY (UserID) REFERENCES UserDetails(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);


SELECT * FROM UserType;
SELECT * FROM PaymentMode;

SELECT * FROM Enrollments;

SELECT * FROM UserDetails;
SELECT * FROM Courses;

INSERT INTO UserType (TypeName) 
VALUES ('Admin'), ('Instructor'), ('Student');

INSERT INTO PaymentMode (ModeName)
VALUES ('Debit Card'), ('Credit Card');

