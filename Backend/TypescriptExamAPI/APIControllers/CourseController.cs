using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using TypescriptExamAPI.Models;

namespace TypescriptExamAPI.APIControllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*", exposedHeaders: "SampleHeader")]
    public class CourseController : ApiController
    {
        // Get all courses (used for catalog display)
        public IHttpActionResult GetCourses()
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            var courseList = db.Courses
                .OrderBy(x => x.CourseID)
                .Select(x => new
                {
                    x.CourseID,
                    x.CategoryID,
                    x.InstructorID,
                    x.CourseName,
                    x.CoursePrice,
                    x.CourseDescription,
                    x.CourseImage
                })
                .ToList();

            return Ok(courseList);
        }

        // Get single course by ID (used for editing or details view)
        public Cours GetCourseByID(int id)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            Cours course = db.Courses.Where(x => x.CourseID == id).FirstOrDefault();
            return course;
        }

        // Create new course (Instructors creating a course)
        public void PostCourse(Cours c)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            db.Courses.Add(c);
            db.SaveChanges();
        }

        // Update existing course (Instructors editing course details)
        public void PutCourse(Cours c)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            Cours existing = db.Courses.Where(x => x.CourseID == c.CourseID).FirstOrDefault();

            if (existing != null)
            {
                existing.CourseName = c.CourseName;
                existing.CategoryID = c.CategoryID;
                existing.InstructorID = c.InstructorID;
                existing.CoursePrice = c.CoursePrice;
                existing.CourseDescription = c.CourseDescription;
                existing.CourseImage = c.CourseImage;

                db.SaveChanges();
            }
        }

        // Delete course (Instructors deleting a course)
        public bool DeleteCourse(int id)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            Cours course = db.Courses.Where(x => x.CourseID == id).FirstOrDefault();

            if (course == null)
            {
                return false;
            }

            // Check if course is already enrolled by students
            bool hasEnrollments = db.Enrollments.Where(x => x.CourseID == id).Any();

            if (hasEnrollments)
            {
                return false;
            }

            db.Courses.Remove(course);
            db.SaveChanges();

            return true;
        }
    }
}
