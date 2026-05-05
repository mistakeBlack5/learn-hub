-- =============================================
-- LearnHub Database Schema
-- Compatible with SQL Server (SSMS)
-- =============================================

USE master;
GO

-- Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'LearnHub')
BEGIN
    CREATE DATABASE LearnHub;
    PRINT 'Database LearnHub created successfully';
END
GO

USE LearnHub;
GO

-- Enable ANSI_NULLS and QUOTED_IDENTIFIER
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Table: Users
-- =============================================
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE Users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
        avatar_url NVARCHAR(500),
        is_active BIT DEFAULT 1,
        email_verified BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        last_login DATETIME2
    );
    PRINT 'Table Users created successfully';
    
    -- Index on email for faster lookups
    CREATE INDEX IX_Users_Email ON Users(email);
    CREATE INDEX IX_Users_Role ON Users(role);
END
GO

-- =============================================
-- Table: Categories
-- =============================================
IF OBJECT_ID('dbo.Categories', 'U') IS NULL
BEGIN
    CREATE TABLE Categories (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) UNIQUE NOT NULL,
        description NVARCHAR(500),
        icon NVARCHAR(50),
        course_count INT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table Categories created successfully';
    
    CREATE INDEX IX_Categories_Name ON Categories(name);
END
GO

-- =============================================
-- Table: Courses
-- =============================================
IF OBJECT_ID('dbo.Courses', 'U') IS NULL
BEGIN
    CREATE TABLE Courses (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX),
        thumbnail_url NVARCHAR(500),
        category_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Categories(id) ON DELETE SET NULL,
        instructor_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(id) ON DELETE SET NULL,
        instructor_name NVARCHAR(100),
        price DECIMAL(10,2) DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        student_count INT DEFAULT 0,
        duration_hours INT DEFAULT 0,
        lessons_count INT DEFAULT 0,
        status NVARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        level NVARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table Courses created successfully';
    
    CREATE INDEX IX_Courses_Category ON Courses(category_id);
    CREATE INDEX IX_Courses_Instructor ON Courses(instructor_id);
    CREATE INDEX IX_Courses_Status ON Courses(status);
    CREATE INDEX IX_Courses_Title ON Courses(title);
END
GO

-- =============================================
-- Table: Lessons
-- =============================================
IF OBJECT_ID('dbo.Lessons', 'U') IS NULL
BEGIN
    CREATE TABLE Lessons (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        course_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
        title NVARCHAR(200) NOT NULL,
        type NVARCHAR(20) CHECK (type IN ('video', 'text', 'quiz', 'assignment')),
        content_url NVARCHAR(500),
        text_content NVARCHAR(MAX),
        duration_minutes INT DEFAULT 0,
        order_index INT NOT NULL,
        is_free BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table Lessons created successfully';
    
    CREATE INDEX IX_Lessons_Course ON Lessons(course_id);
    CREATE INDEX IX_Lessons_Order ON Lessons(course_id, order_index);
END
GO

-- =============================================
-- Table: Enrollments
-- =============================================
IF OBJECT_ID('dbo.Enrollments', 'U') IS NULL
BEGIN
    CREATE TABLE Enrollments (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        course_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
        status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'canceled', 'expired')),
        enrolled_at DATETIME2 DEFAULT GETDATE(),
        completed_at DATETIME2,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        UNIQUE(user_id, course_id)
    );
    PRINT 'Table Enrollments created successfully';
    
    CREATE INDEX IX_Enrollments_User ON Enrollments(user_id);
    CREATE INDEX IX_Enrollments_Course ON Enrollments(course_id);
    CREATE INDEX IX_Enrollments_Status ON Enrollments(status);
END
GO

-- =============================================
-- Table: Progress
-- =============================================
IF OBJECT_ID('dbo.Progress', 'U') IS NULL
BEGIN
    CREATE TABLE Progress (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        enrollment_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Enrollments(id) ON DELETE CASCADE,
        lesson_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Lessons(id) ON DELETE CASCADE,
        is_completed BIT DEFAULT 0,
        completed_at DATETIME2,
        last_accessed DATETIME2 DEFAULT GETDATE(),
        time_spent_minutes INT DEFAULT 0,
        UNIQUE(enrollment_id, lesson_id)
    );
    PRINT 'Table Progress created successfully';
    
    CREATE INDEX IX_Progress_Enrollment ON Progress(enrollment_id);
    CREATE INDEX IX_Progress_Lesson ON Progress(lesson_id);
END
GO

