using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backendapi.Data;
using Backendapi.Models;
using finalpracticeproject.DTOs;

namespace Backendapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CoursesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
        {
            return await _context.Courses.ToListAsync();
        }

        // GET: api/Courses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourse(Guid id)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
            {
                return NotFound();
            }

            return course;
        }

        // PUT: api/Courses/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCourse(Guid id, CourseCreateDto courseDto)
        {
            if (id != courseDto.CourseId)
            {
                return BadRequest("ID mismatch");
            }

            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            course.Title = courseDto.Title;
            course.Description = courseDto.Description;
            course.InstructorId = courseDto.InstructorId;
            course.MediaUrl = courseDto.MediaUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }


        // POST: api/Courses
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Course>> PostCourse(CourseCreateDto courseDto)
        {
            var course = new Course
            {
                CourseId = courseDto.CourseId,
                Title = courseDto.Title,
                Description = courseDto.Description,
                InstructorId = courseDto.InstructorId,
                MediaUrl = courseDto.MediaUrl
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCourse", new { id = course.CourseId }, course);
        }


        // DELETE: api/Courses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool CourseExists(Guid id)
        {
            return _context.Courses.Any(e => e.CourseId == id);
        }
    }
}
