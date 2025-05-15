using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using finalpracticeproject.DTOs;
using Backendapi.Data;
using Backendapi.Models;

namespace Backendapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssessmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AssessmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Assessments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Assessment>>> GetAssessments()
        {
            return await _context.Assessments.ToListAsync();
        }

        // GET: api/Assessments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Assessment>> GetAssessment(Guid id)
        {
            var assessment = await _context.Assessments.FindAsync(id);

            if (assessment == null)
            {
                return NotFound();
            }

            return assessment;
        }

        // PUT: api/Assessments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAssessment(Guid id, AssessmentCreateDto assessmentDto)
        {
            if (id != assessmentDto.AssessmentId)
            {
                return BadRequest();
            }

            var assessment = await _context.Assessments.FindAsync(id);
            if (assessment == null)
            {
                return NotFound();
            }

            assessment.Title = assessmentDto.Title;
            assessment.Questions = assessmentDto.Questions;
            assessment.MaxScore = (int)assessmentDto.MaxScore;
            assessment.CourseId = (Guid)assessmentDto.CourseId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Assessments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Assessment>> PostAssessment(AssessmentCreateDto assessmentDto)
        {
            var assessment = new Assessment
            {
                AssessmentId = assessmentDto.AssessmentId,
                CourseId = (Guid)assessmentDto.CourseId,
                Title = assessmentDto.Title,
                Questions = assessmentDto.Questions,
                MaxScore = (int)assessmentDto.MaxScore
            };

            _context.Assessments.Add(assessment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAssessment", new { id = assessment.AssessmentId }, assessment);
        }


        // DELETE: api/Assessments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAssessment(Guid id)
        {
            var assessment = await _context.Assessments.FindAsync(id);
            if (assessment == null)
            {
                return NotFound();
            }

            _context.Assessments.Remove(assessment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AssessmentExists(Guid id)
        {
            return _context.Assessments.Any(e => e.AssessmentId == id);
        }
    }
}
