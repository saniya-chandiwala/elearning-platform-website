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
    public class InvoiceController : ApiController
    {
        // Invoice Generation 
        public bool PostInvoice(Invoice invData)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            // Get the items from the user's cart
            List<Cart> cartList = db.Carts.Where(x => x.UserID == invData.UserID).ToList();
            if (cartList.Count == 0)
            {
                return false;
            }

            // Create the invoice record using the PaymentModeID picked by the user
            Invoice inv = new Invoice();
            inv.UserID = invData.UserID;
            inv.PaymentModeID = invData.PaymentModeID; 
            inv.TotalAmount = 0;
            inv.InvoiceDate = DateTime.Now;

            db.Invoices.Add(inv);
            db.SaveChanges(); // Generates the new InvoiceID

            decimal total = 0;

            // Add to InvoiceDetails and Enrollments
            foreach (Cart item in cartList)
            {
                Cours c = db.Courses.Where(x => x.CourseID == item.CourseID).FirstOrDefault();
                if (c != null)
                {
                    // Add invoice detail line item
                    InvoiceDetail detail = new InvoiceDetail();
                    detail.InvoiceID = inv.InvoiceID;
                    detail.CourseID = c.CourseID;
                    detail.CoursePrice = c.CoursePrice;
                    db.InvoiceDetails.Add(detail);

                    // Grant active course access
                    Enrollment enroll = new Enrollment();
                    enroll.UserID = invData.UserID;
                    enroll.CourseID = c.CourseID;
                    enroll.EnrollmentDate = DateTime.Now;
                    db.Enrollments.Add(enroll);

                    total += c.CoursePrice;
                }
            }

            // Update the final amount and wipe the cart
            inv.TotalAmount = total;
            db.Carts.RemoveRange(cartList);
            db.SaveChanges();

            return true;
        }

        // Invoice details for billing receipts
        public List<Invoice> GetInvoiceByID(int id)
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();
            return db.Invoices.Where(x => x.UserID == id).OrderByDescending(x => x.InvoiceDate).ToList();
        }
    }
}
