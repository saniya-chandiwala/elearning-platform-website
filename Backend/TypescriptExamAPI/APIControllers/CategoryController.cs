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
    public class CategoryController : ApiController
    {
        // Get all categories to populate dropdowns
        public IHttpActionResult GetCategories()
        {
            TypescriptExamDBEntities db = new TypescriptExamDBEntities();

            var categoryList = db.Categories
                .OrderBy(x => x.CategoryID)
                .Select(x => new
                {
                    x.CategoryID,
                    x.CategoryName
                })
                .ToList();

            return Ok(categoryList);
        }
    }
}
