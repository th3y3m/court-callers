using BusinessObjects;
using DAOs.Models;
using DAOs.Helper;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class CourtService
    {
        private readonly CourtRepository _courtRepository = null;
        public CourtService()
        {
            if (_courtRepository == null)
            {
                _courtRepository = new CourtRepository();
            }
        }
        public Court AddCourt(CourtModel courtModel) => _courtRepository.AddCourt(courtModel);
        public void DeleteCourt(string id) => _courtRepository.DeleteCourt(id);
        public Court GetCourt(string id) => _courtRepository.GetCourt(id);
        public async Task<(List<Court>, int total)> GetCourts(PageResult pageResult, string searchQuery = null) => await _courtRepository.GetCourts(pageResult, searchQuery);
        public Court UpdateCourt(string id, CourtModel courtModel) => _courtRepository.UpdateCourt(id, courtModel);

        public int GetNumberOfCourtsByBranchId(string branchId) => _courtRepository.GetNumberOfCourtsByBranchId(branchId);
        public List<Court> GetCourtsByStatus(string status) => _courtRepository.GetCourtsByStatus(status);

        public async Task<List<Court>> SortCourt(string? sortBy, bool isAsc, PageResult pageResult) => await _courtRepository.SortCourt(sortBy, isAsc, pageResult);

        public void MaintainCourt(string courtId)
        {
            _courtRepository.MaintainCourt(courtId);

        }

        public List<Court> AvailableCourts(SlotModel slotModel) => _courtRepository.AvailableCourts(slotModel);

        public async Task<(List<Court>,int total)> GetCourtsByBranchId(string branchId, PageResult pageResult, string searchQuery = null)
=> await _courtRepository.GetCourtsByBranchId(branchId, pageResult, searchQuery);
    }

}
