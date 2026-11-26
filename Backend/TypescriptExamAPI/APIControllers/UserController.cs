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
    public class UserController : ApiController
    {
        // Get user by ID (used for displaying profile / welcome name)
        public UserDetail GetUserByID(int id)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            UserDetail user = db.UserDetails.Where(x => x.UserID == id).FirstOrDefault();

            return user;
        }

        // Get all users (used in Admin dashboard to view users)
        public List<UserDetail> GetUsers()
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            List<UserDetail> userList = db.UserDetails.OrderBy(x => x.UserID).ToList();
            return userList;
        }

        // Delete user (Admin dashboard delete user)
        public bool DeleteUser(int id)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            UserDetail user = db.UserDetails.Where(x => x.UserID == id).FirstOrDefault();

            if (user == null)
            {
                return false;
            }

            bool hasCourses = db.Courses.Any(x => x.InstructorID == id);
            if (hasCourses)
            {
                return false;
            }

            db.UserDetails.Remove(user);
            db.SaveChanges();

            return true;
        }
    }
}
