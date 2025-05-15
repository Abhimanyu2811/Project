using System;

namespace finalpracticeproject.DTOs
{
    public class AssessmentCreateDto
    {
        public Guid AssessmentId { get; set; }
        public Guid? CourseId { get; set; }
        public string? Title { get; set; }
        public string? Questions { get; set; }
        public int? MaxScore { get; set; }
    }
}
