using DAOs.Models;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrainingController : ControllerBase
    {
        private readonly ModelTrainingService _modelTrainingService;
        private readonly TrainingService _trainingService;

        public TrainingController(ModelTrainingService modelTrainingService, TrainingService trainingService)
        {
            _modelTrainingService = modelTrainingService;
            _trainingService = trainingService;
        }

        [HttpPost("train-model")]
        public IActionResult TrainModel()
        {
            try
            {
                _modelTrainingService.TrainAndSaveModel();
                return Ok("Model trained and saved successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("weekly-growth")]
        public async Task<ActionResult<(float predictedCount, float growthRate)>> PredictWeeklyBookingGrowth()
        {
            var result = await _trainingService.PredictWeeklyBookingGrowthAsync();
            Console.WriteLine($"Controller result: Predicted Count={result.predictedCount}, Growth Rate={result.growthRate}");
            var response = new MachineResponse
            {
                predictedCount = result.Item1,
                growthRate = result.Item2,
            };
            return Ok(response);
        }
    }
}
