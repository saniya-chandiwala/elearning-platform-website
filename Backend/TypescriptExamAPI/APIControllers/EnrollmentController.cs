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
    public class EnrollmentController : ApiController
    {
        // display list of enrolled courses for a user
        public List<Cours> GetEnrolledCourses(int id)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            // Get all CourseIDs the student is enrolled in
            List<int> enrolledCourseIDs = db.Enrollments
                .Where(x => x.UserID == id)
                .Select(x => x.CourseID)
                .ToList();

            // Fetch course details for these IDs
            List<Cours> courses = db.Courses
                .Where(x => enrolledCourseIDs.Contains(x.CourseID))
                .ToList();

            return courses;
        }
    }
}