-- =============================================
-- Table: Quizzes
-- =============================================
IF OBJECT_ID('dbo.Quizzes', 'U') IS NULL
BEGIN
    CREATE TABLE Quizzes (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        lesson_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Lessons(id) ON DELETE CASCADE,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(500),
        passing_score INT DEFAULT 70,
        time_limit_minutes INT,
        created_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table Quizzes created successfully';
    
    CREATE INDEX IX_Quizzes_Lesson ON Quizzes(lesson_id);
END
GO

-- =============================================
-- Table: QuizQuestions
-- =============================================
IF OBJECT_ID('dbo.QuizQuestions', 'U') IS NULL
BEGIN
    CREATE TABLE QuizQuestions (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        quiz_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Quizzes(id) ON DELETE CASCADE,
        question_text NVARCHAR(MAX) NOT NULL,
        question_type NVARCHAR(20) DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
        points INT DEFAULT 1,
        order_index INT NOT NULL
    );
    PRINT 'Table QuizQuestions created successfully';
    
    CREATE INDEX IX_QuizQuestions_Quiz ON QuizQuestions(quiz_id);
END
GO

-- =============================================
-- Table: QuizOptions
-- =============================================
IF OBJECT_ID('dbo.QuizOptions', 'U') IS NULL
BEGIN
    CREATE TABLE QuizOptions (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        question_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES QuizQuestions(id) ON DELETE CASCADE,
        option_text NVARCHAR(500) NOT NULL,
        is_correct BIT DEFAULT 0,
        order_index INT NOT NULL
    );
    PRINT 'Table QuizOptions created successfully';
    
    CREATE INDEX IX_QuizOptions_Question ON QuizOptions(question_id);
END
GO

-- =============================================
-- Table: QuizAttempts
-- =============================================
IF OBJECT_ID('dbo.QuizAttempts', 'U') IS NULL
BEGIN
    CREATE TABLE QuizAttempts (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        quiz_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Quizzes(id) ON DELETE CASCADE,
        user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        score DECIMAL(5,2),
        total_questions INT,
        correct_answers INT,
        started_at DATETIME2 DEFAULT GETDATE(),
        completed_at DATETIME2,
        status NVARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
    );
    PRINT 'Table QuizAttempts created successfully';
    
    CREATE INDEX IX_QuizAttempts_Quiz ON QuizAttempts(quiz_id);
    CREATE INDEX IX_QuizAttempts_User ON QuizAttempts(user_id);
END
GO

-- =============================================
-- Table: UserStats
-- =============================================
IF OBJECT_ID('dbo.UserStats', 'U') IS NULL
BEGIN
    CREATE TABLE UserStats (
        user_id UNIQUEIDENTIFIER PRIMARY KEY FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        hours_learned DECIMAL(5,1) DEFAULT 0,
        courses_completed INT DEFAULT 0,
        courses_enrolled INT DEFAULT 0,
        certificates_earned INT DEFAULT 0,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_activity_date DATE,
        xp_points INT DEFAULT 0,
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table UserStats created successfully';
END
GO

-- =============================================
-- Table: RefreshTokens
-- =============================================
IF OBJECT_ID('dbo.RefreshTokens', 'U') IS NULL
BEGIN
    CREATE TABLE RefreshTokens (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        token NVARCHAR(500) NOT NULL,
        expires_at DATETIME2 NOT NULL,
        is_revoked BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        revoked_at DATETIME2
    );
    PRINT 'Table RefreshTokens created successfully';
    
    CREATE INDEX IX_RefreshTokens_User ON RefreshTokens(user_id);
    CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(token);
END
GO

-- =============================================
-- Insert Sample Data
-- =============================================

-- Insert Admin User
IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'admin@learnhub.com')
BEGIN
    INSERT INTO Users (id, name, email, password_hash, role, is_active, email_verified)
    VALUES 
    (NEWID(), 'Admin User', 'admin@learnhub.com', '$2a$10$rQZ9vXJXL5K5Z5Z5Z5Z5Z.5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'admin', 1, 1);
    PRINT 'Sample admin user created';
END

-- Insert Categories
IF (SELECT COUNT(*) FROM Categories) = 0
BEGIN
    INSERT INTO Categories (id, name, description, icon) VALUES
    (NEWID(), 'Development', 'Programming and software development courses', 'Code'),
    (NEWID(), 'Design', 'UI/UX and graphic design courses', 'Palette'),
    (NEWID(), 'Business', 'Business management and entrepreneurship', 'Briefcase'),
    (NEWID(), 'Marketing', 'Digital marketing and SEO courses', 'Megaphone'),
    (NEWID(), 'Data Science', 'Data analysis and machine learning', 'Database');
    PRINT 'Sample categories created';
END

PRINT 'Database schema created successfully!';
GO



USE LearnHub;
GO

DECLARE @AdminEmail NVARCHAR(255) = 'admin@learn.com';
DECLARE @AdminPasswordHash NVARCHAR(255) = '$2a$10$qdBk95RXCV7lHG1pQuiyleH7GRPt63jj6wQ0vnQPtJnDzgwL6Fwu2'; -- ⚠️ Replace this line!

-- 1. Check if admin already exists
IF EXISTS (SELECT 1 FROM Users WHERE email = @AdminEmail)
BEGIN
    PRINT '⚠️ Admin account already exists. Skipping creation.';
    RETURN;
END

-- 2. Insert Admin User
DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();

INSERT INTO Users (id, name, email, password_hash, role, is_active, email_verified, created_at)
VALUES (
    @AdminId,
    'Platform Admin',
    @AdminEmail,
    @AdminPasswordHash,
    'admin',
    1, -- is_active
    1, -- email_verified
    GETDATE()
);

-- 3. Create required UserStats record
INSERT INTO UserStats (user_id, hours_learned, courses_completed, xp_points, current_streak)
VALUES (@AdminId, 0, 0, 0, 0);

-- 4. Verify creation
SELECT id, name, email, role, is_active, created_at 
FROM Users 
WHERE email = @AdminEmail;

PRINT '✅ Admin account created successfully!';
GO