using System;
using System.IO;
using Microsoft.ML;
using Microsoft.ML.Data;

namespace Services.MLModels
{
    public class BookingData
    {
        [LoadColumn(0)]
        public float DayOfWeek { get; set; }

        [LoadColumn(1)]
        public float TimeOfDay { get; set; }

        [LoadColumn(2)]
        public float Court { get; set; }

        [LoadColumn(3)]
        public float NumberOfSlot { get; set; }

        [LoadColumn(4)]
        public float BookingCount { get; set; }
    }

    public class BookingPrediction
    {
        [ColumnName("Score")]
        public float BookingCount { get; set; }
    }

    public class ModelTrainer
    {
        private readonly string _trainDataPath;
        private readonly string _modelPath;
        private readonly MLContext _mlContext;

        public ModelTrainer(string trainDataPath, string modelPath)
        {
            _trainDataPath = trainDataPath;
            _modelPath = modelPath;
            _mlContext = new MLContext();
        }

        public void TrainAndSaveModel()
        {
            try
            {
                Console.WriteLine("Current Directory: " + Environment.CurrentDirectory);
                Console.WriteLine("Training data path: " + _trainDataPath);

                if (!File.Exists(_trainDataPath))
                {
                    Console.WriteLine($"Training data file not found: {_trainDataPath}");
                    throw new FileNotFoundException("Training data file not found.", _trainDataPath);
                }

                // Load data directly from the file path
                IDataView dataView = _mlContext.Data.LoadFromTextFile<BookingData>(_trainDataPath, hasHeader: true, separatorChar: ',');

                var rowCount = dataView.GetRowCount();
                Console.WriteLine("Number of rows in training data: " + rowCount);

                if (rowCount == 0)
                {
                    throw new InvalidOperationException("Training set has 0 instances, aborting training.");
                }

                // Define data preparation and model training pipeline
                var pipeline = _mlContext.Transforms.CopyColumns(outputColumnName: "Label", inputColumnName: "BookingCount")
                    .Append(_mlContext.Transforms.Concatenate("Features", "DayOfWeek", "TimeOfDay", "Court", "NumberOfSlot"))
                    .AppendCacheCheckpoint(_mlContext) // Add cache checkpoint to pipeline
                    .Append(_mlContext.Regression.Trainers.Sdca());

                // Train model
                var model = pipeline.Fit(dataView);

                // Evaluate model
                Evaluate(model, dataView);

                // Save model
                SaveModel(model, dataView.Schema);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception during model training: {ex.Message}");
                throw;
            }
        }

        private void Evaluate(ITransformer model, IDataView dataView)
        {
            var predictions = model.Transform(dataView);
            var metrics = _mlContext.Regression.Evaluate(predictions, "Label", "Score");

            Console.WriteLine($"R^2: {metrics.RSquared:0.##}");
            Console.WriteLine($"RMS error: {metrics.RootMeanSquaredError:#.##}");
        }

        private void SaveModel(ITransformer model, DataViewSchema schema)
        {
            using (var fs = new FileStream(_modelPath, FileMode.Create, FileAccess.Write, FileShare.Write))
            {
                _mlContext.Model.Save(model, schema, fs);
            }

            Console.WriteLine("The model is saved to {0}", _modelPath);
        }
    }
}
