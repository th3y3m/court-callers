using Microsoft.ML;
using Repositories;
using Services.MLModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class TrainingService
    {
        private readonly BookingRepository _bookingRepository = null;
        private readonly TimeSlotRepository _timeSlotRepository = null;
        private readonly MLContext _mlContext;
        private readonly ITransformer _model;

        public TrainingService()
        {
            if (_bookingRepository == null)
            {
                _bookingRepository = new BookingRepository();
            }
            if (_timeSlotRepository == null)
            {
                _timeSlotRepository = new TimeSlotRepository();
            }
            _mlContext = new MLContext();
            var modelPath = Path.Combine(Environment.CurrentDirectory, "data", "Model.zip");
            using (var stream = new FileStream(modelPath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                _model = _mlContext.Model.Load(stream, out var _);
            }
        }


        public async Task<(float predictedCount, float growthRate)> PredictWeeklyBookingGrowthAsync()
        {
            try
            {
                var lastWeekBookings = await _bookingRepository.GetBookingsForLastWeekAsync();
                var lastWeekCount = lastWeekBookings.Count;

                var nextWeekPredictedCount = 0f;

                for (int i = 0; i < 7; i++)
                {
                    var nextWeekDate = DateTime.Today.AddDays(i + 1);
                    var numberOfSlots = await _timeSlotRepository.GetNumberOfSlotsForDateAsync(nextWeekDate);

                    var bookingData = new BookingData
                    {
                        DayOfWeek = (float)nextWeekDate.DayOfWeek,
                        TimeOfDay = 12f,
                        Court = 1f,
                        NumberOfSlot = numberOfSlots
                    };

                    Console.WriteLine($"Predicting for: DayOfWeek={bookingData.DayOfWeek}, TimeOfDay={bookingData.TimeOfDay}, Court={bookingData.Court}, NumberOfSlot={bookingData.NumberOfSlot}");

                    var predictionEngine = _mlContext.Model.CreatePredictionEngine<BookingData, BookingPrediction>(_model);
                    var prediction = predictionEngine.Predict(bookingData);
                    Console.WriteLine($"Prediction: BookingCount={prediction.BookingCount}");
                    nextWeekPredictedCount += prediction.BookingCount;
                }

                var growthRate = ((nextWeekPredictedCount - lastWeekCount) / lastWeekCount) * 100;
                Console.WriteLine($"Next week predicted count: {nextWeekPredictedCount}, Growth rate: {growthRate}");

                return (nextWeekPredictedCount, growthRate);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during prediction: {ex.Message}");
                throw;
            }
        }
    }
}
