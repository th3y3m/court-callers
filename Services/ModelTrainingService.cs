using Services.MLModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class ModelTrainingService
    {
        private readonly ModelTrainer _modelTrainer;

        public ModelTrainingService(ModelTrainer modelTrainer)
        {
            _modelTrainer = modelTrainer;
        }

        public void TrainAndSaveModel()
        {
            _modelTrainer.TrainAndSaveModel();
        }
    }
}
