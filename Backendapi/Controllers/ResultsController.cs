using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backendapi.Data;
using finalpracticeproject.DTOs;

using Backendapi.Models;

namespace finalpracticeproject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResultsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResultsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Results
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Result>>> GetResults()
        {
            return await _context.Results.ToListAsync();
        }

        // GET: api/Results/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Result>> GetResult(Guid? id)
        {
            var result = await _context.Results.FindAsync(id);

            if (result == null)
            {
                return NotFound();
            }

            return result;
        }

        // PUT: api/Results/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutResult(Guid id, ResultCreateDto resultDto)
        {
            if (id != resultDto.ResultId)
            {
                return BadRequest();
            }

            var result = await _context.Results.FindAsync(id);
            if (result == null)
            {
                return NotFound();
            }

            result.Score = (int)resultDto.Score;
            result.UserId = (Guid)resultDto.UserId;
            result.AssessmentId = (Guid)resultDto.AssessmentId;
            result.AttemptDate = resultDto.AttemptDate;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Results
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Result>> PostResult(ResultCreateDto resultDto)
        {
            var result = new Result
            {
                ResultId = resultDto.ResultId,
                AssessmentId = (Guid)resultDto.AssessmentId,
                UserId = (Guid)resultDto.UserId,
                Score = (int)resultDto.Score,
                AttemptDate = resultDto.AttemptDate
            };

            _context.Results.Add(result);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetResult", new { id = result.ResultId }, result);
        }


        // DELETE: api/Results/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResult(Guid id)
        {
            var result = await _context.Results.FindAsync(id);
            if (result == null)
            {
                return NotFound();
            }

            _context.Results.Remove(result);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ResultExists(Guid? id)
        {
            return _context.Results.Any(e => e.ResultId == id);
        }
    }
}
