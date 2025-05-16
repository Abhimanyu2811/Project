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
using Microsoft.Extensions.Logging;

namespace Backendapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CoursesController> _logger;

        public CoursesController(AppDbContext context, ILogger<CoursesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCourses()
        {
            try
            {
                _logger.LogInformation("Fetching all courses...");
                
                if (_context.Courses == null)
                {
                    _logger.LogError("Courses DbSet is null");
                    return BadRequest(new { message = "Database context is not properly initialized" });
                }

                var courses = await _context.Courses
                    .Include(c => c.Instructor)
                    .ToListAsync();

                _logger.LogInformation($"Found {courses.Count} courses");

                var response = courses.Select(c => new
                {
                    courseId = c.CourseId,
                    title = c.Title ?? "Untitled Course",
                    description = c.Description ?? "No description available",
                    mediaUrl = c.MediaUrl,
                    instructor = c.Instructor != null ? new
                    {
                        userId = c.Instructor.UserId,
                        name = c.Instructor.Name ?? "Unknown Instructor",
                        email = c.Instructor.Email
                    } : new
                    {
                        userId = Guid.Empty,
                        name = "No Instructor Assigned",
                        email = "N/A"
                    }
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCourses");
                return StatusCode(500, new { 
                    message = "Internal server error while fetching courses",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
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

        // GET: api/Courses/available
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<object>>> GetAvailableCourses()
        {
            try
            {
                _logger.LogInformation("Starting GetAvailableCourses...");
                
                if (_context.Courses == null)
                {
                    _logger.LogError("Courses DbSet is null");
                    return BadRequest(new { message = "Database context is not properly initialized" });
                }

                // Test database connection
                try
                {
                    _logger.LogInformation("Testing database connection...");
                    var canConnect = await _context.Database.CanConnectAsync();
                    if (!canConnect)
                    {
                        _logger.LogError("Cannot connect to database");
                        return BadRequest(new { message = "Cannot connect to database" });
                    }
                    _logger.LogInformation("Database connection successful");
                }
                catch (Exception dbEx)
                {
                    _logger.LogError(dbEx, "Database connection error");
                    return BadRequest(new { 
                        message = "Database connection error", 
                        error = dbEx.Message,
                        stackTrace = dbEx.StackTrace
                    });
                }

                // Get courses with instructor
                _logger.LogInformation("Fetching courses with instructor data...");
                var courses = await _context.Courses
                    .Include(c => c.Instructor)
                    .ToListAsync();

                _logger.LogInformation($"Found {courses.Count} courses");

                if (courses.Count == 0)
                {
                    _logger.LogInformation("No courses found, returning empty list");
                    return Ok(new List<object>());
                }

                // Map to response format
                var response = courses.Select(c => new
                {
                    courseId = c.CourseId,
                    title = c.Title ?? "Untitled Course",
                    description = c.Description ?? "No description available",
                    mediaUrl = c.MediaUrl,
                    instructor = c.Instructor != null ? new
                    {
                        userId = c.Instructor.UserId,
                        name = c.Instructor.Name ?? "Unknown Instructor",
                        email = c.Instructor.Email
                    } : new
                    {
                        userId = Guid.Empty,
                        name = "No Instructor Assigned",
                        email = "N/A"
                    }
                }).ToList();

                _logger.LogInformation("Successfully mapped courses to response format");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAvailableCourses");
                return StatusCode(500, new { 
                    message = "Internal server error while fetching courses",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // POST: api/Courses/{id}/enroll
        [HttpPost("{id}/enroll")]
        public async Task<IActionResult> EnrollInCourse(Guid id)
        {
            var course = await _context.Courses
                .Include(c => c.Instructor)
                .FirstOrDefaultAsync(c => c.CourseId == id);

            if (course == null)
            {
                return NotFound("Course not found");
            }

            // Get the current user from the request
            var userId = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .Include(u => u.Courses)
                .FirstOrDefaultAsync(u => u.UserId == Guid.Parse(userId));

            if (user == null)
            {
                return NotFound("User not found");
            }

            // Check if user is already enrolled
            if (user.Courses.Any(c => c.CourseId == id))
            {
                return BadRequest("Already enrolled in this course");
            }

            // Add course to user's courses
            user.Courses.Add(course);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool CourseExists(Guid id)
        {
            return _context.Courses.Any(e => e.CourseId == id);
        }
    }
}
