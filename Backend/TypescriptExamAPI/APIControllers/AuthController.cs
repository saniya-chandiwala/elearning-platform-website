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
    public class AuthController : ApiController
    {
        // Login endpoint: returns UserDetail if credentials match, else null
        [Route("api/Auth/Login")]
        public UserDetail PostForLogin(UserDetail user)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            UserDetail userFound = db.UserDetails
                .Where(x => x.UserEmail == user.UserEmail && x.UserPassword == user.UserPassword)
                .FirstOrDefault();

            return userFound;
        }

        // Registration endpoint: allows registering as Student (3) or Instructor (2)
        [Route("api/Auth/Register")]
        public bool PostForSignUp(UserDetail user)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            if (user.TypeID != 2 && user.TypeID != 3)
            {
                return false;
            }

            UserDetail existingUser = db.UserDetails
                .Where(x => x.UserEmail == user.UserEmail)
                .FirstOrDefault();

            if (existingUser != null)
            {
                return false;
            }

            db.UserDetails.Add(user);
            db.SaveChanges();

            return true;
        }
    }
}
