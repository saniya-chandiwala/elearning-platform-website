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
    public class CartController : ApiController
    {
        // Get particular students cart items
        public List<Cart> GetCartByID(int id)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();
            List<Cart> cart = db.Carts.Where(x => x.UserID == id).ToList();

            return cart;
        }
          
        // Add course to cart
        public bool PostCart(Cart c)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            // check if student is already enrolled in this course
            bool alreadyEnrolled = db.Enrollments
                .Where(x => x.UserID == c.UserID && x.CourseID == c.CourseID)
                .Any();

            if (alreadyEnrolled)
            {
                return false;
            }

            // check if already present in the cart
            Cart existing = db.Carts
                .Where(x => x.UserID == c.UserID && x.CourseID == c.CourseID)
                .FirstOrDefault();

            if (existing != null)
            {
                return false;
            }

            // fetch course price from database
            Cours course = db.Courses.Where(x => x.CourseID == c.CourseID).FirstOrDefault();
            if (course == null)
            {
                return false;
            }

            c.Price = course.CoursePrice;
            db.Carts.Add(c);
            db.SaveChanges();

            return true;
        }

        // Remove course from cart
        public void DeleteCartByID(int id)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            Cart c = db.Carts.Where(x => x.CartID == id).FirstOrDefault();

            if (c != null)
            {
                db.Carts.Remove(c);
                db.SaveChanges();
            }
        }
    }
}

